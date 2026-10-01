import { useParams, Link } from 'react-router-dom'
import { useUnitStaff } from '../../hooks/useUnitStaff.js'
import StaffCard from '../../components/StaffCard.jsx'

function UnitPage() {
  const { unitId } = useParams()
  const { unit, staffList, loading, error } = useUnitStaff(unitId)

  if (loading) return <p className="text-funato-brown-dark">Loading…</p>
  if (error || !unit) {
    return (
      <div>
        <p className="text-funato-brown-dark">Unit not found.</p>
        <Link to="/units" className="text-funato-brown underline">Back to Units</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/units" className="text-sm text-funato-brown-dark hover:underline">← Back to Units</Link>
      <h1 className="text-funato-brown text-3xl font-bold mt-3 mb-6">{unit.name}</h1>

      {staffList.length === 0 ? (
        <p className="text-funato-brown-dark">No approved staff profiles yet for this unit.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {staffList.map((version) => (
            <StaffCard key={version.id} version={version} isHod={false} />
          ))}
        </div>
      )}
    </div>
  )
}

export default UnitPage