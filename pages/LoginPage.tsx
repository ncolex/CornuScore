import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeartIcon from '../components/icons/HeartIcon';

const LoginPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { login } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length > 5) {
      setError('');
      setIsFormLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        login(phoneNumber.trim());
        window.location.replace(`#${from}`);
      }, 1000);
    } else {
      setError('Por favor, ingresa un número de teléfono válido.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    if (resetEmail.trim() && /^\S+@\S+\.\S+$/.test(resetEmail)) {
      // Simulate sending the email. In a real app, this would call an API.
      setResetMessage('Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
      setResetEmail('');
    } else {
      setError('Por favor, ingresa un correo electrónico válido.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setError('');
    try {
        // Simulate API call delay for a better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, this would trigger the OAuth flow.
        // Here, we just simulate a login for demonstration purposes.
        const mockPhoneNumber = `${provider}_user_${Date.now().toString().slice(-6)}`;
        login(mockPhoneNumber);
        window.location.replace(`#${from}`);

    } catch (err) {
        setError(`Error al iniciar sesión con ${provider}. Por favor, intenta de nuevo.`);
        console.error(err);
    } finally {
        setSocialLoading(null);
    }
  };
  
  const switchView = (mode: 'login' | 'forgot') => {
      setViewMode(mode);
      setError('');
      setResetMessage('');
      setPhoneNumber('');
      setResetEmail('');
  };

  const isLoading = isFormLoading || !!socialLoading;

  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[70vh]">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 w-full max-w-sm dark:bg-gray-800/80 dark:border-gray-700">
        <HeartIcon className="w-16 h-16 text-pink-500 mb-4 mx-auto"/>
        
        {viewMode === 'login' ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ingresa con tu teléfono para continuar.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Número de Teléfono"
                  className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-wait"
              >
                {isFormLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="mt-4 text-sm flex justify-between items-center">
               <button 
                  type="button" 
                  onClick={() => switchView('forgot')} 
                  className="font-semibold text-pink-500 hover:text-pink-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              <p className="text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className={`font-semibold text-pink-500 hover:text-pink-600 hover:underline ${isLoading ? 'pointer-events-none text-gray-400' : ''}`}>
                  Regístrate
                </Link>
              </p>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">O</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <div className="space-y-3">
              <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-wait dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                {socialLoading === 'google' ? (
                  <><i className="fa-solid fa-spinner animate-spin"></i> Conectando...</>
                ) : (
                  <><i className="fa-brands fa-google text-red-500"></i> Continuar con Google</>
                )}
              </button>
               <button onClick={() => handleSocialLogin('facebook')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-[#1877F2] rounded-full shadow-sm hover:bg-[#166fe5] transition-all disabled:opacity-70 disabled:cursor-wait">
                {socialLoading === 'facebook' ? (
                    <><i className="fa-solid fa-spinner animate-spin"></i> Conectando...</>
                ) : (
                    <><i className="fa-brands fa-facebook-f"></i> Continuar con Facebook</>
                )}
              </button>
               <button onClick={() => handleSocialLogin('instagram')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-sm hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-wait">
                {socialLoading === 'instagram' ? (
                    <><i className="fa-solid fa-spinner animate-spin"></i> Conectando...</>
                ) : (
                    <><i className="fa-brands fa-instagram"></i> Continuar con Instagram</>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Restablecer Contraseña</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ingresa tu correo para recibir un enlace de recuperación.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <input
                  id="email-reset"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Correo Electrónico Registrado"
                  className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {resetMessage && <p className="text-green-600 dark:text-green-400 text-sm">{resetMessage}</p>}
              <button 
                type="submit"
                className="w-full py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
              >
                Enviar Enlace de Recuperación
              </button>
            </form>
             <div className="mt-4 text-sm">
                <button 
                  type="button" 
                  onClick={() => switchView('login')} 
                  className="font-semibold text-pink-500 hover:text-pink-600 hover:underline"
                >
                  Volver a Iniciar Sesión
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;