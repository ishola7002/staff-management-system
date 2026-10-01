import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function StructureManagement() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()

  const [colleges, setColleges] = useState([])
  const [departmentsByCollege, setDepartmentsByCollege] = useState({})
  const [approvedStaffByDept, setApprovedStaffByDept] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newCollegeName, setNewCollegeName] = useState('')
  const [newDeptNames, setNewDeptNames] = useState({})

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [isAdmin, adminLoading, navigate])

  async function loadData() {
    setLoading(true)

    const { data: collegeData } = await supabase.from('colleges').select('*').order('name')
    const { data: deptData } = await supabase.from('departments').select('*').order('name')

    const grouped = {}
    for (const dept of deptData || []) {
      if (!grouped[dept.college_id]) grouped[dept.college_id] = []
      grouped[dept.college_id].push(dept)
    }

    // Load teaching staff with department assignments
    const { data: staffData } = await supabase
      .from('staff_profiles')
      .select('id, department_id')
      .eq('staff_type', 'teaching')
      .not('department_id', 'is', null)

    const staffIds = (staffData || []).map((s) => s.id)

    let staffByDept = {}
    if (staffIds.length > 0) {
      const { data: versionData } = await supabase
        .from('profile_versions')
        .select('staff_profile_id, full_name, created_at')
        .in('staff_profile_id', staffIds)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      // Keep only the latest approved name per staff member
      const seen = new Set()
      const latestNames = {}
      for (const v of versionData || []) {
        if (seen.has(v.staff_profile_id)) continue
        seen.add(v.staff_profile_id)
        latestNames[v.staff_profile_id] = v.full_name
      }

      // Group by department
      for (const staff of staffData) {
        if (!latestNames[staff.id]) continue // skip staff with no approved profile
        if (!staffByDept[staff.department_id]) staffByDept[staff.department_id] = []
        staffByDept[staff.department_id].push({ id: staff.id, full_name: latestNames[staff.id] })
      }
    }

    setColleges(collegeData || [])
    setDepartmentsByCollege(grouped)
    setApprovedStaffByDept(staffByDept)
    setLoading(false)
  }

  async function handleAddCollege(e) {
    e.preventDefault()
    setError(null)
    if (!newCollegeName.trim()) return

    const { error } = await supabase.from('colleges').insert({ name: newCollegeName.trim() })
    if (error) {
      setError(error.message)
    } else {
      setNewCollegeName('')
      loadData()
    }
  }

  async function handleDeleteCollege(collegeId) {
    if (!confirm('Delete this college and all its departments? This cannot be undone.')) return
    const { error } = await supabase.from('colleges').delete().eq('id', collegeId)
    if (error) {
      setError(error.message)
    } else {
      loadData()
    }
  }

  async function handleAddDepartment(collegeId, e) {
    e.preventDefault()
    setError(null)
    const name = (newDeptNames[collegeId] || '').trim()
    if (!name) return

    const { error } = await supabase.from('departments').insert({ college_id: collegeId, name })
    if (error) {
      setError(error.message)
    } else {
      setNewDeptNames((prev) => ({ ...prev, [collegeId]: '' }))
      loadData()
    }
  }

  async function handleDeleteDepartment(deptId) {
    if (!confirm('Delete this department?')) return
    const { error } = await supabase.from('departments').delete().eq('id', deptId)
    if (error) {
      setError(error.message)
    } else {
      loadData()
    }
  }

  async function handleSetHod(deptId, staffProfileId) {
    setError(null)
    const { error } = await supabase
      .from('departments')
      .update({ hod_staff_id: staffProfileId || null })
      .eq('id', deptId)

    if (error) {
      setError(error.message)
    } else {
      loadData()
    }
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Colleges & Departments</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleAddCollege} className="flex gap-2 mb-8">
        <input
          value={newCollegeName}
          onChange={(e) => setNewCollegeName(e.target.value)}
          placeholder="New college name"
          className="flex-1 border border-funato-brown-light rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Add College
        </button>
      </form>

      <div className="space-y-6">
        {colleges.map((college) => (
          <div key={college.id} className="bg-white border border-funato-brown-light rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-funato-brown font-semibold text-lg">{college.name}</h2>
              <button
                onClick={() => handleDeleteCollege(college.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete College
              </button>
            </div>

            <ul className="space-y-2 mb-3">
              {(departmentsByCollege[college.id] || []).map((dept) => {
                const deptStaff = approvedStaffByDept[dept.id] || []
                return (
                  <li key={dept.id} className="bg-funato-cream rounded-md px-3 py-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-funato-brown-dark text-sm font-medium">{dept.name}</span>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-funato-brown-dark">HOD:</label>
                      <select
                        value={dept.hod_staff_id || ''}
                        onChange={(e) => handleSetHod(dept.id, e.target.value)}
                        className="flex-1 border border-funato-brown-light rounded-md px-2 py-1 text-sm"
                        disabled={deptStaff.length === 0}
                      >
                        <option value="">
                          {deptStaff.length === 0 ? 'No approved staff in this department yet' : '— None —'}
                        </option>
                        {deptStaff.map((s) => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </li>
                )
              })}
            </ul>

            <form onSubmit={(e) => handleAddDepartment(college.id, e)} className="flex gap-2">
              <input
                value={newDeptNames[college.id] || ''}
                onChange={(e) => setNewDeptNames((prev) => ({ ...prev, [college.id]: e.target.value }))}
                placeholder="New department name"
                className="flex-1 border border-funato-brown-light rounded-md px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="bg-funato-brown-light text-funato-brown-dark text-sm font-medium px-3 py-1.5 rounded-md hover:bg-funato-brown hover:text-funato-cream transition"
              >
                Add
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StructureManagement