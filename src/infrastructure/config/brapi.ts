export const BRAPI_CONFIG = {
  // Token gratuito do Brapi (pode ser obtido em https://brapi.dev)
  // Para produção, recomenda-se obter um token próprio
  TOKEN: process.env.BRAPI_TOKEN || 'demo',
  
  // Configurações da API
  BASE_URL: 'https://brapi.dev/api',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
  
  // Rate limiting
  BATCH_SIZE: 10,
  BATCH_DELAY: 1000, // 1 segundo entre lotes
}; 