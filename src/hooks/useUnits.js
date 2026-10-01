import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useUnits() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUnits() {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (error) {
        setError(error)
      } else {
        setUnits(data)
      }
      setLoading(false)
    }

    fetchUnits()
  }, [])

  return { units, loading, error }
}