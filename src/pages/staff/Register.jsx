import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useColleges } from '../../hooks/useColleges.js'

function Register() {
  const { colleges } = useColleges()

  const [staffType, setStaffType] = useState('teaching')
  const [surname, setSurname] = useState('')
  const [firstName, setFirstName] = useState('')
  const [otherNames, setOtherNames] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [departments, setDepartments] = useState([])
  const [units, setUnits] = useState([])
  const [unitId, setUnitId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadUnits() {
      const { data } = await supabase.from('units').select('*').order('name')
      setUnits(data || [])
    }
    loadUnits()
  }, [])

  useEffect(() => {
    async function loadDepartments() {
      if (!collegeId) {
        setDepartments([])
        return
      }
      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('college_id', collegeId)
        .order('name')
      setDepartments(data || [])
    }
    loadDepartments()
  }, [collegeId])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          staff_type: staffType,
          surname,
          first_name: firstName,
          other_names: otherNames,
          college_id: staffType === 'teaching' ? collegeId : null,
          department_id: staffType === 'teaching' ? departmentId : null,
          unit_id: staffType === 'non_teaching' ? unitId : null,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-funato-brown text-2xl font-bold mb-3">Check your email</h1>
        <p className="text-funato-brown-dark">
          We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Staff Registration</h1>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setStaffType('teaching')}
          className={`flex-1 py-2 rounded-md font-medium border ${
            staffType === 'teaching'
              ? 'bg-funato-brown text-funato-cream border-funato-brown'
              : 'bg-white text-funato-brown-dark border-funato-brown-light'
          }`}
        >
          Teaching Staff
        </button>
        <button
          type="button"
          onClick={() => setStaffType('non_teaching')}
          className={`flex-1 py-2 rounded-md font-medium border ${
            staffType === 'non_teaching'
              ? 'bg-funato-brown text-funato-cream border-funato-brown'
              : 'bg-white text-funato-brown-dark border-funato-brown-light'
          }`}
        >
          Non-Teaching Staff
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Surname</label>
          <input
            required
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">First Name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Other Names (optional)</label>
          <input
            value={otherNames}
            onChange={(e) => setOtherNames(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        {staffType === 'teaching' ? (
          <>
            <div>
              <label className="block text-sm text-funato-brown-dark mb-1">College</label>
              <select
                required
                value={collegeId}
                onChange={(e) => { setCollegeId(e.target.value); setDepartmentId('') }}
                className="w-full border border-funato-brown-light rounded-md px-3 py-2"
              >
                <option value="">Select a college</option>
                {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-funato-brown-dark mb-1">Department</label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!collegeId}
                className="w-full border border-funato-brown-light rounded-md px-3 py-2"
              >
                <option value="">Select a department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-funato-brown-dark mb-1">Unit</label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full border border-funato-brown-light rounded-md px-3 py-2"
            >
              <option value="">Select a unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-funato-brown-light rounded-md px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-funato-brown text-funato-cream font-medium py-2 rounded-md hover:bg-funato-brown-dark transition disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>

      <p className="text-sm text-funato-brown-dark mt-4 text-center">
        Already have an account? <Link to="/staff/login" className="underline">Log in</Link>
      </p>
    </div>
  )
}

export default Register