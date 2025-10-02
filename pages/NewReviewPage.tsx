import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReview } from '../services/airtableService';
import { CATEGORIES, RATING_OPTIONS } from '../constants';
import { ReviewCategory } from '../types';
import { getPseudoUser } from '../utils/pseudoUser';

const countryList = ["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "España", "México", "Paraguay", "Perú", "Uruguay", "Venezuela", "Otro"];

const NewReviewPage: React.FC = () => {
  const [personIdentifier, setPersonIdentifier] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState<ReviewCategory | null>(null);
  const [text, setText] = useState('');
  const [ratingEmoji, setRatingEmoji] = useState('🤔');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pseudoUser] = useState(() => getPseudoUser());
  const navigate = useNavigate();

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
    if (!personIdentifier || !country || !category || !text || !ratingEmoji) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    setError('');
    setIsLoading(true);

    let evidenceUrl: string | undefined = undefined;
    if (evidence) {
        // In a real app, you would upload the file to a storage service (S3, Firebase Storage)
        // and get a URL. For this mock, we convert it to a Base64 data URL.
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
    const success = await submitReview({
      personIdentifier,
      country,
      category,
      ratingEmoji,
      text,
      pseudoAuthor: pseudoUser,
      evidenceUrl,
    });
    setIsLoading(false);

    if (success) {
      alert('Reseña enviada con éxito. Gracias por tu contribución.');
      navigate(`/results/${encodeURIComponent(personIdentifier)}`);
    } else {
      setError('Hubo un error al enviar tu reseña. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30">
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-6">Crear una Reseña</h1>
        <p className="text-center text-gray-600 mb-6">Tu aporte es anónimo y ayuda a la comunidad. Sé honesto y respetuoso.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Identificador de la persona <span className="text-red-500">*</span>
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Nombre, apodo, @instagram..."
                value={personIdentifier}
                onChange={(e) => setPersonIdentifier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
             <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                País / Región <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                required
              >
                <option value="" disabled>Selecciona un país</option>
                {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as ReviewCategory)}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg text-sm transition-all ${category === key ? 'bg-pink-500 text-white ring-2 ring-pink-300' : 'bg-gray-100 hover:bg-pink-100'}`}
                >
                  <span>{value.emoji}</span>
                  <span>{value.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntuación con emoji <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.emoji}
                  type="button"
                  onClick={() => setRatingEmoji(option.emoji)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl border text-sm transition-all ${
                    ratingEmoji === option.emoji
                      ? 'bg-pink-500 text-white border-pink-300 shadow-lg'
                      : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-label={option.label}>{option.emoji}</span>
                  <span className="text-[11px] text-center leading-tight">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Tu experiencia (máx. 200 caracteres) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
              required
            />
             <p className="text-xs text-right text-gray-500 mt-1">{text.length}/200</p>
          </div>

          <div>
             <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
              Adjuntar evidencia (opcional, .jpg, .png)
            </label>
            <input 
                id="evidence"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {evidencePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Vista previa:</p>
                <img src={evidencePreview} alt="Evidence preview" className="rounded-lg max-h-48 border shadow-sm" />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <p className="text-center text-sm text-gray-500">
            Publicarás como <span className="font-semibold text-pink-500">{pseudoUser}</span>.
          </p>
          
          <div className="text-center text-xs text-gray-700 bg-yellow-100/80 border border-yellow-300 p-3 rounded-lg">
            <p className="font-bold text-yellow-800">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>Aviso Importante
            </p>
            <p>Está estrictamente prohibido incluir nombres o cualquier información de menores de edad. El incumplimiento de esta norma resultará en la eliminación de la reseña.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-wait"
          >
            {isLoading ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReviewPage;