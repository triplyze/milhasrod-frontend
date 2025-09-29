import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, CreditCard, Star, Zap } from 'lucide-react'
import { creditPlans } from '../lib/stripe'
import apiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const CreditsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, refreshCredits } = useAuth()

  if (!isOpen) return null

  const handlePurchase = async (plan) => {
    if (!user) {
      setError('Você precisa estar logado para comprar créditos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await apiService.createCheckoutSession(plan.priceId, 1)
      
      if (response.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = response.url
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error)
      setError(error.message || 'Erro ao processar pagamento')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Comprar Créditos</h2>
            <p className="text-gray-600">Escolha o plano ideal para suas buscas</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                      <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                      {plan.credits.toLocaleString()} créditos
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      R$ {(plan.price / plan.credits).toFixed(4)} por crédito
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Válido por 12 meses
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Sem taxa de cancelamento
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Suporte prioritário
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase(plan)}
                    disabled={loading}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processando...' : 'Comprar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Como funcionam os créditos?</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Cada busca consome créditos baseado no número de dias pesquisados</p>
              <p>• 1 crédito = 1 dia de busca</p>
              <p>• Créditos não utilizados são válidos por 12 meses</p>
              <p>• Pagamento seguro processado pelo Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditsModal
