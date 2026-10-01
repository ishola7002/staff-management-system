import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function fieldChanged(current, previous, field) {
  if (!previous) return false
  return current[field] !== previous[field]
}

function ReviewQueue() {
  const navigate = useNavigate()
  const { isAdmin, adminRecord, loading: adminLoading } = useIsAdmin()
  const [pendingVersions, setPendingVersions] = useState([])
  const [designationTitles, setDesignationTitles] = useState({})
  const [collegeNames, setCollegeNames] = useState({})
  const [departmentNames, setDepartmentNames] = useState({})
  const [unitNames, setUnitNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [correctionNotes, setCorrectionNotes] = useState({})
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadLookups()
    loadPending()
  }, [isAdmin, adminLoading, navigate])

  async function loadLookups() {
    const { data: desigData } = await supabase.from('designations').select('id, title')
    const desigMap = {}
    for (const d of desigData || []) desigMap[d.id] = d.title
    setDesignationTitles(desigMap)

    const { data: collegeData } = await supabase.from('colleges').select('id, name')
    const collegeMap = {}
    for (const c of collegeData || []) collegeMap[c.id] = c.name
    setCollegeNames(collegeMap)

    const { data: deptData } = await supabase.from('departments').select('id, name')
    const deptMap = {}
    for (const d of deptData || []) deptMap[d.id] = d.name
    setDepartmentNames(deptMap)

    const { data: unitData } = await supabase.from('units').select('id, name')
    const unitMap = {}
    for (const u of unitData || []) unitMap[u.id] = u.name
    setUnitNames(unitMap)
  }

  async function loadPending() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profile_versions')
      .select('*, staff_profiles(staff_type)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })

    if (!error) {
      const withPrevious = await Promise.all(
        (data || []).map(async (version) => {
          const { data: prevApproved } = await supabase
            .from('profile_versions')
            .select('*')
            .eq('staff_profile_id', version.staff_profile_id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          return { ...version, previousApproved: prevApproved }
        })
      )
      setPendingVersions(withPrevious)
    }
    setLoading(false)
  }

  // Approving does two things: copies the requested structure (staff type,
  // college, department, unit, designation) from this version onto
  // staff_profiles — which is what actually makes it live — and THEN marks
  // the version approved. Nothing on the public site moves until this runs.
  async function handleApprove(version) {
    setActionError(null)

    const { error: profileUpdateError } = await supabase
      .from('staff_profiles')
      .update({
        staff_type: version.staff_type,
        college_id: version.college_id,
        department_id: version.department_id,
        unit_id: version.unit_id,
        designation_id: version.designation_id,
      })
      .eq('id', version.staff_profile_id)

    if (profileUpdateError) {
      setActionError(profileUpdateError.message)
      return
    }

    const { error } = await supabase
      .from('profile_versions')
      .update({
        status: 'approved',
        reviewed_by: adminRecord.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', version.id)

    if (error) {
      setActionError(error.message)
    } else {
      loadPending()
    }
  }

  async function handleRequestCorrection(versionId) {
    setActionError(null)
    const notes = correctionNotes[versionId] || ''
    if (!notes.trim()) {
      setActionError('Please write correction notes before sending back.')
      return
    }

    const { error } = await supabase
      .from('profile_versions')
      .update({
        status: 'correction_required',
        correction_notes: notes,
        reviewed_by: adminRecord.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', versionId)

    if (error) {
      setActionError(error.message)
    } else {
      loadPending()
    }
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Review Queue</h1>

      {actionError && <p className="text-red-600 text-sm mb-4">{actionError}</p>}

      {pendingVersions.length === 0 ? (
        <p className="text-funato-brown-dark">No submissions waiting for review.</p>
      ) : (
        <div className="space-y-5">
          {pendingVersions.map((version) => {
            const isEdit = !!version.previousApproved
            const prev = version.previousApproved
            const changedClass = (field) =>
              fieldChanged(version, prev, field) ? 'bg-yellow-50 border-l-2 border-funato-gold pl-2' : ''

            const designationChanged = isEdit && prev?.designation_id !== version.designation_id
            const structureChanged = isEdit && (
              prev?.college_id !== version.college_id ||
              prev?.department_id !== version.department_id ||
              prev?.unit_id !== version.unit_id
            )

            const structureLabel = version.staff_type === 'teaching'
              ? `${departmentNames[version.department_id] || '—'}, ${collegeNames[version.college_id] || '—'}`
              : unitNames[version.unit_id] || '—'

            const prevStructureLabel = prev
              ? (prev.staff_type === 'teaching'
                  ? `${departmentNames[prev.department_id] || '—'}, ${collegeNames[prev.college_id] || '—'}`
                  : unitNames[prev.unit_id] || '—')
              : null

            return (
              <div key={version.id} className="bg-white border border-funato-brown-light rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-funato-brown font-semibold text-lg ${changedClass('full_name')}`}>
                        {version.full_name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isEdit ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEdit ? 'Profile Update' : 'New Submission'}
                      </span>
                    </div>
                    <p className="text-sm text-funato-brown-dark capitalize">
                      {version.staff_profiles?.staff_type?.replace('_', ' ')} staff
                    </p>
                    <p className={`text-sm mt-1 ${
                      structureChanged
                        ? 'bg-yellow-50 border-l-2 border-funato-gold pl-2 text-funato-brown font-medium'
                        : 'text-funato-brown-dark'
                    }`}>
                      {structureLabel}
                      {structureChanged && (
                        <span className="text-xs text-funato-brown-light ml-2">
                          (was: {prevStructureLabel})
                        </span>
                      )}
                    </p>
                    {version.designation_id && (
                      <p className={`text-sm font-medium mt-1 ${
                        designationChanged
                          ? 'bg-yellow-50 border-l-2 border-funato-gold pl-2 text-funato-brown'
                          : 'text-funato-brown-dark'
                      }`}>
                        Designation: {designationTitles[version.designation_id] || '—'}
                        {designationChanged && prev?.designation_id && (
                          <span className="text-xs text-funato-brown-light ml-2">
                            (was: {designationTitles[prev.designation_id] || '—'})
                          </span>
                        )}
                      </p>
                    )}
                    {isEdit && fieldChanged(version, prev, 'photo_url') && (
                      <p className="text-xs text-funato-brown mt-1 font-medium">📷 Photo updated</p>
                    )}
                    {isEdit && fieldChanged(version, prev, 'cv_storage_path') && (
                      <p className="text-xs text-funato-brown mt-1 font-medium">📄 CV updated</p>
                    )}
                  </div>
                  {version.photo_url && (
                    <img src={version.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                  )}
                </div>

                {isEdit && (
                  <p className="text-xs text-funato-brown-light mb-3">
                    Highlighted fields below changed since the last approved version. Nothing here goes live
                    until you approve — including the department, unit or designation shown above.
                  </p>
                )}

                <p className={`text-sm text-funato-brown-dark mb-1 ${changedClass('email')}`}>
                  <strong>Email:</strong> {version.email}
                </p>
                {version.phone && (
                  <p className={`text-sm text-funato-brown-dark mb-1 ${changedClass('phone')}`}>
                    <strong>Phone:</strong> {version.phone}
                  </p>
                )}
                {version.bio_qualifications && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('bio_qualifications')}`}>
                    {version.bio_qualifications}
                  </p>
                )}
                {version.research_interests && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('research_interests')}`}>
                    <strong>Research:</strong> {version.research_interests}
                  </p>
                )}
                {version.publications && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('publications')}`}>
                    <strong>Publications:</strong> {version.publications}
                  </p>
                )}
                {version.google_scholar_url && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('google_scholar_url')}`}>
                    <strong>Google Scholar:</strong> {version.google_scholar_url}
                  </p>
                )}
                {version.scopus_url && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('scopus_url')}`}>
                    <strong>Scopus:</strong> {version.scopus_url}
                  </p>
                )}
                {version.orcid_url && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('orcid_url')}`}>
                    <strong>ORCID:</strong> {version.orcid_url}
                  </p>
                )}
                {version.linkedin_url && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('linkedin_url')}`}>
                    <strong>LinkedIn:</strong> {version.linkedin_url}
                  </p>
                )}
                {version.researchgate_url && (
                  <p className={`text-sm text-funato-brown-dark mt-2 ${changedClass('researchgate_url')}`}>
                    <strong>ResearchGate:</strong> {version.researchgate_url}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <textarea
                    placeholder="Correction notes (only needed if sending back)"
                    rows={2}
                    value={correctionNotes[version.id] || ''}
                    onChange={(e) =>
                      setCorrectionNotes((prev) => ({ ...prev, [version.id]: e.target.value }))
                    }
                    className="w-full border border-funato-brown-light rounded-md px-3 py-2 text-sm"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(version)}
                      className="bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-800 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestCorrection(version.id)}
                      className="bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-800 transition"
                    >
                      Request Correction
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReviewQueue