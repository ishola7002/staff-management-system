import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useDepartments(collegeId) {
  const [college, setCollege] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: collegeData, error: collegeError } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single()

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('college_id', collegeId)
        .order('name')

      if (collegeError || deptError) {
        setError(collegeError || deptError)
      } else {
        setCollege(collegeData)
        setDepartments(deptData)
      }
      setLoading(false)
    }

    if (collegeId) fetchData()
  }, [collegeId])

  return { college, departments, loading, error }
}