import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useProfileStatus() {
  const [profile, setProfile] = useState(null)
  const [latestVersion, setLatestVersion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      setProfile(profileData)

      if (profileData) {
        const { data: versionData } = await supabase
          .from('profile_versions')
          .select('*')
          .eq('staff_profile_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        setLatestVersion(versionData)
      }

      setLoading(false)
    }
    check()
  }, [])

  return { profile, latestVersion, loading }
}