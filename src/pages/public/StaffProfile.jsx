import { useParams, Link } from 'react-router-dom'
import { useStaffProfile } from '../../hooks/useStaffProfile.js'

const linkFields = [
  { key: 'google_scholar_url', label: 'Google Scholar' },
  { key: 'scopus_url', label: 'Scopus' },
  { key: 'orcid_url', label: 'ORCID' },
  { key: 'linkedin_url', label: 'LinkedIn' },
  { key: 'researchgate_url', label: 'ResearchGate' },
]

function StaffProfile() {
  const { staffProfileId } = useParams()
  const { profile, version, loading, error } = useStaffProfile(staffProfileId)

  if (loading) return <p className="text-funato-brown-dark">Loading…</p>

  if (error || !profile || !version) {
    return (
      <div>
        <p className="text-funato-brown-dark">Profile not found or not yet approved.</p>
        <Link to="/" className="text-funato-brown underline">Back to Home</Link>
      </div>
    )
  }

  const isTeaching = profile.staff_type === 'teaching'
  const backLink = isTeaching
    ? `/departments/${profile.department_id}`
    : `/units/${profile.unit_id}`

  const backLabel = isTeaching
    ? profile.departments?.name
    : profile.units?.name

  const activeLinks = linkFields.filter((f) => version[f.key])
  const hasPublicationsContent = version.publications || activeLinks.length > 0

  return (
    <div className="max-w-5xl mx-auto">
      <Link to={backLink} className="text-sm text-funato-brown-dark hover:underline">
        ← Back to {backLabel}
      </Link>

      <div className="bg-white border border-funato-brown-light rounded-lg p-6 mt-4">
        <div className="flex gap-8">
          {/* LEFT: Image */}
          <div className="flex-shrink-0 w-56">
            {version.photo_url ? (
              <img
                src={version.photo_url}
                alt={version.full_name}
                className="w-full h-auto object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-funato-brown-light rounded-lg" />
            )}
          </div>

          {/* RIGHT: Content */}
          <div className="flex-1">
            <h1 className="font-serif-display text-funato-brown text-3xl font-bold">{version.full_name}</h1>
            
            {profile.designations?.title && (
              <p className="text-funato-brown-dark font-medium text-lg mt-1">{profile.designations.title}</p>
            )}
            
            <p className="text-funato-brown-dark mt-2">
              {isTeaching
                ? `${profile.departments?.name || ''}${profile.colleges?.name ? ', ' + profile.colleges.name : ''}`
                : profile.units?.name}
            </p>
            
            {version.email && (
              <p className="text-sm text-funato-brown-light mt-2">{version.email}</p>
            )}
            
            {version.phone && (
              <p className="text-sm text-funato-brown-light">{version.phone}</p>
            )}

            {version.bio_qualifications && (
              <div className="mt-6">
                <h2 className="text-funato-brown font-semibold mb-2">
                  {isTeaching ? 'Qualifications' : 'Role'}
                </h2>
                <p className="text-funato-brown-dark whitespace-pre-line leading-relaxed">{version.bio_qualifications}</p>
              </div>
            )}

            {isTeaching && version.research_interests && (
              <div className="mt-4">
                <h2 className="text-funato-brown font-semibold mb-2">Research Interests</h2>
                <p className="text-funato-brown-dark whitespace-pre-line leading-relaxed">{version.research_interests}</p>
              </div>
            )}

            {hasPublicationsContent && (
              <div className="mt-4">
                <h2 className="text-funato-brown font-semibold mb-2">Professional Links</h2>

                {version.publications && (
                  <p className="text-funato-brown-dark whitespace-pre-line leading-relaxed mb-3">{version.publications}</p>
                )}

                {activeLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeLinks.map(function (f) {
                      return (
                        <a
                          key={f.key}
                          href={version[f.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-funato-cream text-funato-brown-dark px-3 py-1.5 rounded-full border border-funato-brown-light hover:bg-funato-brown hover:text-funato-cream transition"
                        >
                          {f.label}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {version.cv_storage_path && (
              <div className="mt-4">
                <h2 className="text-funato-brown font-semibold mb-2">CV</h2>
                <a
                  href={version.cv_storage_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs bg-funato-brown text-funato-cream px-3 py-1.5 rounded-full hover:bg-funato-brown-dark transition"
                >
                  View CV
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile