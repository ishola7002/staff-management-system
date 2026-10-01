import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useColleges } from '../../hooks/useColleges.js'
import { useProfileStatus } from '../../hooks/useProfileStatus.js'

function ProfileEditor() {
  const navigate = useNavigate()
  const { colleges } = useColleges()
  const { profile, latestVersion, loading: profileLoading } = useProfileStatus()

  const [staffType, setStaffType] = useState('teaching')
  const [departments, setDepartments] = useState([])
  const [units, setUnits] = useState([])
  const [designations, setDesignations] = useState([])

  const [collegeId, setCollegeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [designationId, setDesignationId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [researchInterests, setResearchInterests] = useState('')
  const [publications, setPublications] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)

  const [googleScholarUrl, setGoogleScholarUrl] = useState('')
  const [scopusUrl, setScopusUrl] = useState('')
  const [orcidUrl, setOrcidUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [researchgateUrl, setResearchgateUrl] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Pre-fill staff type, college, unit and designation from the MOST RECENT
  // version (pending, approved, whatever it is) rather than from staff_profiles,
  // since staff_profiles now only holds the last APPROVED structure.
  // This lets someone re-open a pending edit and see what they actually submitted.
  useEffect(() => {
    if (latestVersion) {
      setStaffType(latestVersion.staff_type || 'teaching')
      setCollegeId(latestVersion.college_id || '')
      setUnitId(latestVersion.unit_id || '')
      setDesignationId(latestVersion.designation_id || '')
    } else if (profile) {
      setStaffType(profile.staff_type)
      setCollegeId(profile.college_id || '')
      setUnitId(profile.unit_id || '')
      setDesignationId(profile.designation_id || '')
    }
  }, [latestVersion, profile])

  useEffect(() => {
    if (latestVersion) {
      setEmail(latestVersion.email || '')
      setPhone(latestVersion.phone || '')
      setBio(latestVersion.bio_qualifications || '')
      setResearchInterests(latestVersion.research_interests || '')
      setPublications(latestVersion.publications || '')
      setGoogleScholarUrl(latestVersion.google_scholar_url || '')
      setScopusUrl(latestVersion.scopus_url || '')
      setOrcidUrl(latestVersion.orcid_url || '')
      setLinkedinUrl(latestVersion.linkedin_url || '')
      setResearchgateUrl(latestVersion.researchgate_url || '')
    }
  }, [latestVersion])

  useEffect(() => {
    async function loadOptions() {
      const { data: unitData } = await supabase.from('units').select('*').order('name')
      setUnits(unitData || [])

      const { data: desigData } = await supabase
        .from('designations')
        .select('*')
        .eq('staff_type', staffType)
        .order('title')
      setDesignations(desigData || [])
    }
    loadOptions()
  }, [staffType])

  useEffect(() => {
    async function loadDepartments() {
      if (!collegeId) {
        setDepartments([])
        return
      }
      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('college_id', collegeId)
        .order('name')
      setDepartments(data || [])
      const savedDeptId = latestVersion?.department_id || profile?.department_id
      if (savedDeptId) {
        setDepartmentId(savedDeptId)
      }
    }
    loadDepartments()
  }, [collegeId, latestVersion, profile])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) {
      setError('You must be logged in.')
      setSubmitting(false)
      return
    }

    // Only the very first submission writes straight to staff_profiles, so a
    // brand new person has somewhere to attach to. From then on, staff_profiles
    // is only ever changed at the moment the admin approves — see ReviewQueue.
    let staffProfileId = profile?.id

    if (!staffProfileId) {
      const { data: newProfile, error: profileError } = await supabase
        .from('staff_profiles')
        .insert({
          auth_user_id: user.id,
          staff_type: staffType,
          college_id: staffType === 'teaching' ? collegeId : null,
          department_id: staffType === 'teaching' ? departmentId : null,
          unit_id: staffType === 'non_teaching' ? unitId : null,
          designation_id: designationId,
        })
        .select()
        .single()

      if (profileError) {
        setError(profileError.message)
        setSubmitting(false)
        return
      }
      staffProfileId = newProfile.id
    }

    let photoUrl = latestVersion?.photo_url || null
    if (photoFile) {
      const filePath = `${user.id}/photo-${Date.now()}.${photoFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('staff-photos')
        .upload(filePath, photoFile, { upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('staff-photos').getPublicUrl(filePath)
      photoUrl = urlData.publicUrl
    }

    let cvStoragePath = latestVersion?.cv_storage_path || null
    if (cvFile) {
      const cvPath = `${user.id}/cv-${Date.now()}.${cvFile.name.split('.').pop()}`
      const { error: cvUploadError } = await supabase.storage
        .from('staff-cvs')
        .upload(cvPath, cvFile, { upsert: true })

      if (cvUploadError) {
        setError(cvUploadError.message)
        setSubmitting(false)
        return
      }
      const { data: cvUrlData } = supabase.storage.from('staff-cvs').getPublicUrl(cvPath)
      cvStoragePath = cvUrlData.publicUrl
    }

    const fullName = [profile?.surname, profile?.first_name, profile?.other_names]
      .filter(Boolean)
      .join(' ')

    const { error: versionError } = await supabase.from('profile_versions').insert({
      staff_profile_id: staffProfileId,
      staff_type: staffType,
      college_id: staffType === 'teaching' ? collegeId : null,
      department_id: staffType === 'teaching' ? departmentId : null,
      unit_id: staffType === 'non_teaching' ? unitId : null,
      designation_id: designationId,
      full_name: fullName,
      email,
      phone,
      bio_qualifications: bio,
      research_interests: staffType === 'teaching' ? researchInterests : null,
      publications: staffType === 'teaching' ? publications : null,
      photo_url: photoUrl,
      cv_storage_path: cvStoragePath,
      google_scholar_url: googleScholarUrl || null,
      scopus_url: scopusUrl || null,
      orcid_url: orcidUrl || null,
      linkedin_url: linkedinUrl || null,
      researchgate_url: researchgateUrl || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    if (versionError) {
      setError(versionError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (profileLoading) return <p className="text-funato-brown-dark">Loading…</p>

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-funato-brown text-2xl font-bold mb-3">Submitted for review</h1>
        <p className="text-funato-brown-dark">
          Your profile has been sent to the admin for approval. You'll be able to check its status from your dashboard.
        </p>
        <button
          onClick={() => navigate('/staff/dashboard')}
          className="mt-5 bg-funato-brown text-funato-cream font-medium py-2 px-4 rounded-md hover:bg-funato-brown-dark transition"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const displayName = profile
    ? [profile.surname, profile.first_name, profile.other_names].filter(Boolean).join(' ')
    : ''

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-1">Edit Your Profile</h1>
      {displayName && <p className="text-funato-brown-dark mb-6">{displayName}</p>}

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setStaffType('teaching')}
          className={`flex-1 py-2 rounded-md font-medium border ${
            staffType === 'teaching'
              ? 'bg-funato-brown text-funato-cream border-funato-brown'
              : 'bg-white text-funato-brown-dark border-funato-brown-light'
          }`}
        >
          Teaching Staff
        </button>
        <button
          type="button"
          onClick={() => setStaffType('non_teaching')}
          className={`flex-1 py-2 rounded-md font-medium border ${
            staffType === 'non_teaching'
              ? 'bg-funato-brown text-funato-cream border-funato-brown'
              : 'bg-white text-funato-brown-dark border-funato-brown-light'
          }`}
        >
          Non-Teaching Staff
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Photo</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="bg-funato-brown text-funato-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition">
              Choose Photo
            </span>
            <span className="text-sm text-funato-brown-dark truncate">
              {photoFile ? photoFile.name : latestVersion?.photo_url ? 'Current photo on file' : 'No photo selected'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">CV (optional, public)</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="bg-funato-brown text-funato-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition">
              Choose CV
            </span>
            <span className="text-sm text-funato-brown-dark truncate">
              {cvFile ? cvFile.name : latestVersion?.cv_storage_path ? 'Current CV on file' : 'No file selected'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {staffType === 'teaching' ? (
          <>
            <div>
              <label className="block text-sm text-funato-brown-dark mb-1">College</label>
              <select
                required
                value={collegeId}
                onChange={(e) => { setCollegeId(e.target.value); setDepartmentId('') }}
                className="w-full border border-funato-brown-light rounded-md px-3 py-2"
              >
                <option value="">Select a college</option>
                {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-funato-brown-dark mb-1">Department</label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!collegeId}
                className="w-full border border-funato-brown-light rounded-md px-3 py-2"
              >
                <option value="">Select a department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-funato-brown-dark mb-1">Unit</label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full border border-funato-brown-light rounded-md px-3 py-2"
            >
              <option value="">Select a unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Designation</label>
          <select
            required
            value={designationId}
            onChange={(e) => setDesignationId(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          >
            <option value="">Select a designation</option>
            {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">
            {staffType === 'teaching' ? 'Qualifications / Bio' : 'Role Description'}
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        {staffType === 'teaching' && (
          <div>
            <label className="block text-sm text-funato-brown-dark mb-1">Research Interests (optional)</label>
            <textarea
              rows={3}
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              className="w-full border border-funato-brown-light rounded-md px-3 py-2"
            />
          </div>
        )}

        <div className="border-t border-funato-brown-light pt-4">
          <p className="text-sm font-medium text-funato-brown-dark mb-3">Professional Links (all optional)</p>
          <div className="space-y-3">
            <input
              value={googleScholarUrl}
              onChange={(e) => setGoogleScholarUrl(e.target.value)}
              placeholder="Google Scholar URL"
              className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
            />
            <input
              value={scopusUrl}
              onChange={(e) => setScopusUrl(e.target.value)}
              placeholder="Scopus URL"
              className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
            />
            <input
              value={orcidUrl}
              onChange={(e) => setOrcidUrl(e.target.value)}
              placeholder="ORCID URL"
              className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
            />
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn URL"
              className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
            />
            <input
              value={researchgateUrl}
              onChange={(e) => setResearchgateUrl(e.target.value)}
              placeholder="ResearchGate URL"
              className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-funato-brown text-funato-cream font-medium py-2 rounded-md hover:bg-funato-brown-dark transition disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  )
}

export default ProfileEditor