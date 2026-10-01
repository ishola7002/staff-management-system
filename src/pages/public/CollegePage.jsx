import { useParams, Link } from 'react-router-dom'
import { useDepartments } from '../../hooks/useDepartments.js'

function CollegePage() {
  const { collegeId } = useParams()
  const { college, departments, loading, error } = useDepartments(collegeId)

  if (loading) return <p className="text-funato-brown-dark">Loading…</p>
  if (error || !college) {
    return (
      <div>
        <p className="text-funato-brown-dark">College not found.</p>
        <Link to="/" className="text-funato-brown underline">Back to Home</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-sm text-funato-brown-dark hover:underline">← Back to Colleges</Link>
      <h1 className="text-funato-brown text-3xl font-bold mt-3 mb-6">{college.name}</h1>
      <ul className="space-y-3">
        {departments.map((dept) => (
          <li key={dept.id}>
            <Link
              to={`/departments/${dept.id}`}
              className="block bg-white border border-funato-brown-light rounded-lg p-4 hover:shadow-md hover:border-funato-brown transition"
            >
              <span className="text-funato-brown-dark font-medium">{dept.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollegePage