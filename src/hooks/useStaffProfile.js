import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useStaffProfile(staffProfileId) {
  const [profile, setProfile] = useState(null)
  const [version, setVersion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: profileData, error: profileError } = await supabase
        .from('staff_profiles')
        .select(`
  *,
  colleges(name),
  departments!staff_profiles_department_id_fkey(name),
  units(name),
  designations(title)
`)
        .eq('id', staffProfileId)
        .single()

      if (profileError) {
        setError(profileError)
        setLoading(false)
        return
      }

      const { data: versionData, error: versionError } = await supabase
        .from('profile_versions')
        .select('*')
        .eq('staff_profile_id', staffProfileId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (versionError || !versionData) {
        setError(versionError || { message: 'No approved profile found' })
        setLoading(false)
        return
      }

      setProfile(profileData)
      setVersion(versionData)
      setLoading(false)
    }

    if (staffProfileId) fetchData()
  }, [staffProfileId])

  return { profile, version, loading, error }
}