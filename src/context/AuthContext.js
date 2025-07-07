import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
  // 1) Checar si ya hay sesión al montar
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session)
    if (data.session) {
      fetchProfile(data.session.user.id)
      navigate('/', { replace: true })
    }
  })

  // 2) Escuchar cambios de auth (login/logout)
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        // si hizo login
        fetchProfile(nextSession.user.id)
        navigate('/', { replace: true })
      } else {
        // si hizo logout
        setProfile(null)
        navigate('/login', { replace: true })
      }
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])


  // Función para traer el profile desde Supabase
// src/context/AuthContext.js
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      students (
        quarter,
        group_name,
        average_grade,
        career
      ),
      professors (
        department,
        title
      )
    `)
    .eq('id', userId)
    .maybeSingle()
  if (error) console.error(error)
  else setProfile(data)
}



  return (
    <AuthContext.Provider value={{ session, profile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext)
