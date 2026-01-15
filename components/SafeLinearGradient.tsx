import React from 'react';
import { View, ViewStyle } from 'react-native';

// Wrapper seguro para LinearGradient que maneja errores de importación
let LinearGradient: any = null;

try {
  const linearGradientModule = require('expo-linear-gradient');
  LinearGradient = linearGradientModule.LinearGradient || linearGradientModule.default?.LinearGradient || linearGradientModule.default;
} catch (e) {
  console.warn('expo-linear-gradient no está disponible, usando View como fallback');
}

interface SafeLinearGradientProps {
  colors: string[];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export function SafeLinearGradient({ colors, style, start, end, children }: SafeLinearGradientProps) {
  if (LinearGradient) {
    return (
      <LinearGradient colors={colors} style={style} start={start} end={end}>
        {children}
      </LinearGradient>
    );
  }
  
  // Fallback a View si LinearGradient no está disponible
  return (
    <View style={[{ backgroundColor: colors[0] || '#ffffff' }, style]}>
      {children}
    </View>
  );
}

