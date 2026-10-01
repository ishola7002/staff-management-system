import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function StaffManagement() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadStaff()
  }, [isAdmin, adminLoading, navigate])

  async function loadStaff() {
    setLoading(true)

    const { data: profiles, error: profilesError } = await supabase
      .from('staff_profiles')
      .select(`
        id, staff_type, status, created_at,
        colleges(name),departments!staff_profiles_department_id_fkey(name), units(name), designations(title)
      `)
      .order('created_at', { ascending: false })

    if (profilesError) {
      setError(profilesError.message)
      setLoading(false)
      return
    }

    const profileIds = profiles.map((p) => p.id)
    let latestNames = {}

    if (profileIds.length > 0) {
      const { data: versions } = await supabase
        .from('profile_versions')
        .select('staff_profile_id, full_name, created_at')
        .in('staff_profile_id', profileIds)
        .order('created_at', { ascending: false })

      const seen = new Set()
      for (const v of versions || []) {
        if (seen.has(v.staff_profile_id)) continue
        seen.add(v.staff_profile_id)
        latestNames[v.staff_profile_id] = v.full_name
      }
    }

    const combined = profiles.map((p) => ({
      ...p,
      full_name: latestNames[p.id] || '(no submission yet)',
    }))

    setStaffList(combined)
    setLoading(false)
  }

  async function handleToggleStatus(staffId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    if (!confirm(`Mark this staff member as ${newStatus}?`)) return

    const { error } = await supabase
      .from('staff_profiles')
      .update({ status: newStatus })
      .eq('id', staffId)

    if (error) {
      setError(error.message)
    } else {
      loadStaff()
    }
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Staff Management</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {staffList.length === 0 ? (
        <p className="text-funato-brown-dark">No staff profiles yet.</p>
      ) : (
        <div className="space-y-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="bg-white border border-funato-brown-light rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-funato-brown font-semibold">{staff.full_name}</p>
                <p className="text-sm text-funato-brown-dark">
                  {staff.designations?.title || '—'} ·{' '}
                  {staff.staff_type === 'teaching'
                    ? `${staff.departments?.name || ''}, ${staff.colleges?.name || ''}`
                    : staff.units?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    staff.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {staff.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleStatus(staff.id, staff.status)}
                  className="text-sm text-funato-brown-dark underline"
                >
                  {staff.status === 'active' ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StaffManagement