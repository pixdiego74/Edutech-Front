// src/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_REGISTRATIONS_KEY = 'pending_registrations';

export interface PendingRegistration {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: string;
  timestamp: number;
}

// Verificar si hay conexión a internet
export const isConnected = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Guardar registro pendiente
export const savePendingRegistration = async (registrationData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: string;
}): Promise<void> => {
  try {
    const pending = await AsyncStorage.getItem(PENDING_REGISTRATIONS_KEY);
    const pendingList: PendingRegistration[] = pending ? JSON.parse(pending) : [];
    
    const newPending: PendingRegistration = {
      id: Date.now().toString(),
      ...registrationData,
      timestamp: Date.now(),
    };
    
    pendingList.push(newPending);
    await AsyncStorage.setItem(PENDING_REGISTRATIONS_KEY, JSON.stringify(pendingList));
    
    console.log('💾 Registro guardado offline:', newPending.id);
  } catch (error) {
    console.error('Error saving pending registration:', error);
  }
};

// Obtener todos los registros pendientes
export const getPendingRegistrations = async (): Promise<PendingRegistration[]> => {
  try {
    const pending = await AsyncStorage.getItem(PENDING_REGISTRATIONS_KEY);
    return pending ? JSON.parse(pending) : [];
  } catch (error) {
    console.error('Error getting pending registrations:', error);
    return [];
  }
};

// Eliminar un registro pendiente
export const removePendingRegistration = async (id: string): Promise<void> => {
  try {
    const pending = await getPendingRegistrations();
    const filtered = pending.filter(p => p.id !== id);
    await AsyncStorage.setItem(PENDING_REGISTRATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending registration:', error);
  }
};

// Sincronizar registros pendientes
export const syncPendingRegistrations = async (
  syncFunction: (data: any) => Promise<any>
): Promise<number> => {
  try {
    const pending = await getPendingRegistrations();
    let syncedCount = 0;
    
    for (const registration of pending) {
      try {
        await syncFunction({
          nombre: registration.nombre,
          apellido: registration.apellido,
          email: registration.email,
          password: registration.password,
          role: registration.role,
        });
        await removePendingRegistration(registration.id);
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing registration ${registration.id}:`, error);
      }
    }
    
    return syncedCount;
  } catch (error) {
    console.error('Error syncing pending registrations:', error);
    return 0;
  }
};