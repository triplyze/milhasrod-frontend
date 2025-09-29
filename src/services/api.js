// Serviço para integração com as APIs do backend MilhasRod

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://milhasrod-backend.vercel.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Configurar token de autenticação
  setAuthToken(token) {
    this.token = token;
  }

  // Método auxiliar para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Verificar status da API
  async checkStatus() {
    return this.request('/api/status');
  }

  // Buscar voos
  async searchFlights(params) {
    const queryParams = new URLSearchParams();
    
    // Mapear parâmetros do frontend para o formato esperado pela API
    if (params.origin) queryParams.append('origin_airports', params.origin);
    if (params.destination) queryParams.append('destination_airports', params.destination);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.daysToSearch) queryParams.append('days_to_search', params.daysToSearch);
    if (params.sources) queryParams.append('sources', params.sources);
    if (params.cabins) queryParams.append('cabins', params.cabins);

    return this.request(`/api/search?${queryParams.toString()}`);
  }

  // Obter detalhes de um voo específico (se disponível)
  async getFlightDetails(availabilityId) {
    return this.request(`/api/trips?id=${availabilityId}`);
  }

  // Buscar aeroportos (autocomplete)
  async searchAirports(query) {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('q', query);
    
    return this.request(`/api/airports?${queryParams.toString()}`);
  }

  // Obter créditos do usuário
  async getCredits() {
    return this.request('/api/credits');
  }

  // Stripe - Criar sessão de checkout
  async createCheckoutSession(priceId, quantity = 1) {
    return this.request('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        price_id: priceId,
        quantity: quantity
      })
    });
  }

  // Stripe - Cancelar
  async cancelPayment() {
    return this.request('/api/stripe/cancel');
  }

  // Stripe - Sucesso
  async paymentSuccess(sessionId) {
    return this.request(`/api/stripe/success?session_id=${sessionId}`);
  }
}

// Instância singleton do serviço
const apiService = new ApiService();

export default apiService;

// Funções auxiliares para uso direto
export const checkApiStatus = () => apiService.checkStatus();
export const searchFlights = (params) => apiService.searchFlights(params);
export const getFlightDetails = (id) => apiService.getFlightDetails(id);
export const searchAirports = (query) => apiService.searchAirports(query);
export const getCredits = () => apiService.getCredits();
export const createCheckoutSession = (priceId, quantity) => apiService.createCheckoutSession(priceId, quantity);
export const setAuthToken = (token) => apiService.setAuthToken(token);
