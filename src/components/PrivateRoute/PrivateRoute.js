import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Espera a que Auth termine antes de decidir
  if (loading) return null

  // Si no hay sesión, manda a login y guarda a dónde quería ir
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Si hay sesión, renderiza lo protegido
  return <Outlet />
}
