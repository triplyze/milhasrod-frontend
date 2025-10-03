import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import SearchParametersCard from '@/components/search/SearchParametersCard.jsx'
import SearchResultsCard from '@/components/search/SearchResultsCard.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useAuth } from '@/contexts/AuthContext.jsx'
import apiService from '@/services/api.js'

const PROGRAMS = [
  'american',
  'alaska',
  'aeroplan',
  'delta',
  'united',
  'smiles',
  'flyingblue',
  'qatar',
  'virginatlantic',
  'etihad',
  'azul',
  'turkish',
  'connectmiles',
]

const DEFAULT_FORM = {
  origin: '',
  destination: '',
  startDate: new Date().toISOString().slice(0, 10),
  daysToSearch: 7,
  cabins: ['Y', 'W', 'J', 'F'],
}

const SearchPage = ({ onOpenAuthModal }) => {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [selectedPrograms, setSelectedPrograms] = useState([])
  const [results, setResults] = useState(null)
  const [availabilityIndex, setAvailabilityIndex] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const sourcesCsv = useMemo(() => {
    if (!selectedPrograms.length) return ''
    return selectedPrograms.join(',')
  }, [selectedPrograms])

  const cabinsCsv = useMemo(() => form.cabins.join(','), [form.cabins])

  const validateForm = () => {
    if (!form.origin.trim()) {
      return 'Informe ao menos uma origem válida.'
    }
    if (!form.destination.trim()) {
      return 'Informe ao menos um destino válido.'
    }
    if (!/\d{4}-\d{2}-\d{2}/.test(form.startDate)) {
      return 'Escolha uma data de início no formato YYYY-MM-DD.'
    }
    if (form.daysToSearch < 1 || form.daysToSearch > 14) {
      return 'O intervalo de dias deve estar entre 1 e 14.'
    }
    if (!form.cabins.length) {
      return 'Selecione pelo menos uma cabine.'
    }
    return ''
  }

  const buildAvailabilityIndex = (availabilityList) => {
    const index = {}
    if (Array.isArray(availabilityList)) {
      availabilityList.forEach((item) => {
        if (!item) return
        const key = item.availability_id || item.id
        if (key) {
          index[key] = item
        }
      })
    } else if (availabilityList && typeof availabilityList === 'object') {
      Object.entries(availabilityList).forEach(([key, value]) => {
        index[key] = value
      })
    }
    return index
  }

  const handleSearch = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(true)

    const params = {
      origin: form.origin.trim().toUpperCase(),
      destination: form.destination.trim().toUpperCase(),
      startDate: form.startDate,
      daysToSearch: form.daysToSearch,
      sources: sourcesCsv,
      cabins: cabinsCsv,
    }

    try {
      console.log('telemetry:search_submitted', {
        origin: params.origin,
        destination: params.destination,
        startDate: params.startDate,
        days: params.daysToSearch,
        sourcesCount: selectedPrograms.length || 'all',
        cabins: params.cabins,
      })
      const response = await apiService.searchFlights(params)
      setResults(response)
      setAvailabilityIndex(buildAvailabilityIndex(response?.all_availability))
      setShowPremiumOnly(false)
      if (!response?.cheapest_days?.length) {
        toast('Não encontramos disponibilidade nesse intervalo. Tente alterar os filtros.')
      }
    } catch (err) {
      console.error('Erro ao buscar voos:', err)
      const friendlyMessage = err?.message || 'Erro inesperado ao buscar voos.'
      setError(friendlyMessage)
      toast.error(friendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleProgramToggle = (program) => {
    if (program === 'all') {
      setSelectedPrograms((current) => (current.length ? [] : [...PROGRAMS]))
      return
    }
    setSelectedPrograms((current) => {
      if (!current.length) {
        return [program]
      }
      if (current.includes(program)) {
        const next = current.filter((item) => item !== program)
        return next
      }
      return [...current, program]
    })
  }

  const handleSelectDay = (day) => {
    if (!day?.availabilityId) {
      toast.error('Não foi possível localizar os detalhes desse dia.')
      return
    }

    const availability = availabilityIndex[day.availabilityId] || day

    console.log('telemetry:day_opened', {
      availability_id: day.availabilityId,
      date: day.date,
    })

    navigate(`/detail/${day.availabilityId}`, {
      state: {
        availability,
        date: day.date,
        cabin: day.cabin,
        mileage_cost: day.mileage_cost,
        source: day.source,
        origin: form.origin,
        destination: form.destination,
      },
    })
  }

  return (
    <div className="space-y-8">
      <SearchParametersCard
        form={form}
        onFormChange={setForm}
        onSubmit={handleSearch}
        loading={loading}
        errors={error}
        onProgramToggle={handleProgramToggle}
        selectedPrograms={selectedPrograms}
      />

      <SearchResultsCard
        loading={loading}
        error={error}
        results={results}
        onSelectDay={handleSelectDay}
        showPremiumOnly={showPremiumOnly}
        onTogglePremium={setShowPremiumOnly}
      />

      {hasSearched && !isAuthenticated && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Salve suas buscas e acompanhe créditos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Entre com sua conta para registrar alertas, salvar pesquisas e comprar créditos para pesquisas ilimitadas.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Login seguro Supabase</Badge>
              <Badge variant="outline">Login com Google</Badge>
              <Badge variant="outline">Sincronize com Vercel</Badge>
            </div>
            <Button onClick={onOpenAuthModal} className="w-full sm:w-auto">Entrar ou criar conta</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SearchPage
