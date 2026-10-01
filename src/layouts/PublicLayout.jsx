import { Link, Outlet } from 'react-router-dom'
import funatoLogo from '../assets/funato-logo.png'
import StaffBrowseMenu from "../components/StaffBrowseMenu.jsx";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-funato-cream">
      <header className="bg-funato-brown text-funato-cream">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={funatoLogo} alt="FUNATO logo" className="h-10 w-10 object-contain" />
            <span className="font-bold text-lg">FUNATO Staff Directory</span>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-funato-brown-light">Home</Link>
            <StaffBrowseMenu />
            <Link to="/staff/login" className="hover:text-funato-brown-light">Staff Login</Link>
            <Link to="/admin/login" className="hover:text-funato-brown-light">Admin</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="bg-funato-brown-dark text-funato-cream text-sm text-center py-5">
        © {new Date().getFullYear()} Federal University of Agriculture and Technology, Okeho (FUNATO)
      </footer>
    </div>
  )
}

export default PublicLayout