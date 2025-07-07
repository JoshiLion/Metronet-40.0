import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate              = useNavigate()

  useEffect(() => {
    // 1) Al montar, comprueba si ya hay sesión guardada
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        fetchProfile(data.session.user.id)
        navigate('/', { replace: true })
      }
    })

    // 2) Escucha cambios de auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        if (nextSession) {
          fetchProfile(nextSession.user.id)
          navigate('/', { replace: true })
        } else {
          setProfile(null)
          navigate('/login', { replace: true })
        }
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // Trae profile + students + students→programs + professors
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        students (
          quarter,
          group_name,
          average_grade,
          program_id,
          programs (
            id,
            name
          )
        ),
        professors (
          department,
          title,
          is_lab_admin
        )
      `)
      .eq('id', userId)
      .maybeSingle()

    if (error) console.error('fetchProfile error', error)
    else setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ session, profile }}>
      {children}
    </AuthContext.Provider>
  )
}
