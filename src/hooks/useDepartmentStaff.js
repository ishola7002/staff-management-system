import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useDepartmentStaff(departmentId) {
  const [department, setDepartment] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*, colleges(name)')
        .eq('id', departmentId)
        .single()

      const { data: profiles, error: profilesError } = await supabase
  .from('staff_profiles')
  .select('id')
  .eq('department_id', departmentId)
  .eq('status', 'active')

      if (deptError || profilesError) {
        setError(deptError || profilesError)
        setLoading(false)
        return
      }

      const profileIds = profiles.map((p) => p.id)

      let versions = []
      if (profileIds.length > 0) {
        const { data: versionData } = await supabase
          .from('profile_versions')
          .select('*')
          .in('staff_profile_id', profileIds)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        // Keep only the latest approved version per staff member
        const seen = new Set()
        versions = (versionData || []).filter((v) => {
          if (seen.has(v.staff_profile_id)) return false
          seen.add(v.staff_profile_id)
          return true
        })
      }

      // Put the HOD first, if they have an approved profile
      versions.sort((a, b) => {
        if (a.staff_profile_id === deptData.hod_staff_id) return -1
        if (b.staff_profile_id === deptData.hod_staff_id) return 1
        return a.full_name.localeCompare(b.full_name)
      })

      setDepartment(deptData)
      setStaffList(versions)
      setLoading(false)
    }

    if (departmentId) fetchData()
  }, [departmentId])

  return { department, staffList, loading, error }
}