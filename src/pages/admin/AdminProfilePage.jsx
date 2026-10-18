import { useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import ProfilePage from "../user/ProfilePage"

const AdminProfilePage = () => {
  const { sidebarOpen, toggleSidebar } = useOutletContext()

  return (
    <div className="admin-page">
      <AdminHeader title="My Profile" subtitle="Your account details and security" sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className="admin-content">
        <ProfilePage embedded />
      </div>
    </div>
  )
}

export default AdminProfilePage
