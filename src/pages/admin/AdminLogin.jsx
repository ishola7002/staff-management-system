import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

function AdminLogin() {
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

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .maybeSingle()

    if (!adminData) {
      setError('This account is not registered as an admin.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">Admin Login</h1>
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
        <Link to="/staff/login" className="underline">Staff login instead</Link>
      </p>
    </div>
  )
}

export default AdminLogin