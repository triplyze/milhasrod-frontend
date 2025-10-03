import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Zap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useAuth } from '@/contexts/AuthContext.jsx'

function Header({ onOpenAuthModal }) {
  const navigate = useNavigate()
  const { isAuthenticated, user, credits, logout, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            type="button"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
            onClick={() => navigate('/')}
          >
            <Plane className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">MilhasRod</span>
          </button>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>Buscar</Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-sm font-medium">{credits ?? 0} créditos</span>
                </Badge>
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                  <span className="text-xs text-gray-500">{loading ? 'Carregando...' : 'Conectado'}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? 'Saindo...' : 'Sair'}
                </Button>
              </div>
            ) : (
              <Button onClick={onOpenAuthModal}>Entrar</Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
