// src/viewmodels/useAuthViewModel.ts
import { useState } from 'react';
import {
  clearSession,
  loginService,
  registerService,
  registerWithOffline,
  saveSession,
} from '../services/authService';

interface AuthResult {
  success: boolean;
  message?: string;
}

export const useAuthViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // ─── LOGIN ────────────────────────────────────────────────
  const login = async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResult> => {
    console.log("\n========== LOGIN ==========");
    console.log("📝 [login] Email:", payload.email);
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await loginService(payload);
      await saveSession(data.token, data.usuario ?? { email: payload.email });
      console.log("✅ [login] Login exitoso!");
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error ||
        err.response?.data?.msg ||
        'No se pudo iniciar sesión. Verifica tus credenciales.';
      
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
      console.log("========== FIN LOGIN ==========\n");
    }
  };

  // ─── REGISTER CON OFFLINE ─────────────────────────────────
  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthResult> => {
    console.log("\n========== REGISTER ==========");
    console.log("📝 [register] Email:", payload.email);
    
    setLoading(true);
    setError(null);
    setOfflineMode(false);
    
    try {
      // Verificar que las contraseñas coincidan
      if (payload.confirmPassword && payload.password !== payload.confirmPassword) {
        console.log("❌ [register] Las contraseñas no coinciden");
        setError('Las contraseñas no coinciden');
        return { success: false, message: 'Las contraseñas no coinciden' };
      }
      
      // Formatear datos
      const nameParts = payload.name.trim().split(' ');
      const nombre = nameParts[0] || payload.name;
      const apellido = nameParts.slice(1).join(' ') || 'Usuario';
      
      const registerData = {
        nombre: nombre,
        apellido: apellido,
        email: payload.email,
        password: payload.password,
        role: 'alumno',
      };
      
      // Usar registro con soporte offline
      const result = await registerWithOffline(registerData);
      
      if (result.success) {
        if (result.offline) {
          setOfflineMode(true);
          return { 
            success: true, 
            message: result.message || 'Registro guardado offline. Se sincronizará cuando tengas conexión.' 
          };
        }
        return { success: true };
      }
      
      return { success: false, message: 'Error en el registro' };
      
    } catch (err: any) {
      console.error("❌ [register] Error:", err.message);
      
      const msg = err.response?.data?.error ||
        err.response?.data?.msg ||
        'No se pudo crear la cuenta.';
      
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
      console.log("========== FIN REGISTER ==========\n");
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────
  const logout = async (): Promise<boolean> => {
    console.log("\n========== LOGOUT ==========");
    try {
      await clearSession();
      console.log("✅ [logout] Sesión cerrada exitosamente");
      return true;
    } catch (error) {
      console.error("❌ [logout] Error al cerrar sesión:", error);
      return false;
    } finally {
      console.log("========== FIN LOGOUT ==========\n");
    }
  };

  // ─── LIMPIAR ERROR ────────────────────────────────────────
  const clearError = () => {
    setError(null);
  };

  return { 
    login, 
    register, 
    logout, 
    loading, 
    error,
    offlineMode,
    clearError 
  };
};