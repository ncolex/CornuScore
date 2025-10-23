import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeartIcon from '../components/icons/HeartIcon';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length > 5 && password.trim().length > 0) {
      setError('');
      const success = await login(phoneNumber.trim(), password.trim());
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Número de teléfono o contraseña incorrectos.');
      }
    } else {
      setError('Por favor, ingresa un número de teléfono y contraseña válidos.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // In a real app, this would trigger the OAuth flow.
    // Here, we just simulate a login for demonstration purposes.
    const mockPhoneNumber = `${provider}_user_${Date.now().toString().slice(-6)}`;
    const mockPassword = 'social_password'; // Social logins typically don't use a password field
    const success = await login(mockPhoneNumber, mockPassword);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Error al iniciar sesión con la cuenta social.');
    }
  };


  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[70vh]">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 w-full max-w-sm">
        <HeartIcon className="w-16 h-16 text-pink-500 mb-4 mx-auto"/>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h1>
        <p className="text-gray-600 mb-6">
          Ingresa con tu teléfono y contraseña para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Número de Teléfono"
              className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit"
            className="w-full py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-sm">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-pink-500 hover:text-pink-600">
              Regístrate
            </Link>
          </p>
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">O</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all">
            <i className="fa-brands fa-google text-red-500"></i>
            Continuar con Google
          </button>
           <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-[#1877F2] rounded-full shadow-sm hover:bg-[#166fe5] transition-all">
            <i className="fa-brands fa-facebook-f"></i>
            Continuar con Facebook
          </button>
           <button onClick={() => handleSocialLogin('instagram')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-sm hover:opacity-90 transition-all">
            <i className="fa-brands fa-instagram"></i>
            Continuar con Instagram
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;