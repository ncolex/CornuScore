import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ReviewCategory } from '../types';
import { submitReview } from '../services/airtableService';
import { CATEGORIES } from '../constants';
import GeneratedReviewCard from '../components/GeneratedReviewCard';

interface GeneratedResult {
    personIdentifier: string;
    text: string;
    country: string;
    category: ReviewCategory;
}

const AIGeneratorPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<GeneratedResult[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [topic, setTopic] = useState('Rupturas de parejas famosas 2024');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setResults([]);
        setSources([]);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Busca en internet usando Google Search sobre "${topic}". Para cada evento encontrado, extrae la siguiente información: el nombre de una de las personas involucradas (personIdentifier), un resumen del evento en menos de 200 caracteres (text), el país principal asociado a la persona (country), y clasifica el motivo en una de estas categorías: 'INFIDELITY', 'THEFT', 'BETRAYAL', 'TOXIC', 'POSITIVE'.`,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                personIdentifier: { type: Type.STRING },
                                text: { type: Type.STRING },
                                country: { type: Type.STRING },
                                category: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const jsonText = response.text.trim();
            const parsedResults = JSON.parse(jsonText);

            const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setSources(groundingSources);

            if (Array.isArray(parsedResults)) {
                setResults(parsedResults.filter(r => r.personIdentifier && r.text && r.category && r.country && CATEGORIES[r.category as ReviewCategory]));
            } else {
                throw new Error("La respuesta de la IA no es un array.");
            }

        } catch (e: any) {
            setError('Error al generar contenido. La respuesta de la IA puede no ser un JSON válido o la búsqueda no arrojó resultados estructurables. Intenta con otro tema.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddReview = async (result: GeneratedResult) => {
        const score = CATEGORIES[result.category]?.score ?? 0;
        const success = await submitReview({
            ...result,
            score,
            pseudoAuthor: 'AI Analyst',
            evidenceUrl: sources.length > 0 ? sources[0].web.uri : undefined, // Use first source as evidence
        });
        return success;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 mb-8">
                <h1 className="text-3xl font-bold text-center text-pink-500 mb-4 flex items-center justify-center gap-3">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Generador de Contenido con IA
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Busca noticias en la web para generar borradores de reseñas. Revisa cuidadosamente cada sugerencia antes de publicarla.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Famosos infieles 2023"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-2 font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Generando...</>
                        ) : (
                            'Generar'
                        )}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg mb-6">{error}</p>}
            
            {sources.length > 0 && (
                <div className="mb-6 bg-white/70 p-4 rounded-lg shadow-md">
                    <h3 className="font-bold text-gray-700 mb-2">Fuentes Encontradas:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                                    {source.web.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {results.length > 0 && (
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Resultados Sugeridos</h2>
                    {results.map((result, index) => (
                        <GeneratedReviewCard 
                            key={`${result.personIdentifier}-${index}`} 
                            result={result} 
                            onAddReview={handleAddReview}
                        />
                    ))}
                </div>
            )}
             { !isLoading && results.length === 0 && sources.length > 0 && (
                 <div className="text-center bg-white/80 p-8 rounded-2xl shadow-lg">
                    <i className="fa-solid fa-file-circle-question text-5xl text-pink-300 mb-4"></i>
                    <p className="text-gray-600">La búsqueda encontró fuentes, pero la IA no pudo extraer datos estructurados. Prueba reformulando tu tema.</p>
                </div>
             )}
        </div>
    );
};

export default AIGeneratorPage;