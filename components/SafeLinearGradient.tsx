import React from 'react';
import { View, ViewStyle } from 'react-native';

// Wrapper seguro para LinearGradient que maneja errores de importación
let LinearGradient: any = null;
let isLoaded = false;

function loadLinearGradient() {
  if (isLoaded) return;
  
  try {
    const linearGradientModule = require('expo-linear-gradient');
    if (linearGradientModule) {
      // Intentar diferentes formas de obtener LinearGradient de forma segura
      if (linearGradientModule.LinearGradient) {
        LinearGradient = linearGradientModule.LinearGradient;
      } else if (linearGradientModule.default) {
        if (linearGradientModule.default.LinearGradient) {
          LinearGradient = linearGradientModule.default.LinearGradient;
        } else if (typeof linearGradientModule.default === 'function') {
          LinearGradient = linearGradientModule.default;
        }
      } else if (typeof linearGradientModule === 'function') {
        LinearGradient = linearGradientModule;
      }
    }
    isLoaded = true;
  } catch (e) {
    console.warn('expo-linear-gradient no está disponible, usando View como fallback:', e);
    isLoaded = true;
  }
}

// Cargar al importar el módulo
loadLinearGradient();

interface SafeLinearGradientProps {
  colors: string[];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export function SafeLinearGradient({ colors, style, start, end, children }: SafeLinearGradientProps) {
  // Intentar cargar de nuevo si no se cargó antes
  if (!isLoaded) {
    loadLinearGradient();
  }
  
  if (LinearGradient && typeof LinearGradient === 'function') {
    try {
      return (
        <LinearGradient colors={colors} style={style} start={start} end={end}>
          {children}
        </LinearGradient>
      );
    } catch (e) {
      console.warn('Error al renderizar LinearGradient:', e);
    }
  }
  
  // Fallback a View si LinearGradient no está disponible
  return (
    <View style={[{ backgroundColor: colors[0] || '#ffffff' }, style]}>
      {children}
    </View>
  );
}


