import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Toggle } from '@/components/ui/toggle.jsx'
import { Star, Filter, Plane } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

function formatDate(date) {
  try {
    return format(parseISO(date), "EEE, dd/MM", { locale: ptBR })
  } catch {
    return date
  }
}

const SearchResultsCard = ({
  loading,
  error,
  results,
  onSelectDay,
  showPremiumOnly,
  onTogglePremium,
}) => {
  const filteredDays = useMemo(() => {
    const days = results?.cheapest_days ?? []
    if (!showPremiumOnly) return days
    return days.filter((day) => {
      const cabin = (day.cabin || day.cabin_letter || '').toString().toUpperCase()
      return cabin === 'J' || cabin === 'F' || day.cabin === 'business' || day.cabin === 'first'
    })
  }, [results, showPremiumOnly])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Resultados por dia
          </CardTitle>
          <CardDescription>Buscando as melhores datas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Não foi possível completar a busca</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados por dia</CardTitle>
          <CardDescription>Faça uma pesquisa para ver os valores em milhas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Preencha os parâmetros e clique em pesquisar para começar.</p>
        </CardContent>
      </Card>
    )
  }

  if (!filteredDays.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Resultados por dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não encontramos disponibilidade nesse intervalo. Tente alterar a data, ampliar os dias ou mudar os programas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Resultados por dia
          </CardTitle>
          <CardDescription>
            Exibindo {filteredDays.length} dia(s) com disponibilidade. Total pesquisado: {results?.statistics?.date_range?.days_searched || '-'} dias.
          </CardDescription>
        </div>
        <Toggle
          pressed={showPremiumOnly}
          onPressedChange={onTogglePremium}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Apenas Business/First
        </Toggle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDays.map((day) => {
            const cabinKey = (day.cabin || day.cabin_letter || '').toString().toUpperCase()
            const program = day.source || day.program || day.loyalty_program
            const cost = day.mileage_cost || day.miles || day.lowest_miles
            const availabilityId = day.availability_id || day.id
            const isCheapest = Boolean(day.is_cheapest_overall)
            const formattedCost = typeof cost === 'number' ? cost.toLocaleString('pt-BR') : cost || '-'

            return (
              <button
                key={`${day.date}-${availabilityId}-${program}`}
                type="button"
                onClick={() => onSelectDay({
                  availabilityId,
                  date: day.date,
                  cabin: cabinKey,
                  mileage_cost: cost,
                  source: program,
                })}
                className="rounded-xl border bg-white p-4 text-left transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{formatDate(day.date)}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{formattedCost} milhas</p>
                  </div>
                  {isCheapest && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Melhor preço
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{cabinKey || 'Cabine'}</Badge>
                  {program && <Badge variant="secondary">{program}</Badge>}
                </div>
                {day.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">{day.notes}</p>
                )}
              </button>
            )
          })}
        </div>
        {results?.has_more && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" disabled>
              Carregar mais em breve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SearchResultsCard
