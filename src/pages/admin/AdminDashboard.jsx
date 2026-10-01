import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }

    async function loadCounts() {
      const { count: pending } = await supabase
        .from('profile_versions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: approved } = await supabase
        .from('profile_versions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      setPendingCount(pending || 0)
      setApprovedCount(approved || 0)
    }
    loadCounts()
  }, [isAdmin, adminLoading, navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (adminLoading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-funato-brown text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-funato-brown-dark underline"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-funato-brown-light rounded-lg p-5">
          <p className="text-3xl font-bold text-funato-brown">{pendingCount}</p>
          <p className="text-sm text-funato-brown-dark">Pending Review</p>
        </div>
        <div className="bg-white border border-funato-brown-light rounded-lg p-5">
          <p className="text-3xl font-bold text-funato-brown">{approvedCount}</p>
          <p className="text-sm text-funato-brown-dark">Approved Profiles</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/review"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Review Queue
        </Link>
        <Link
          to="/admin/structure"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Colleges & Departments
        </Link>
        <Link
          to="/admin/units"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Units
        </Link>
        <Link
          to="/admin/designations"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Designations
        </Link>
        <Link
  to="/admin/staff"
  className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
>
  Staff Management
</Link>
<Link
  to="/admin/statistics"
  className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
>
  Statistics
</Link>
      </div>
    </div>
  )
}

export default AdminDashboard