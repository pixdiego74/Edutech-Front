/**
 * RegisterView - Vista de registro de usuario (UI layer)
 * Patrón MVVM: Esta vista solo maneja presentación y eventos
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { validateField, validatePasswordStrength } from '../helpers/validation';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export default function RegisterView() {
  const router = useRouter();
  const { register, loading, offlineMode } = useAuthViewModel();

  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmarPassword, setConfirmarPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    password: false,
    confirmarPassword: false,
  });

  const handleRegister = async () => {
    setTouched({ nombre: true, email: true, password: true, confirmarPassword: true });

    const nombreValidation = validateField(nombre, 'username');
    if (!nombreValidation.isValid) {
      Alert.alert('Error', nombreValidation.message);
      return;
    }
    const emailValidation = validateField(email, 'email');
    if (!emailValidation.isValid) {
      Alert.alert('Error', emailValidation.message);
      return;
    }
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const result = await register({
      name: nombre,
      email,
      password,
      confirmPassword: confirmarPassword,
    });

    if (result.success) {
      if (result.message?.includes('offline')) {
        Alert.alert('Registro guardado', result.message, [
          { text: 'Aceptar', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Éxito', 'Cuenta creada correctamente', [
          { text: 'Aceptar', onPress: () => router.replace('/login') },
        ]);
      }
    } else {
      Alert.alert('Error', result.message || 'Error al registrar');
    }
  };

  const getError = (field: 'nombre' | 'email' | 'password', value: string): string | null => {
    if (!touched[field] || !value) return null;
    if (field === 'nombre') {
      const v = validateField(value, 'username');
      return v.isValid ? null : v.message || null;
    }
    if (field === 'email') {
      const v = validateField(value, 'email');
      return v.isValid ? null : v.message || null;
    }
    if (field === 'password') {
      const v = validatePasswordStrength(value);
      return v.isValid ? null : v.message || null;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2a1a5e" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top section con logo */}
          <View style={styles.topSection}>
            <View style={styles.orangeOverlay} />

            {/* Botón volver */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="cube-outline" size={40} color="white" />
              </View>
              <Text style={styles.logoTitle}>EDUTECH</Text>
              <Text style={styles.logoSub}>INVENTORY</Text>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.formPanel}>
            <Text style={styles.formTitle}>Create your account</Text>

            {/* Nombre */}
            <Text style={styles.label}>Full name:</Text>
            <View style={[styles.inputBox, getError('nombre', nombre) ? styles.inputBoxError : null]}>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                onBlur={() => setTouched(prev => ({ ...prev, nombre: true }))}
                autoCorrect={false}
                placeholderTextColor="#bbb"
              />
            </View>
            {getError('nombre', nombre) ? (
              <Text style={styles.errorText}>{getError('nombre', nombre)}</Text>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>E-mail:</Text>
            <View style={[styles.inputBox, getError('email', email) ? styles.inputBoxError : null]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#bbb"
              />
            </View>
            {getError('email', email) ? (
              <Text style={styles.errorText}>{getError('email', email)}</Text>
            ) : null}

            {/* Password */}
            <Text style={styles.label}>Password:</Text>
            <View style={[styles.inputBox, getError('password', password) ? styles.inputBoxError : null]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                secureTextEntry={!showPassword}
                placeholderTextColor="#bbb"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
              </TouchableOpacity>
            </View>
            {getError('password', password) ? (
              <Text style={styles.errorText}>{getError('password', password)}</Text>
            ) : null}

            {/* Confirmar password */}
            <Text style={styles.label}>Confirm password:</Text>
            <View style={[
              styles.inputBox,
              touched.confirmarPassword && (!confirmarPassword || password !== confirmarPassword)
                ? styles.inputBoxError
                : null,
            ]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                onBlur={() => setTouched(prev => ({ ...prev, confirmarPassword: true }))}
                secureTextEntry={!showConfirm}
                placeholderTextColor="#bbb"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
              </TouchableOpacity>
            </View>
            {touched.confirmarPassword && !confirmarPassword ? (
              <Text style={styles.errorText}>Este campo es requerido</Text>
            ) : null}
            {touched.confirmarPassword && confirmarPassword && password !== confirmarPassword ? (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            ) : null}

            {/* Indicador de modo offline */}
            {offlineMode && (
              <View style={styles.offlineBadge}>
                <Ionicons name="cloud-offline-outline" size={16} color="#f97316" />
                <Text style={styles.offlineText}>Modo offline - Se sincronizará después</Text>
              </View>
            )}

            {/* Botón REGISTER */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>
                {loading ? 'Registrando...' : 'REGISTER'}
              </Text>
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a1a5e',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  topSection: {
    height: 240,
    backgroundColor: '#2a1a5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orangeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249,115,22,0.20)',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 6,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#f97316',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoTitle: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
  },
  logoSub: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 5,
    marginTop: 2,
  },
  formPanel: {
    backgroundColor: '#5b3fd4',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 22,
  },
  label: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputBoxError: {
    borderColor: '#ff6b6b',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  eyeBtn: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  offlineText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '500',
  },
  registerBtn: {
    backgroundColor: '#f97316',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  registerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#c4b5fd',
    fontSize: 13,
  },
  loginLink: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});