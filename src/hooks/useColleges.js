import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useColleges() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchColleges() {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name')

      if (error) {
        setError(error)
      } else {
        setColleges(data)
      }
      setLoading(false)
    }

    fetchColleges()
  }, [])

  return { colleges, loading, error }
}