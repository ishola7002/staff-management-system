import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const user = data.user

    // First login after registration: create the staff_profiles row
    // from the metadata stashed at signup, if it doesn't exist yet.
    const { data: existingProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      const meta = user.user_metadata || {}

      await supabase.from('staff_profiles').insert({
        auth_user_id: user.id,
        staff_type: meta.staff_type || 'teaching',
        surname: meta.surname || '',
        first_name: meta.first_name || '',
        other_names: meta.other_names || '',
        college_id: meta.college_id || null,
        department_id: meta.department_id || null,
        unit_id: meta.unit_id || null,
      })
    }

    navigate('/staff/dashboard')
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Staff Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="text-sm text-funato-brown-dark mt-4 text-center">
        Don't have an account? <Link to="/staff/register" className="underline">Register</Link>
      </p>
    </div>
  )
}

export default Login