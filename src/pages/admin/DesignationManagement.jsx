import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function DesignationManagement() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newStaffType, setNewStaffType] = useState('teaching')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadDesignations()
  }, [isAdmin, adminLoading, navigate])

  async function loadDesignations() {
    setLoading(true)
    const { data } = await supabase.from('designations').select('*').order('staff_type').order('created_at', { ascending: true })
    setDesignations(data || [])
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!newTitle.trim()) return

    const { error } = await supabase
      .from('designations')
      .insert({ title: newTitle.trim(), staff_type: newStaffType })

    if (error) {
      setError(error.message)
    } else {
      setNewTitle('')
      loadDesignations()
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this designation?')) return
    const { error } = await supabase.from('designations').delete().eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      loadDesignations()
    }
  }

  const teaching = designations.filter((d) => d.staff_type === 'teaching')
  const nonTeaching = designations.filter((d) => d.staff_type === 'non_teaching')

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Designations</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <select
          value={newStaffType}
          onChange={(e) => setNewStaffType(e.target.value)}
          className="border border-funato-brown-light rounded-md px-3 py-2"
        >
          <option value="teaching">Teaching</option>
          <option value="non_teaching">Non-Teaching</option>
        </select>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New designation title"
          className="flex-1 border border-funato-brown-light rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Add
        </button>
      </form>

      <h2 className="text-funato-brown-dark font-semibold mb-2">Teaching</h2>
      <ul className="space-y-2 mb-6">
        {teaching.map((d) => (
          <li key={d.id} className="flex justify-between items-center bg-white border border-funato-brown-light rounded-md px-4 py-3">
            <span className="text-funato-brown-dark font-medium">{d.title}</span>
            <button onClick={() => handleDelete(d.id)} className="text-red-600 text-sm hover:underline">Delete</button>
          </li>
        ))}
      </ul>

      <h2 className="text-funato-brown-dark font-semibold mb-2">Non-Teaching</h2>
      <ul className="space-y-2">
        {nonTeaching.map((d) => (
          <li key={d.id} className="flex justify-between items-center bg-white border border-funato-brown-light rounded-md px-4 py-3">
            <span className="text-funato-brown-dark font-medium">{d.title}</span>
            <button onClick={() => handleDelete(d.id)} className="text-red-600 text-sm hover:underline">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DesignationManagement