import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return null // puedes poner un spinner aquí

  if (!session) {
    // manda a login recordando a dónde quería ir
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
