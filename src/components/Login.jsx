import React, { useState, useEffect } from 'react';
import { Mail, Lock, Package } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from './firebase.jsx'; 
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);


    console.log('Intentando iniciar sesión con:', { email, password });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Autenticación exitosa, verificando autorización...', user.email);

      // Paso 2: Verificar si el usuario está en la colección 'autenticados'
      const docRef = doc(db, "autenticados", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // El usuario está autorizado
        console.log('Usuario autorizado. Redirigiendo...');
        navigate('/dashboard');
      } else {
        // El usuario no está en 'autenticados'. No está autorizado.
        console.log('Usuario no autorizado:', user.email);
        await signOut(auth); // Cerrar la sesión del usuario no autorizado
        setError('No tienes permiso para acceder. Contacta a un administrador.');
      }
    } catch (err) {
      console.error("Error de Firebase:", err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError('Las credenciales son incorrectas. Verifica el correo y la contraseña.');
          break;
        case 'auth/wrong-password':
          setError('La contraseña es incorrecta.');
          break;
        case 'auth/invalid-email':
          setError('El formato del correo electrónico no es válido.');
          break;
        default:
          setError('Hubo un problema al iniciar sesión. Revisa la consola para más detalles.');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Autenticación con Google exitosa, verificando autorización...', user.email);

      // Paso 2: Verificar si el usuario está en la colección 'autenticados'
      const docRef = doc(db, "autenticados", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Usuario de Google autorizado. Redirigiendo...');
        navigate('/dashboard');
      } else {
        // El usuario no está en 'autenticados'. No está autorizado.
        console.log('Usuario de Google no autorizado:', user.email);
        await signOut(auth); // Cerrar la sesión del usuario no autorizado
        setError('No tienes permiso para acceder. Contacta a un administrador.');
      }
    } catch (error) {
      console.error("Error en inicio de sesión con Google:", error);
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Package className="h-16 w-16 text-amber-800" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">CIMBRA-SYS</h1>
          <p className="text-gray-600 mt-2">Sistema de renta de madera para cimbra</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-black" size={20} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link to="/recuperar-contrasena" className="font-medium text-amber-600 hover:text-amber-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 disabled:bg-amber-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150"
              >
                <div className="flex items-center">
                  <img
                    className="h-5 w-5"
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google logo"
                  />
                  <span className="ml-2">Google</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="font-medium text-amber-600 hover:text-amber-500">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}