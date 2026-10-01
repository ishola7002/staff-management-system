import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function UnitManagement() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [newUnitName, setNewUnitName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadUnits()
  }, [isAdmin, adminLoading, navigate])

  async function loadUnits() {
    setLoading(true)
    const { data } = await supabase.from('units').select('*').order('name')
    setUnits(data || [])
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!newUnitName.trim()) return

    const { error } = await supabase.from('units').insert({ name: newUnitName.trim() })
    if (error) {
      setError(error.message)
    } else {
      setNewUnitName('')
      loadUnits()
    }
  }

  async function handleDelete(unitId) {
    if (!confirm('Delete this unit?')) return
    const { error } = await supabase.from('units').delete().eq('id', unitId)
    if (error) {
      setError(error.message)
    } else {
      loadUnits()
    }
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Units</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={newUnitName}
          onChange={(e) => setNewUnitName(e.target.value)}
          placeholder="New unit name"
          className="flex-1 border border-funato-brown-light rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition"
        >
          Add Unit
        </button>
      </form>

      <ul className="space-y-2">
        {units.map((unit) => (
          <li key={unit.id} className="flex justify-between items-center bg-white border border-funato-brown-light rounded-md px-4 py-3">
            <span className="text-funato-brown-dark font-medium">{unit.name}</span>
            <button
              onClick={() => handleDelete(unit.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UnitManagement