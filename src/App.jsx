import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import Home from './pages/public/Home.jsx'
import CollegePage from './pages/public/CollegePage.jsx'
import Register from './pages/staff/Register.jsx'
import Login from './pages/staff/Login.jsx'
import Dashboard from './pages/staff/Dashboard.jsx'
import ProfileEditor from './pages/staff/ProfileEditor.jsx'
import SubmissionStatus from './pages/staff/SubmissionStatus.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ReviewQueue from './pages/admin/ReviewQueue.jsx'
import DepartmentPage from './pages/public/DepartmentPage.jsx'
import StaffProfile from './pages/public/StaffProfile.jsx'
import UnitsListPage from './pages/public/UnitsListPage.jsx'
import UnitPage from './pages/public/UnitPage.jsx'
import StructureManagement from './pages/admin/StructureManagement.jsx'
import UnitManagement from './pages/admin/UnitManagement.jsx'
import DesignationManagement from './pages/admin/DesignationManagement.jsx'
import StaffManagement from './pages/admin/StaffManagement.jsx'
import StaffStatistics from './pages/admin/StaffStatistics.jsx'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/colleges" element={<Home />} />
        <Route path="/colleges/:collegeId" element={<CollegePage />} />
        <Route path="/staff/register" element={<Register />} />
        <Route path="/staff/login" element={<Login />} />
        <Route path="/staff/dashboard" element={<Dashboard />} />
        <Route path="/staff/profile" element={<ProfileEditor />} />
        <Route path="/staff/status" element={<SubmissionStatus />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/review" element={<ReviewQueue />} />
        <Route path="/departments/:departmentId" element={<DepartmentPage />} />
        <Route path="/staff/:staffProfileId" element={<StaffProfile />} />
        <Route path="/units" element={<UnitsListPage />} />
        <Route path="/units/:unitId" element={<UnitPage />} />
        <Route path="/admin/structure" element={<StructureManagement />} />
        <Route path="/admin/units" element={<UnitManagement />} />
        <Route path="/admin/designations" element={<DesignationManagement />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/statistics" element={<StaffStatistics />} />
      </Route>
    </Routes>
  )
}

export default App