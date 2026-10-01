import { Link } from 'react-router-dom'
import { useProfileStatus } from '../../hooks/useProfileStatus.js'

const statusLabels = {
  draft: { text: 'Draft', color: 'bg-gray-200 text-gray-800' },
  pending: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  correction_required: { text: 'Correction Required', color: 'bg-red-100 text-red-800' },
  approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
}

function SubmissionStatus() {
  const { profile, latestVersion, loading } = useProfileStatus()

  if (loading) return <p className="text-funato-brown-dark">Loading…</p>

  if (!profile || !latestVersion) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-funato-brown text-2xl font-bold mb-3">No submission yet</h1>
        <p className="text-funato-brown-dark mb-5">You haven't submitted a profile yet.</p>
        <Link
          to="/staff/profile"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition inline-block"
        >
          Create Your Profile
        </Link>
      </div>
    )
  }

  const statusInfo = statusLabels[latestVersion.status] || statusLabels.draft

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-4">Submission Status</h1>

      <div className="bg-white border border-funato-brown-light rounded-lg p-5 mb-5">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        <p className="text-funato-brown-dark mt-3">
          <strong>{latestVersion.full_name}</strong>
        </p>
        {latestVersion.submitted_at && (
          <p className="text-sm text-funato-brown-dark mt-1">
            Submitted: {new Date(latestVersion.submitted_at).toLocaleString()}
          </p>
        )}
        {latestVersion.status === 'correction_required' && latestVersion.correction_notes && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800 mb-1">Admin feedback:</p>
            <p className="text-sm text-red-700">{latestVersion.correction_notes}</p>
          </div>
        )}
      </div>

      <Link
        to="/staff/profile"
        className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition inline-block"
      >
        {latestVersion.status === 'approved' ? 'Edit Profile' : 'Edit Submission'}
      </Link>
    </div>
  )
}

export default SubmissionStatus