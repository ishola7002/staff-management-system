import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useUnitStaff(unitId) {
  const [unit, setUnit] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single()

      const { data: profiles, error: profilesError } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('unit_id', unitId)
        .eq('status', 'active')

      if (unitError || profilesError) {
        setError(unitError || profilesError)
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

        const seen = new Set()
        versions = (versionData || []).filter((v) => {
          if (seen.has(v.staff_profile_id)) return false
          seen.add(v.staff_profile_id)
          return true
        })
      }

      versions.sort((a, b) => a.full_name.localeCompare(b.full_name))

      setUnit(unitData)
      setStaffList(versions)
      setLoading(false)
    }

    if (unitId) fetchData()
  }, [unitId])

  return { unit, staffList, loading, error }
}