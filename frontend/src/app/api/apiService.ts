import axios from 'axios';
import { API_CONFIG } from '@/app/config';

// Configuração base do axios
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para configurar o token de autenticação
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Utilitários da API
export const ApiUtils = {
  get: async (url: string) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  post: async (url: string, data: any) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  put: async (url: string, data: any) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (url: string) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviços para Candidatos
export const CandidatosService = {
  getInscricoes: async () => ApiUtils.get('/api/inscricoes'),
  getDiagnosticos: async () => ApiUtils.get('/api/diagnosticos'),
  getCandidatos: async () => ApiUtils.get('/api/candidatos'),
  createInscricao: async (data: any) => ApiUtils.post('/api/inscricoes', data),
  createDiagnostico: async (data: any) => ApiUtils.post('/api/diagnosticos', data),
  createCandidato: async (data: any) => ApiUtils.post('/api/candidatos', data),
  updateInscricao: async (id: string, data: any) => ApiUtils.put(`/api/inscricoes/${id}`, data),
  updateDiagnostico: async (id: string, data: any) => ApiUtils.put(`/api/diagnosticos/${id}`, data),
  updateCandidato: async (id: string, data: any) => ApiUtils.put(`/api/candidatos/${id}`, data),
  deleteInscricao: async (id: string) => ApiUtils.delete(`/api/inscricoes/${id}`),
  deleteDiagnostico: async (id: string) => ApiUtils.delete(`/api/diagnosticos/${id}`),
  deleteCandidato: async (id: string) => ApiUtils.delete(`/api/candidatos/${id}`),
};

// Serviços para Áreas
export const AreasService = {
  getAreas: async () => ApiUtils.get('/api/areas'),
  getNucleos: async () => ApiUtils.get('/api/nucleos'),
  getUnidades: async () => ApiUtils.get('/api/unidades'),
  getNiveis: async () => ApiUtils.get('/api/niveis'),
  createArea: async (data: any) => ApiUtils.post('/api/areas', data),
  createNucleo: async (data: any) => ApiUtils.post('/api/nucleos', data),
  createUnidade: async (data: any) => ApiUtils.post('/api/unidades', data),
  createNivel: async (data: any) => ApiUtils.post('/api/niveis', data),
  updateArea: async (id: string, data: any) => ApiUtils.put(`/api/areas/${id}`, data),
  updateNucleo: async (id: string, data: any) => ApiUtils.put(`/api/nucleos/${id}`, data),
  updateUnidade: async (id: string, data: any) => ApiUtils.put(`/api/unidades/${id}`, data),
  deleteArea: async (id: string) => ApiUtils.delete(`/api/areas/${id}`),
  deleteNucleo: async (id: string) => ApiUtils.delete(`/api/nucleos/${id}`),
  deleteUnidade: async (id: string) => ApiUtils.delete(`/api/unidades/${id}`),
  deleteNivel: async (id: string) => ApiUtils.delete(`/api/niveis/${id}`),
};