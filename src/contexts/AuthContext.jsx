import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getSession, signOut as supabaseSignOut } from '../lib/supabase'
import apiService from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    // Verificar sessão inicial
    const initializeAuth = async () => {
      try {
        const currentSession = await getSession()
        const currentUser = await getCurrentUser()
        
        setSession(currentSession)
        setUser(currentUser)
        
        if (currentSession?.access_token) {
          apiService.setAuthToken(currentSession.access_token)
          await fetchCredits()
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.access_token) {
          apiService.setAuthToken(session.access_token)
          await fetchCredits()
        } else {
          apiService.setAuthToken(null)
          setCredits(0)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await apiService.getCredits()
      setCredits(response.balance || 0)
    } catch (error) {
      console.error('Erro ao buscar créditos:', error)
      setCredits(0)
    }
  }

  const refreshCredits = () => {
    if (session?.access_token) {
      fetchCredits()
    }
  }

  const value = {
    user,
    session,
    loading,
    credits,
    refreshCredits,
    async logout() {
      await supabaseSignOut()
      setUser(null)
      setSession(null)
      setCredits(0)
    },
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
