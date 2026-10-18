import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import {
  AdminLoading,
  AdminSectionError,
  AdminEmpty,
  AdminPagination
} from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { formatDate, formatRole } from "../../utils/formatters"
import { getUsers } from "../../services/admin.service"

const ROLE_FILTERS = [
  { id: "", label: "All" },
  { id: "user", label: "Users" },
  { id: "admin", label: "Admins" },
  { id: "super-admin", label: "Super Admin" }
]

const PAGE_SIZE = 20


const AdminUsersPage = () => {
  const outletContext = useOutletContext()
  const requestVersion = useRef(0)

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE })
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")

  const [role, setRole] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const loadUsers = useCallback(async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setListError("")
    try {
      const data = await getUsers({
        role: role || undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE
      })

      if (version !== requestVersion.current) return
      if (data?.success && Array.isArray(data.users)) {
        setUsers(data.users)
        setPagination(data.pagination || { page, pages: 1, total: data.users.length, limit: PAGE_SIZE })
      } else {
        setListError(data?.message || "We couldn't load the users.")
      }
    } catch (err) {
      if (version !== requestVersion.current) return
      setListError(describeApiError(err, "We couldn't load the users."))
      setUsers([])
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [role, search, page])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const clearFilters = () => {
    setRole("")
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const hasFilters = Boolean(role || search)

  return (
    <div className="admin-page">
      <AdminHeader
        title="Users"
        subtitle="Registered customers and administrators"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <button type="button" className="admin-btn" onClick={loadUsers} disabled={loading}>
            {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
          </button>
        }
      />

      <div className="admin-content">
        <section className="admin-panel admin-panel--wide" data-panel="user-list" aria-label="User list">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">All Users</h2>
              <p className="admin-panel-sub">
                {loading ? "Loading users…" : `${pagination.total} ${pagination.total === 1 ? "user" : "users"} found.`}
              </p>
            </div>
          </div>

          <form className="admin-filter-bar" data-panel="user-filters" onSubmit={handleSearchSubmit}>
            <div className="admin-field">
              <label htmlFor="filter-user-role">Role</label>
              <select
                id="filter-user-role"
                className="admin-input"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  setPage(1)
                }}
              >
                {ROLE_FILTERS.map((f) => (
                  <option key={f.id || "all"} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field admin-field--grow">
              <label htmlFor="filter-user-search">Search</label>
              <input
                id="filter-user-search"
                type="search"
                className="admin-input"
                placeholder="Name or email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              Search
            </button>
            {hasFilters && (
              <button type="button" className="admin-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </form>

          {loading && <AdminLoading>Loading users…</AdminLoading>}
          {!loading && listError && <AdminSectionError message={listError} onRetry={loadUsers} />}
          {!loading && !listError && users.length === 0 && (
            <AdminEmpty>No users {hasFilters ? "match these filters" : "found"}.</AdminEmpty>
          )}

          {!loading && !listError && users.length > 0 && (
            <>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <caption className="visually-hidden">Registered users</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Role</th>
                      <th scope="col">Joined</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="admin-cell-strong">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-badge ${["admin", "super-admin"].includes(u.role) ? "admin-badge--ok" : "admin-badge--muted"}`}>
                            {formatRole(u.role)}
                          </span>
                        </td>
                        <td className="admin-nowrap">{formatDate(u.createdAt)}</td>
                        <td>
                          <Link to={`/admin/users/${u._id}`} className="admin-link-btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit || PAGE_SIZE}
                onPageChange={setPage}
                disabled={loading}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminUsersPage
