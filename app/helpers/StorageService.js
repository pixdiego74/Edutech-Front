//Encriptar todo lo que queramos aqui en vez de que sea en cada archivo.
//SecureStorage, Async Storage and REGEX.
//Trata SIEMPRE de optimizar tu codigo.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

class StorageService {
    //REGEX
    //Commun patterns
    static patterns = {
        //Input de los usuarios
        //FIRST SCREEN: Get all users, get one user(Id), get all solicitude, get one solicitude(Id), get all materials

        //SECOND SCREEN: Create New User, Login User
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        name: /^[a-zA-ZáéíóúñÑ\s]{2,50}$/,
        last_name: /^[a-zA-ZáéíóúñÑ\s]{2,50}$/,
        role: /^[a-zA-ZáéíóúñÑ\s]{2,50}$/,

        //-Create new material, create new solicitude
        title: /^[a-zA-ZáéíóúñÑ\s]{2,50}$/,
        description: /^[a-zA-ZáéíóúñÑ\s]{2,50}$/,
        location: /^[a-zA-Z0-9_]{3,20}$/,
        //estado es booleano
        //fecha programada es 

        //THIRD SCREEN: Delete USer, Delete Solicitude, Delete Material
        //FORTH SCREEN: Update User, Update Solicitude, Update Material
        id: /^\d+$/,

        //Seguridad
        jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        base64: /^[A-Za-z0-9+/]+=*$/
    };

    static validate(type, value) {
        return this.patterns[type] ? this.patterns[type].test(value): false;
    }

    //ASYNC STORAGE - Data No Sencisble
    //Async espera un subproceso
    //Etiqueta(Contraseña, username, etc.)=key, Valor interno(1234, Diego, etc.)=value
    static async setItem(key, value){
        try {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            await AsyncStorage.setItem(key, stringValue);
        } catch (error) {
            console.error("Error guardando en AsyncStorage", error);
        }
    }

    static async getItem(key){
        try {
            const value = await AsyncStorage.getItem(key);
            //Parsear
            try{
                return JSON.parse(value);
            } catch {
                return value;
            }
            //return value != null ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Error obteniendo en AsyncStorage", error);
            return null;
        }
    }

    //SecureStore - Data Sensible
    //No modificar los datos(no se convierte la informacion sensible a JSON)
    static async saveToken(key, token){
        try {
            //SecureStore solo acepta string
            await SecureStore.setItemAsync(key, token);
        } catch (error) {
            console.error("Error en SecureStore", error);
        }
    }

    static async getToken(key){
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error("No se pudieron recuperar las credenciales.", error);
            return null;
        }
    }

    static async resetToken(key){
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error("Error eliminando token", error);
        }
    }
}

export default StorageService;
//Investigar Await, Parsear, operadores ternarios