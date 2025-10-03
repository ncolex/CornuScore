import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReview, SubmitReviewEvidence } from '../services/airtableService';
import { CATEGORIES, COUNTRY_LIST } from '../constants';
import { ReviewCategory } from '../types';

const countryList = COUNTRY_LIST;

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg'];
const MAX_EVIDENCE_SIZE_MB = 2;
const MAX_EVIDENCE_SIZE_BYTES = MAX_EVIDENCE_SIZE_MB * 1024 * 1024;

const NewReviewPage: React.FC = () => {
  const [personIdentifier, setPersonIdentifier] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [country, setCountry] = useState('Argentina');
  const COUNTRY_STORAGE_KEY = 'cornuscore-country';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (stored) setCountry(stored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (country) window.localStorage.setItem(COUNTRY_STORAGE_KEY, country);
    } catch {}
  }, [country]);
  const [category, setCategory] = useState<ReviewCategory | null>(null);
  const [text, setText] = useState('');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceAttachment, setEvidenceAttachment] = useState<SubmitReviewEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const navigate = useNavigate();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setEvidencePreview(null);
      setEvidenceAttachment(null);
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes .jpg o .png.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_EVIDENCE_SIZE_BYTES) {
      setError(`La imagen debe pesar menos de ${MAX_EVIDENCE_SIZE_MB} MB.`);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.min(60, Math.round((ev.loaded / ev.total) * 60));
        setUploadProgress(pct);
      }
    };
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEvidencePreview(reader.result);
        setEvidenceAttachment({
          dataUrl: reader.result,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
        });
        setUploadProgress(60);
        setError('');
      }
    };
    reader.onerror = () => {
      setError('No se pudo procesar la imagen. Intenta con otro archivo.');
      setEvidencePreview(null);
      setEvidenceAttachment(null);
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedIdentifier = personIdentifier.trim();
    const trimmedDescription = text.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedReporterName = reporterName.trim();
    const trimmedReporterPhone = reporterPhone.trim();

    if (
      !country ||
      !category ||
      !trimmedDescription ||
      !trimmedPhoneNumber ||
      !trimmedReporterName ||
      !trimmedReporterPhone
    ) {
      setError('Por favor, completa todos los campos obligatorios, incluido tu nombre y número de celular.');
      return;
    }

    const subjectDigits = trimmedPhoneNumber.replace(/\D/g, '');
    if (subjectDigits.length < 6) {
      setError('Ingresa un número de celular válido de tu ex (al menos 6 dígitos).');
      return;
    }

    const reporterDigits = trimmedReporterPhone.replace(/\D/g, '');
    if (reporterDigits.length < 6) {
      setError('Ingresa tu número de celular válido (al menos 6 dígitos).');
      return;
    }

    const resolvedIdentifier = trimmedIdentifier || trimmedPhoneNumber;
    const selectedCategory = category as ReviewCategory;
    setError('');
    setIsLoading(true);

    const rating = CATEGORIES[selectedCategory].emoji;

    const success = await submitReview({
      personIdentifier: resolvedIdentifier,
      nickname,
      email,
      phoneNumber: trimmedPhoneNumber,
      instagram,
      country,
      category: selectedCategory,
      text: trimmedDescription,
      rating,
      reporterName: trimmedReporterName,
      reporterPhone: trimmedReporterPhone,
      evidence: evidenceAttachment ?? undefined,
    }, {
      onProgress: (p) => setUploadProgress((prev) => Math.max(prev, p)),
    });

    setIsLoading(false);

    if (success) {
      alert('Reseña enviada con éxito. Gracias por tu contribución.');
      navigate(`/results/${encodeURIComponent(trimmedPhoneNumber)}`);
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
                Nombre de tu ex (opcional)
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Nombre, apodo principal..."
                value={personIdentifier}
                onChange={(event) => setPersonIdentifier(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Apodo (opcional)
              </label>
              <input
                id="nickname"
                type="text"
                placeholder="Apodo secundario..."
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Celular de tu ex <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+54911..."
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                inputMode="tel"
                required
              />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario de Instagram (opcional)
              </label>
              <input
                id="instagram"
                type="text"
                placeholder="@usuario_instagram"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                País / Región <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                required
              >
                <option value="" disabled>Selecciona un país</option>
                {countryList.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tus datos de contacto <span className="text-red-500">*</span></h2>
            <p className="text-sm text-gray-500 mb-4">Solo el equipo moderador verá esta información para validar la denuncia.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="reporterName"
                  type="text"
                  placeholder="Nombre y apellido"
                  value={reporterName}
                  onChange={(event) => setReporterName(event.target.value)}
                  className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="reporterPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu número de celular <span className="text-red-500">*</span>
                </label>
                <input
                  id="reporterPhone"
                  type="tel"
                  placeholder="Tu celular..."
                  value={reporterPhone}
                  onChange={(event) => setReporterPhone(event.target.value)}
                  className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-full shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  inputMode="tel"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, value]) => {
                const typedKey = key as ReviewCategory;
                const isSelected = category === typedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(typedKey)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-full text-sm transition-all ${isSelected ? 'bg-pink-500 text-white ring-2 ring-pink-300 border-pink-500' : 'bg-white border-pink-200 hover:bg-pink-50'}`}
                  >
                    <span>{value.emoji}</span>
                    <span>{value.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Tu experiencia (máx. 200 caracteres) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={200}
              rows={4}
              className="w-full px-5 py-3 text-base border-2 border-pink-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
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
              accept={ACCEPTED_MIME_TYPES.join(',')}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {(evidenceAttachment || isLoading) && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-pink-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cargando imagen... {uploadProgress}%</p>
              </div>
            )}
            {/* Airtable links removed per request */}
            {evidencePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Vista previa:</p>
                <img src={evidencePreview} alt="Evidence preview" className="rounded-lg max-h-48 border shadow-sm" />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center text-xs text-gray-700 bg-yellow-100/80 border border-yellow-300 p-3 rounded-lg">
            <p className="font-bold text-yellow-800">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i>Aviso Importante
            </p>
            <p>Está estrictamente prohibido incluir nombres o cualquier información de menores de edad. El incumplimiento de esta norma resultará en la eliminación de la reseña.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 text-xl font-bold text-white bg-pink-500 rounded-full shadow-lg ring-2 ring-sky-300 hover:bg-pink-600 transform hover:scale-[1.01] transition-all disabled:bg-gray-400 disabled:cursor-wait"
          >
            {isLoading ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReviewPage;
