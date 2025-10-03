import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar as CalendarIcon, Search, Info } from 'lucide-react'
import { format } from 'date-fns'
import AirportAutocomplete from './AirportAutocomplete.jsx'

const cabinOptions = [
  { label: 'Economy', value: 'Y' },
  { label: 'Premium', value: 'W' },
  { label: 'Business', value: 'J' },
  { label: 'First', value: 'F' },
]

const programOptions = [
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

const popularOrigins = ['GRU', 'CGH', 'VCP', 'GIG', 'SDU', 'CNF', 'BSB']
const popularDestinations = ['JFK', 'EWR', 'MIA', 'MCO', 'FLL', 'LAX', 'YYZ', 'YUL', 'LIS', 'MAD', 'CDG']

const SearchParametersCard = ({
  form,
  onFormChange,
  onSubmit,
  loading,
  errors,
  onProgramToggle,
  selectedPrograms,
}) => {
  const sliderValue = useMemo(() => [form.daysToSearch], [form.daysToSearch])

  const allProgramsSelected = selectedPrograms.length === 0 || selectedPrograms.length === programOptions.length

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.()
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Parâmetros da busca
          </CardTitle>
          <CardDescription>
            Ajuste os detalhes da viagem para encontrar os melhores custos em milhas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AirportAutocomplete
            id="origin"
            label="Origem"
            placeholder="Ex.: GRU, VCP"
            value={form.origin}
            onChange={(value) => onFormChange({ ...form, origin: value })}
            helperText="Digite o nome da cidade, aeroporto ou código IATA"
          />
          <AirportAutocomplete
            id="destination"
            label="Destino"
            placeholder="Ex.: JFK, MIA"
            value={form.destination}
            onChange={(value) => onFormChange({ ...form, destination: value })}
            helperText="Você pode informar vários destinos separados por vírgula"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              Data de início
            </Label>
            <input
              id="startDate"
              type="date"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={form.startDate}
              max="9999-12-31"
              onChange={(event) => onFormChange({ ...form, startDate: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {form.startDate ? `Iniciando em ${format(new Date(form.startDate), 'dd/MM/yyyy')}` : 'Escolha a data da primeira busca'}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Intervalo de dias (1–14)
            </Label>
            <Slider
              value={sliderValue}
              onValueChange={(value) => onFormChange({ ...form, daysToSearch: value[0] })}
              min={1}
              max={14}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Pesquisando {form.daysToSearch} dia(s)</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cabines</Label>
          <ToggleGroup
            type="multiple"
            className="flex flex-wrap"
            value={form.cabins}
            onValueChange={(value) => onFormChange({ ...form, cabins: value.length ? value : ['Y'] })}
          >
            {cabinOptions.map((cabin) => (
              <ToggleGroupItem key={cabin.value} value={cabin.value} className="flex-1 min-w-[120px]">
                {cabin.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">Pelo menos uma cabine deve ser selecionada.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="flex items-center gap-2">
              Programas de fidelidade
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onProgramToggle('all')}
            >
              {allProgramsSelected ? 'Limpar' : 'Selecionar todos'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {programOptions.map((program) => {
              const isActive = selectedPrograms.includes(program) || selectedPrograms.length === 0
              return (
                <Badge
                  key={program}
                  variant={isActive ? 'default' : 'outline'}
                  className={`cursor-pointer px-3 py-1 ${isActive ? 'bg-blue-600 text-white hover:bg-blue-500' : ''}`}
                  onClick={() => onProgramToggle(program)}
                >
                  {program}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-600" />
          <p>
            Ex.: Origem=GRU, Destino=JFK, Início=2025-10-01, Dias=7. Pressione Enter para pesquisar rapidamente.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Origens 🇧🇷</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {popularOrigins.map((code) => (
                  <Badge key={code} variant="outline" className="cursor-pointer" onClick={() => onFormChange({ ...form, origin: code })}>
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Destinos 🌎</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {popularDestinations.map((code) => (
                  <Badge key={code} variant="outline" className="cursor-pointer" onClick={() => onFormChange({ ...form, destination: code })}>
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" size="lg" className="self-stretch lg:self-auto" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Buscando...' : 'Pesquisar'}
          </Button>
        </div>
        {errors && (
          <p className="text-sm text-red-500">{errors}</p>
        )}
        </CardContent>
      </form>
    </Card>
  )
}

export default SearchParametersCard
