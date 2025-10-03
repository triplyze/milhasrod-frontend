import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { ArrowLeft, Search, Plane, ChevronRight, Clock, Star } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import apiService from '@/services/api.js'

function formatDate(date) {
  try {
    return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return date
  }
}

const TripDetailPage = () => {
  const { availabilityId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(location.state?.availability || null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headerInfo = useMemo(() => ({
    origin: location.state?.origin || details?.origin || details?.origin_airport || details?.origin_city,
    destination: location.state?.destination || details?.destination || details?.destination_airport || details?.destination_city,
    date: location.state?.date || details?.date,
    cabin: location.state?.cabin || details?.cabin || details?.cabin_letter,
    mileage_cost: location.state?.mileage_cost || details?.mileage_cost || details?.miles,
    source: location.state?.source || details?.source || details?.program,
  }), [location.state, details])

  useEffect(() => {
    let active = true

    const loadTrips = async () => {
      if (!availabilityId) {
        setError('Identificador de disponibilidade inválido.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const response = await apiService.getFlightDetails(availabilityId)
        if (!active) return
        setDetails((prev) => prev || response?.availability || response)
        setTrips(response?.trips || response?.options || [])
        if (!(response?.trips?.length || response?.options?.length)) {
          toast('Não recebemos detalhes adicionais para esta data.')
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err)
        if (!active) return
        const friendlyMessage = err?.message || 'Não foi possível carregar os detalhes da viagem.'
        setError(friendlyMessage)
        toast.error(friendlyMessage)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTrips()

    return () => {
      active = false
    }
  }, [availabilityId])

  const handleBack = () => {
    navigate(-1)
  }

  const handleNewSearch = () => {
    navigate('/')
  }

  const formattedMileage = useMemo(() => {
    const value = headerInfo.mileage_cost
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR')
    }
    return value || '-'
  }, [headerInfo.mileage_cost])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {headerInfo.origin || 'Origem'} → {headerInfo.destination || 'Destino'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {headerInfo.date ? formatDate(headerInfo.date) : 'Data não informada'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para resultados
          </Button>
          <Button onClick={handleNewSearch}>
            <Search className="h-4 w-4 mr-2" />
            Nova busca
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Resumo da disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Programa</p>
            <p className="text-lg font-semibold">{headerInfo.source || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cabine</p>
            <Badge variant="outline" className="w-fit px-3 py-1">
              {headerInfo.cabin || '-'}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Milhas necessárias</p>
            <p className="text-2xl font-semibold text-gray-900">{formattedMileage} milhas</p>
          </div>
          {details?.taxes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Taxas estimadas</p>
              <p className="text-lg font-semibold">
                {details?.taxes?.currency || 'USD'} {details?.taxes?.amount || details?.taxes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os detalhes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="space-y-4">
          {trips.map((trip, index) => {
            const segments = trip.segments || trip.itinerary || []
            const totalMiles = trip.total_miles || trip.miles || trip.mileage_cost || headerInfo.mileage_cost
            const program = trip.program || trip.source || headerInfo.source
            const taxes = trip.taxes

            return (
              <Card key={trip.id || index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{program || 'Programa'}</span>
                    <span className="text-base font-semibold text-blue-600">{typeof totalMiles === 'number' ? totalMiles.toLocaleString('pt-BR') : totalMiles} milhas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {taxes && (
                      <span>Taxas: {typeof taxes === 'object' ? `${taxes.currency || ''} ${taxes.amount || ''}` : taxes}</span>
                    )}
                    {trip.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {trip.duration}</span>}
                    {trip.is_direct && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> Voo direto</span>}
                  </div>
                  <div className="space-y-3">
                    {segments.map((segment, segmentIndex) => {
                      const origin = segment.origin || segment.departure_airport || segment.departure?.airport
                      const destination = segment.destination || segment.arrival_airport || segment.arrival?.airport
                      const departureTime = segment.departure_time || segment.departure?.time || segment.departure
                      const arrivalTime = segment.arrival_time || segment.arrival?.time || segment.arrival
                      const carrier = segment.carrier || segment.airline || segment.marketing_carrier
                      const flightNumber = segment.flight_number || segment.flight || segment.marketing_flight_number
                      const duration = segment.duration
                      const stops = segment.stops || segment.connections

                      return (
                        <div key={segment.id || segmentIndex} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                              <span>{origin || '?'}</span>
                              <ChevronRight className="h-4 w-4 text-blue-500" />
                              <span>{destination || '?'}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {departureTime} → {arrivalTime}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {carrier && (
                              <span>
                                Companhia: {carrier} {flightNumber && `• Voo ${flightNumber}`}
                              </span>
                            )}
                            {duration && <span>Duração: {duration}</span>}
                            {typeof stops === 'number' && (
                              <span>{stops === 0 ? 'Direto' : `${stops} conexão(ões)`}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Nenhum detalhe adicional foi retornado para esta disponibilidade. Tente pesquisar novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TripDetailPage
