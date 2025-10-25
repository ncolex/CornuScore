import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import HeartIcon from '../components/icons/HeartIcon';
import { registerUser } from '../services/airtableService';

const RegisterPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const validatePassword = (pass: string) => {
    const errors: string[] = [];
    if (pass.length < 8) errors.push("8 caracteres");
    if (!/[a-z]/.test(pass)) errors.push("una minúscula");
    if (!/[A-Z]/.test(pass)) errors.push("una mayúscula");
    if (!/\d/.test(pass)) errors.push("un número");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass)) errors.push("un símbolo");
    return errors;
  };

  const passwordErrors = validatePassword(password);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
        setError('El número de teléfono es obligatorio.');
        return;
    }
    
    if (email.trim()) {
        if (passwordErrors.length > 0) {
            setError('La contraseña no cumple con los requisitos.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
    }

    setIsLoading(true);
    const result = await registerUser({
        phone: phone.trim(),
        email: email.trim() || undefined,
        password: password || undefined,
    });
    setIsLoading(false);

    if (result.success && result.user) {
      login(result.user.phone);
      window.location.replace('#/profile');
    } else {
      setError(result.message);
    }
  };

  const handleSocialRegister = async (provider: string) => {
    // In a real app, this would trigger the OAuth flow and get user data.
    // Here, we simulate getting a unique phone number from the provider.
    const mockPhoneNumber = `${provider}_user_${Date.now().toString().slice(-6)}`;
    
    setIsLoading(true);
    const result = await registerUser({ phone: mockPhoneNumber });
    setIsLoading(false);

    if (result.success && result.user) {
        login(result.user.phone);
        window.location.replace('#/profile');
    } else {
        // This might happen if the mock number collides, unlikely but good to handle
        setError(result.message || 'Error en el registro social. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 py-8">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 w-full max-w-md dark:bg-gray-800/80 dark:border-gray-700">
        <HeartIcon className="w-16 h-16 text-pink-500 mb-4 mx-auto"/>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Crear Cuenta</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Regístrate para empezar a contribuir.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="phone" className="sr-only">Teléfono</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Número de Teléfono *" className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required/>
            </div>
             <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo Electrónico (opcional)" className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
            </div>
            
            {email.trim() && (
                <>
                    <div>
                        <label htmlFor="password" className="sr-only">Contraseña</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña *" className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required/>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Contraseña *" className="w-full px-4 py-3 text-md border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required/>
                    </div>
                    {password && passwordErrors.length > 0 && (
                        <div className="text-left text-xs text-red-500 bg-red-100 p-2 rounded-md dark:bg-red-900/50 dark:text-red-400">
                            La contraseña debe tener al menos: {passwordErrors.join(', ')}.
                        </div>
                    )}
                </>
            )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600">
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">O</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleSocialRegister('google')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            <i className="fa-brands fa-google text-red-500"></i>
            Registrarse con Google
          </button>
           <button onClick={() => handleSocialRegister('facebook')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-[#1877F2] rounded-full shadow-sm hover:bg-[#166fe5] transition-all">
            <i className="fa-brands fa-facebook-f"></i>
            Registrarse con Facebook
          </button>
           <button onClick={() => handleSocialRegister('instagram')} className="w-full flex items-center justify-center gap-3 py-3 text-md font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full shadow-sm hover:opacity-90 transition-all">
            <i className="fa-brands fa-instagram"></i>
            Registrarse con Instagram
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;