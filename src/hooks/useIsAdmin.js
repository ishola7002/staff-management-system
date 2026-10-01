import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRecord, setAdminRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      setAdminRecord(data)
      setIsAdmin(!!data)
      setLoading(false)
    }
    check()
  }, [])

  return { isAdmin, adminRecord, loading }
}