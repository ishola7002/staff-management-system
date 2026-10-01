import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function StaffStatistics() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [loading, setLoading] = useState(true)
  const [totalStaff, setTotalStaff] = useState(0)
  const [totalTeaching, setTotalTeaching] = useState(0)
  const [totalNonTeaching, setTotalNonTeaching] = useState(0)
  const [collegeStats, setCollegeStats] = useState([])
  const [unitStats, setUnitStats] = useState([])

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadStats()
  }, [isAdmin, adminLoading, navigate])

  async function loadStats() {
    setLoading(true)

    const { data: colleges } = await supabase.from('colleges').select('id, name').order('name')
    const { data: departments } = await supabase.from('departments').select('id, name, college_id').order('name')
    const { data: units } = await supabase.from('units').select('id, name').order('name')
    const { data: staff } = await supabase
      .from('staff_profiles')
      .select('staff_type, department_id, unit_id, status')
      .eq('status', 'active')

    const activeStaff = staff || []
    setTotalStaff(activeStaff.length)
    setTotalTeaching(activeStaff.filter((s) => s.staff_type === 'teaching').length)
    setTotalNonTeaching(activeStaff.filter((s) => s.staff_type === 'non_teaching').length)

    const deptCounts = {}
    for (const s of activeStaff) {
      if (s.department_id) {
        deptCounts[s.department_id] = (deptCounts[s.department_id] || 0) + 1
      }
    }

    const collegesWithData = (colleges || []).map((college) => {
      const collegeDepartments = (departments || []).filter((d) => d.college_id === college.id)
      const departmentBreakdown = collegeDepartments.map((d) => ({
        name: d.name,
        count: deptCounts[d.id] || 0,
      }))
      const collegeTotal = departmentBreakdown.reduce((sum, d) => sum + d.count, 0)
      return { name: college.name, total: collegeTotal, departments: departmentBreakdown }
    })
    setCollegeStats(collegesWithData)

    const unitCounts = {}
    for (const s of activeStaff) {
      if (s.unit_id) {
        unitCounts[s.unit_id] = (unitCounts[s.unit_id] || 0) + 1
      }
    }
    const unitsWithData = (units || []).map((u) => ({
      name: u.name,
      count: unitCounts[u.id] || 0,
    }))
    setUnitStats(unitsWithData)

    setLoading(false)
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Staff Statistics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-funato-brown-light rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-funato-brown">{totalStaff}</p>
          <p className="text-sm text-funato-brown-dark">Total Active Staff</p>
        </div>
        <div className="bg-white border border-funato-brown-light rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-funato-brown">{totalTeaching}</p>
          <p className="text-sm text-funato-brown-dark">Teaching</p>
        </div>
        <div className="bg-white border border-funato-brown-light rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-funato-brown">{totalNonTeaching}</p>
          <p className="text-sm text-funato-brown-dark">Non-Teaching</p>
        </div>
      </div>

      <h2 className="font-serif-display text-funato-brown text-xl font-semibold mb-4">By College</h2>
      <div className="space-y-4 mb-8">
        {collegeStats.map((college) => (
          <div key={college.name} className="bg-white border border-funato-brown-light rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-funato-brown font-semibold">{college.name}</h3>
              <span className="text-sm font-medium text-funato-brown-dark bg-funato-cream px-3 py-1 rounded-full">
                {college.total} staff
              </span>
            </div>
            <ul className="space-y-1">
              {college.departments.map((dept) => (
                <li key={dept.name} className="flex justify-between text-sm text-funato-brown-dark">
                  <span>{dept.name}</span>
                  <span className="font-medium">{dept.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="font-serif-display text-funato-brown text-xl font-semibold mb-4">By Unit</h2>
      <div className="bg-white border border-funato-brown-light rounded-lg p-5">
        <ul className="space-y-2">
          {unitStats.map((unit) => (
            <li key={unit.name} className="flex justify-between text-sm text-funato-brown-dark">
              <span>{unit.name}</span>
              <span className="font-medium">{unit.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default StaffStatistics