import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Calendar, Plane, Search, MapPin, Clock, Star, User, CreditCard, LogOut, Zap } from 'lucide-react'
import './App.css'

// Componente de Header/Navegação
function Header({ onAuthClick, onCreditsClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [credits, setCredits] = useState(150)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MilhasRod</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost">Buscar Voos</Button>
            
            {isLoggedIn ? (
              <>
                <Button variant="ghost" onClick={onCreditsClick} className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>{credits} créditos</span>
                </Button>
                <Button variant="ghost" onClick={onCreditsClick}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Comprar Créditos
                </Button>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-600">usuario@exemplo.com</span>
                </div>
                <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsLoggedIn(true)}>Entrar</Button>
                <Button onClick={() => setIsLoggedIn(true)}>Cadastrar</Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

// Componente de Formulário de Busca
function SearchForm({ onSearch }) {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    startDate: '',
    daysToSearch: '7'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchData)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Buscar Passagens com Milhas</span>
        </CardTitle>
        <CardDescription>
          Encontre as melhores ofertas de passagens aéreas usando milhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Origem</span>
              </Label>
              <Input
                id="origin"
                placeholder="Ex: GRU, São Paulo"
                value={searchData.origin}
                onChange={(e) => setSearchData({...searchData, origin: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Destino</span>
              </Label>
              <Input
                id="destination"
                placeholder="Ex: JFK, Nova York"
                value={searchData.destination}
                onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Data de Início</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={searchData.startDate}
                onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysToSearch" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Dias para Pesquisar</span>
              </Label>
              <Select 
                value={searchData.daysToSearch} 
                onValueChange={(value) => setSearchData({...searchData, daysToSearch: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione os dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Search className="h-4 w-4 mr-2" />
            Buscar Voos
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente de Resultados de Busca
function SearchResults({ results, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resultados da Busca</h2>
        <p className="text-gray-600">
          {results.statistics?.total_availability_objects || results.statistics?.total_flights_found || 0} voos encontrados
          {results.error && (
            <span className="ml-2 text-amber-600 text-sm">
              (Dados de demonstração - {results.error})
            </span>
          )}
        </p>
      </div>

      {results.cheapest_days && results.cheapest_days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Dias Mais Baratos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.cheapest_days.slice(0, 6).map((flight, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(flight.date).toLocaleDateString('pt-BR')}
                      </div>
                      {flight.is_cheapest_overall && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Melhor Preço
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {flight.mileage_cost?.toLocaleString()} milhas
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Classe: {flight.cabin === 'economy' ? 'Econômica' : flight.cabin === 'business' ? 'Executiva' : flight.cabin === 'first' ? 'Primeira' : flight.cabin}</div>
                      <div>Programa: {flight.source}</div>
                      {flight.direct !== undefined && (
                        <div>{flight.direct ? 'Voo direto' : `${flight.stops || 1} parada(s)`}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Modal simples para demonstração
function SimpleModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Componente Principal da Página Inicial
function HomePage() {
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  const handleSearch = async (searchData) => {
    setLoading(true)
    try {
      console.log('Dados de busca:', searchData)
      
      // Simular busca com dados de demonstração
      setTimeout(() => {
        setSearchResults({
          statistics: {
            total_availability_objects: 25,
            date_range: {
              start: searchData.startDate,
              end: searchData.startDate,
              days_searched: parseInt(searchData.daysToSearch)
            },
            price_range: {
              min: 25000,
              max: 120000,
              average: 60000
            },
            days_with_availability: 8
          },
          cheapest_days: [
            {
              date: '2025-12-05',
              mileage_cost: 25000,
              cabin: 'economy',
              source: 'united',
              is_cheapest_overall: true
            },
            {
              date: '2025-12-12',
              mileage_cost: 30000,
              cabin: 'economy',
              source: 'delta',
              is_cheapest_overall: false
            },
            {
              date: '2025-12-18',
              mileage_cost: 35000,
              cabin: 'business',
              source: 'american',
              is_cheapest_overall: false
            },
            {
              date: '2025-12-22',
              mileage_cost: 28000,
              cabin: 'economy',
              source: 'smiles',
              is_cheapest_overall: false
            },
            {
              date: '2025-12-28',
              mileage_cost: 45000,
              cabin: 'business',
              source: 'aeroplan',
              is_cheapest_overall: false
            }
          ]
        })
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Erro na busca:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAuthClick={() => setShowAuthModal(true)}
        onCreditsClick={() => setShowCreditsModal(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Encontre as Melhores Passagens com Milhas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare preços em milhas de diferentes programas de fidelidade e encontre as melhores ofertas para sua viagem.
          </p>
        </div>

        <div className="space-y-8">
          <SearchForm onSearch={handleSearch} />
          <SearchResults results={searchResults} loading={loading} />
        </div>
      </main>

      {/* Modais Simples */}
      <SimpleModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        title="Autenticação"
      >
        <div className="space-y-4">
          <p>Funcionalidade de autenticação em desenvolvimento.</p>
          <p>Para demonstração, clique em "Entrar" no header para simular login.</p>
          <Button onClick={() => setShowAuthModal(false)} className="w-full">
            Fechar
          </Button>
        </div>
      </SimpleModal>

      <SimpleModal 
        isOpen={showCreditsModal} 
        onClose={() => setShowCreditsModal(false)}
        title="Comprar Créditos"
      >
        <div className="space-y-4">
          <h3 className="font-semibold">Planos Disponíveis:</h3>
          <div className="space-y-2">
            <div className="p-3 border rounded">
              <div className="font-medium">Pacote Básico</div>
              <div className="text-sm text-gray-600">100 créditos - R$ 9,99</div>
            </div>
            <div className="p-3 border rounded border-blue-500">
              <div className="font-medium">Pacote Padrão ⭐</div>
              <div className="text-sm text-gray-600">500 créditos - R$ 39,99</div>
            </div>
            <div className="p-3 border rounded">
              <div className="font-medium">Pacote Premium</div>
              <div className="text-sm text-gray-600">1000 créditos - R$ 69,99</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Integração com Stripe em desenvolvimento.</p>
          <Button onClick={() => setShowCreditsModal(false)} className="w-full">
            Fechar
          </Button>
        </div>
      </SimpleModal>
    </div>
  )
}

// Componente Principal da Aplicação
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

export default App
