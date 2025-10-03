import { useEffect, useMemo, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command.jsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Loader2, MapPin } from 'lucide-react'
import { searchAirports } from '@/services/api.js'

const MIN_QUERY_LENGTH = 2

function parseTokens(value) {
  const tokens = value.split(',')
  const lastToken = tokens[tokens.length - 1]
  return {
    tokens,
    lastToken: lastToken?.trim() ?? '',
    prefix: tokens.slice(0, -1).map((token) => token.trim()).filter(Boolean),
  }
}

function formatValue(prefix, selection) {
  const all = [...prefix, selection]
  return all.join(',').toUpperCase()
}

const AirportAutocomplete = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  helperText,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const { lastToken } = parseTokens(value || '')
    setQuery(lastToken)
  }, [value])

  useEffect(() => {
    if (!query || query.length < MIN_QUERY_LENGTH) {
      setOptions([])
      return
    }

    let active = true
    const handler = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const results = await searchAirports(query.trim())
        if (!active) return
        setOptions(Array.isArray(results) ? results.slice(0, 8) : [])
      } catch (err) {
        if (!active) return
        setError('Erro ao carregar aeroportos')
        setOptions([])
        console.error(err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(handler)
    }
  }, [query])

  const handleSelect = (airport) => {
    const { prefix } = parseTokens(value || '')
    const nextValue = formatValue(prefix, airport.iata || airport.code || '')
    onChange(nextValue)
    setOpen(false)
  }

  const displayOptions = useMemo(() => options.filter((item) => item.iata || item.code), [options])

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(event) => {
              const next = event.target.value.toUpperCase()
              onChange(next)
              const { lastToken } = parseTokens(next)
              setQuery(lastToken)
              setOpen(true)
            }}
            onFocus={() => {
              const { lastToken } = parseTokens(value || '')
              setQuery(lastToken)
              setOpen(true)
            }}
            onBlur={() => {
              if (!value) return
              onChange(value
                .split(',')
                .map((token) => token.trim().toUpperCase())
                .filter(Boolean)
                .join(','))
            }}
            autoComplete="off"
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[320px]" align="start">
          <Command>
            <CommandInput placeholder="Digite cidade ou IATA" value={query} onValueChange={setQuery} />
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando aeroportos...
                </div>
              ) : (
                'Nenhum aeroporto encontrado'
              )}
            </CommandEmpty>
            <CommandGroup>
              {displayOptions.map((airport) => {
                const code = airport.iata || airport.code
                const name = airport.name || airport.airport
                const city = airport.city || airport.municipality
                const country = airport.country || airport.countryName

                return (
                  <CommandItem key={`${code}-${airport.id || name}`} value={code} onSelect={() => handleSelect(airport)}>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{code} — {name}</span>
                      <span className="text-xs text-muted-foreground">{[city, country].filter(Boolean).join(', ')}</span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
          {error && <p className="px-3 py-2 text-xs text-red-500">{error}</p>}
          {helperText && <p className="px-3 py-2 text-xs text-muted-foreground">{helperText}</p>}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default AirportAutocomplete
