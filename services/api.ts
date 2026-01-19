import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️ IMPORTANTE: Configuración de API
// En desarrollo: usa tu IP local (solo si el backend está corriendo localmente)
// En producción: usa la URL de tu servidor
const LOCAL_IP = '192.168.1.48'; // IP local para desarrollo
const PRODUCTION_API_URL = 'https://sorteos-app-orcin.vercel.app/api'; // URL de producción en Vercel

// Variable para forzar uso de producción (útil cuando el backend está desplegado)
// Cambia a false solo si quieres usar el backend local
const FORCE_PRODUCTION = true;

// Para emulador Android usa 10.0.2.2, para dispositivo físico usa tu IP
const getApiUrl = () => {
  // Si se fuerza producción, siempre usar la URL de producción
  if (FORCE_PRODUCTION) {
    return PRODUCTION_API_URL;
  }
  
  // Si hay una variable de entorno o constante de producción, usarla
  // De lo contrario, usar IP local para desarrollo
  if (__DEV__) {
    // Modo desarrollo: usar IP local
    if (Platform.OS === 'android') {
      return `http://${LOCAL_IP}:3001/api`;
    } else if (Platform.OS === 'ios') {
      return `http://${LOCAL_IP}:3001/api`;
    }
    return `http://${LOCAL_IP}:3001/api`;
  } else {
    // Modo producción: usar URL del servidor
    return PRODUCTION_API_URL;
  }
};

const API_URL = getApiUrl();

// Log para debugging (siempre, para ayudar a diagnosticar problemas)
console.log('🔗 URL de la API configurada:', API_URL);
console.log('📱 Plataforma:', Platform.OS);
console.log('🌐 IP local configurada:', LOCAL_IP);
console.log('🔧 Modo desarrollo:', __DEV__);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos de timeout (reducido para mejor UX)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para verificar conectividad
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`, {
      timeout: 5000,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    return { success: false, error: error.message };
  }
};

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
      // No crashear, continuar sin token
    }
    return config;
  },
  (error) => {
    console.error('Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error.response?.status === 401) {
        try {
          await AsyncStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        } catch (storageError) {
          console.error('Error al eliminar token:', storageError);
        }
      }
    } catch (handlerError) {
      console.error('Error en interceptor de response:', handlerError);
    }
    return Promise.reject(error);
  }
);

