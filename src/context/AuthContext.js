import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // 1) Cargar sesión al montar (SIN navegar)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const s = data?.session ?? null
      setSession(s)
      if (s) fetchProfile(s.user.id).finally(() => mounted && setLoading(false))
      else setLoading(false)
    })

    // 2) Suscripción a cambios de auth (SIN navegar)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next) fetchProfile(next.user.id)
      else setProfile(null)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          students (
            quarter,
            group_name,
            average_grade,
            program_id,
            programs ( id, name )
          ),
          professors (
            department,
            title,
            is_lab_admin
          )
        `)
        .eq('id', userId)
        .maybeSingle()
      if (error) throw error
      setProfile(data)
    } catch (e) {
      console.error('fetchProfile error', e)
      setProfile(null)
    }
  }

  const value = useMemo(() => ({ session, profile, loading }), [session, profile, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
