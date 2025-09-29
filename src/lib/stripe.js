import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here'

// Inicializar Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}

export default getStripe

// Função para redirecionar para checkout
export const redirectToCheckout = async (sessionId) => {
  const stripe = await getStripe()
  const { error } = await stripe.redirectToCheckout({
    sessionId,
  })
  
  if (error) {
    console.error('Erro ao redirecionar para checkout:', error)
    throw error
  }
}

// Planos de créditos disponíveis
export const creditPlans = [
  {
    id: 'basic',
    name: 'Pacote Básico',
    credits: 100,
    price: 9.99,
    priceId: 'price_basic_credits', // ID do preço no Stripe
    description: '100 créditos para busca de voos'
  },
  {
    id: 'standard',
    name: 'Pacote Padrão',
    credits: 500,
    price: 39.99,
    priceId: 'price_standard_credits',
    description: '500 créditos para busca de voos',
    popular: true
  },
  {
    id: 'premium',
    name: 'Pacote Premium',
    credits: 1000,
    price: 69.99,
    priceId: 'price_premium_credits',
    description: '1000 créditos para busca de voos'
  }
]
