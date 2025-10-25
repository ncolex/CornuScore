import React, { useState } from 'react';
import { submitReview } from '../services/airtableService';
import { CATEGORIES } from '../constants';
import { ReviewCategory } from '../types';

const countryList = ["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "España", "México", "Paraguay", "Perú", "Uruguay", "Venezuela", "Otro"];

const NewReviewPage: React.FC = () => {
  const [personIdentifier, setPersonIdentifier] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [otherCountry, setOtherCountry] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerInstagram, setReviewerInstagram] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [category, setCategory] = useState<ReviewCategory | null>(null);
  const [text, setText] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setEvidence(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEvidencePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personIdentifier || !country || (country === 'Otro' && !otherCountry.trim()) || !reviewerEmail || !reviewerInstagram || !reviewerPhone || !category || !text) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    setError('');
    setIsLoading(true);

    let evidenceUrl: string | undefined = undefined;
    if (evidence) {
        try {
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            evidenceUrl = await toBase64(evidence);
        } catch (err) {
            console.error("Error converting file to Base64", err);
            setError('Hubo un error al procesar la imagen de evidencia.');
            setIsLoading(false);
            return;
        }
    }

    const score = CATEGORIES[category].score;
    const finalCountry = country === 'Otro' ? otherCountry.trim() : country;

    const success = await submitReview({ personIdentifier, country: finalCountry, category, text, score, reviewerEmail, reviewerInstagram, reviewerPhone, evidenceUrl });
    setIsLoading(false);

    if (success) {
      alert('Reseña enviada con éxito. Gracias por tu contribución.');
      window.location.replace(`#/results/${encodeURIComponent(personIdentifier)}`);
    } else {
      setError('Hubo un error al enviar tu reseña. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-6">Crear una Reseña</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Tu aporte es anónimo y ayuda a la comunidad. Sé honesto y respetuoso.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
             <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-4">Datos de la Persona Reseñada</h3>
                <div className="space-y-4">
                     <div>
                      <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Usuario de Instagram de la persona <span className="text-red-500">*</span>
                      </label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <i className="fa-brands fa-instagram text-gray-400"></i>
                         </div>
                         <input
                           id="identifier"
                           type="text"
                           placeholder="@usuario_de_instagram"
                           value={personIdentifier}
                           onChange={(e) => setPersonIdentifier(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                           required
                         />
                       </div>
                    </div>
                     <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        País / Región <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="" disabled>Selecciona un país</option>
                        {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {country === 'Otro' && (
                        <input
                          type="text"
                          placeholder="Por favor, especifica el país"
                          value={otherCountry}
                          onChange={(e) => setOtherCountry(e.target.value)}
                          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          required
                        />
                      )}
                    </div>
                </div>
            </div>
            
             <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-4">Tus Datos (Obligatorio, no público)</h3>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tu Correo Electrónico <span className="text-red-500">*</span></label>
                        <input id="reviewerEmail" type="email" placeholder="tu@correo.com" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="reviewerInstagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tu Usuario de Instagram <span className="text-red-500">*</span></label>
                        <input id="reviewerInstagram" type="text" placeholder="@tu_usuario" value={reviewerInstagram} onChange={(e) => setReviewerInstagram(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="reviewerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tu Teléfono <span className="text-red-500">*</span></label>
                        <input id="reviewerPhone" type="tel" placeholder="+54 9 11 12345678" value={reviewerPhone} onChange={(e) => setReviewerPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as ReviewCategory)}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg text-sm transition-all ${category === key ? 'bg-pink-500 text-white ring-2 ring-pink-300 dark:ring-pink-600' : 'bg-gray-100 hover:bg-pink-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                >
                  <span>{value.emoji}</span>
                  <span>{value.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tu experiencia (máx. 200 caracteres) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              required
            />
             <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{text.length}/200</p>
          </div>

          <div>
             <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adjuntar evidencia (opcional, .jpg, .png)
            </label>
            <input 
                id="evidence"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:file:bg-gray-700 dark:file:text-pink-300 dark:hover:file:bg-gray-600"
            />
            {evidencePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vista previa:</p>
                <img src={evidencePreview} alt="Evidence preview" className="rounded-lg max-h-48 border shadow-sm dark:border-gray-600" />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="text-center text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-100/80 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700/80 p-3 rounded-lg">
            <p className="font-bold">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>Aviso Importante
            </p>
            <p>Está estrictamente prohibido incluir nombres o cualquier información de menores de edad. El incumplimiento de esta norma resultará en la eliminación de la reseña.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-wait"
          >
            {isLoading ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReviewPage;