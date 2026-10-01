import { useParams, Link } from 'react-router-dom'
import { useDepartmentStaff } from '../../hooks/useDepartmentStaff.js'
import StaffCard from '../../components/StaffCard.jsx'

function DepartmentPage() {
  const { departmentId } = useParams()
  const { department, staffList, loading, error } = useDepartmentStaff(departmentId)

  if (loading) return <p className="text-funato-brown-dark">Loading…</p>
  if (error || !department) {
    return (
      <div>
        <p className="text-funato-brown-dark">Department not found.</p>
        <Link to="/" className="text-funato-brown underline">Back to Home</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/colleges/${department.college_id}`} className="text-sm text-funato-brown-dark hover:underline">
        ← Back to {department.colleges?.name}
      </Link>
      <h1 className="text-funato-brown text-3xl font-bold mt-3 mb-6">{department.name}</h1>

      {staffList.length === 0 ? (
        <p className="text-funato-brown-dark">No approved staff profiles yet for this department.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {staffList.map((version) => (
            <StaffCard
              key={version.id}
              version={version}
              isHod={version.staff_profile_id === department.hod_staff_id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DepartmentPage