import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️ IMPORTANTE: Cambia esta IP por la IP de tu computadora
// Para encontrar tu IP:
// Windows: ipconfig (busca "IPv4 Address")
// Mac/Linux: ifconfig o ip addr
// Ejemplo: 'http://192.168.1.100:3001/api'
const LOCAL_IP = '192.168.1.48'; // IP configurada: 192.168.1.48

// Para emulador Android usa 10.0.2.2, para dispositivo físico usa tu IP
const getApiUrl = () => {
  // Usar IP local tanto en desarrollo como en producción
  // En producción, asegúrate de que el dispositivo esté en la misma red WiFi
  if (Platform.OS === 'android') {
    // Por defecto usar IP local (dispositivo físico)
    // Si estás en emulador, cambia esto a 'http://10.0.2.2:3001/api'
    return `http://${LOCAL_IP}:3001/api`;
  } else if (Platform.OS === 'ios') {
    // iOS siempre usa IP local
    return `http://${LOCAL_IP}:3001/api`;
  }
  // Fallback
  return `http://${LOCAL_IP}:3001/api`;
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

