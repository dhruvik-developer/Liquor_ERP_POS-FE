import { Navigate, useLocation } from 'react-router-dom'
import { getDefaultRouteForRole, getIsAdminUser, getStoredAuth } from '../../utils/auth'

const ProtectedRoute = ({ children, allowedRole = 'any' }) => {
  const authData = getStoredAuth()
  const location = useLocation()

  if (!authData) {
    return <Navigate to="/login" replace />
  }

  const isAdmin = getIsAdminUser(authData)
  const role = isAdmin ? 'admin' : 'staff'

  if (allowedRole !== 'any' && allowedRole !== role) {
    const currentPath = location.pathname || ''
    const redirectedPath = role === 'admin'
      ? currentPath.replace(/^\/pos\b/, '/admin')
      : currentPath.replace(/^\/admin\b/, '/pos')
    const targetPath = redirectedPath !== currentPath ? redirectedPath : getDefaultRouteForRole(authData)

    return <Navigate to={`${targetPath}${location.search || ''}`} replace />
  }

  return children
}

export default ProtectedRoute
