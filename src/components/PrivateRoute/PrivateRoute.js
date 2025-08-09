import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
  const { session } = useAuth()
  // Si no hay sesión, redirige al login
  if (!session) return <Navigate to="/login" replace />
  // Si hay, renderiza las rutas hijas
  return <Outlet />
}
