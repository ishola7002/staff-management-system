import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useProfileStatus } from '../../hooks/useProfileStatus.js'

const statusLabels = {
  draft: { text: 'Draft', color: 'bg-gray-200 text-gray-800' },
  pending: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  correction_required: { text: 'Correction Required', color: 'bg-red-100 text-red-800' },
  approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
}

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { profile, latestVersion, loading: profileLoading } = useProfileStatus()

  useEffect(() => {
    async function loadUser() {
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData.session?.user
      if (!sessionUser) {
        navigate('/staff/login')
      } else {
        setUser(sessionUser)
      }
      setLoading(false)
    }
    loadUser()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/staff/login')
  }

  if (loading || profileLoading) return <p className="text-funato-brown-dark">Loading…</p>

  const displayName = profile
    ? [profile.surname, profile.first_name, profile.other_names].filter(Boolean).join(' ')
    : null

  const statusInfo = latestVersion ? statusLabels[latestVersion.status] : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-funato-brown-light rounded-lg p-6 mb-6 flex items-center gap-5">
        {latestVersion?.photo_url ? (
          <img
            src={latestVersion.photo_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-funato-brown-light flex-shrink-0 flex items-center justify-center text-funato-cream font-serif-display text-2xl font-semibold">
            {(displayName || user.email)[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-serif-display text-funato-brown text-2xl font-bold">
            {displayName || 'Welcome'}
          </h1>
          <p className="text-sm text-funato-brown-dark">{user.email}</p>
          {statusInfo && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          )}
          {!latestVersion && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              No profile submitted yet
            </span>
          )}
        </div>
      </div>

      {latestVersion?.status === 'correction_required' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-800 mb-1">Admin requested a correction:</p>
          <p className="text-sm text-red-700">{latestVersion.correction_notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/staff/profile"
          className="bg-funato-brown text-funato-cream rounded-lg p-5 hover:bg-funato-brown-dark transition text-center"
        >
          <p className="font-semibold">
            {latestVersion ? 'Edit Profile' : 'Create Profile'}
          </p>
        </Link>
        <Link
          to="/staff/status"
          className="bg-white border border-funato-brown-light text-funato-brown-dark rounded-lg p-5 hover:shadow-md hover:border-funato-brown transition text-center"
        >
          <p className="font-semibold">View Status</p>
        </Link>
        <button
          onClick={handleLogout}
          className="bg-white border border-funato-brown-light text-funato-brown-dark rounded-lg p-5 hover:shadow-md hover:border-funato-brown transition text-center"
        >
          <p className="font-semibold">Log Out</p>
        </button>
      </div>
    </div>
  )
}

export default Dashboard