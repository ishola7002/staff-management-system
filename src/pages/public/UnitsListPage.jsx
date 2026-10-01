import { Link } from 'react-router-dom'
import { useUnits } from '../../hooks/useUnits.js'

function UnitsListPage() {
  const { units, loading, error } = useUnits()

  return (
    <div>
      <h1 className="text-funato-brown text-3xl font-bold mb-6">Non-Teaching Units</h1>

      {loading && <p className="text-funato-brown-dark">Loading units…</p>}
      {error && <p className="text-red-600">Failed to load units.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {units.map((unit) => (
          <Link
            key={unit.id}
            to={`/units/${unit.id}`}
            className="block bg-white border border-funato-brown-light rounded-lg p-5 hover:shadow-md hover:border-funato-brown transition"
          >
            <h3 className="text-funato-brown font-semibold">{unit.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default UnitsListPage