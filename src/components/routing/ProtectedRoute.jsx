import { Navigate } from 'react-router-dom'
import { getStoredAuth } from '../../utils/auth'

const ProtectedRoute = ({ children }) => {
  const authData = getStoredAuth()

  if (!authData) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
