import { WebCheckResult } from '../types';

export const performWebChecks = async (query: string): Promise<WebCheckResult[]> => {
    console.log(`Performing web check for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate a longer delay for web scraping/API calls

    const results: WebCheckResult[] = [];
    const normalizedQuery = query.toLowerCase().trim();
    const hash = normalizedQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isLikelyPhoneNumber = /^\+?[\d\s-]{7,}$/.test(query);
    
    // Add generic search engine links for all queries
    results.push({
        id: `web-google`,
        source: 'Google',
        title: `Buscar "${query}" en Google`,
        link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Realiza una búsqueda general para encontrar información pública.`,
        status: 'info'
    });
    results.push({
        id: `web-duck`,
        source: 'DuckDuckGo',
        title: `Buscar "${query}" en DuckDuckGo`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `Busca en DuckDuckGo con un enfoque en la privacidad.`,
        status: 'info'
    });
    results.push({
        id: `web-yandex`,
        source: 'Yandex',
        title: `Buscar "${query}" en Yandex`,
        link: `https://yandex.com/search/?text=${encodeURIComponent(query)}`,
        snippet: `Yandex puede ser útil para encontrar resultados en otras regiones.`,
        status: 'info'
    });
    results.push({
        id: `web-facebook`,
        source: 'Facebook',
        title: `Buscar "${query}" en Facebook`,
        link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(query)}`,
        snippet: `Busca perfiles, páginas y grupos en Facebook.`,
        status: 'info'
    });
    results.push({
        id: `web-tiktok`,
        source: 'TikTok',
        title: `Buscar "${query}" en TikTok`,
        link: `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Busca perfiles y contenido en la plataforma de TikTok.`,
        status: 'info'
    });

    // Badoo check with found/not_found status
    if (hash % 3 === 0 && !isLikelyPhoneNumber) { // 1 in 3 chance of finding a profile
        results.push({
            id: `web-badoo`,
            source: 'Badoo',
            title: `Se encontró un perfil en Badoo`,
            link: `https://badoo.com/es/search/?q=${encodeURIComponent(query)}`,
            snippet: `Se detectó una coincidencia que requiere verificación manual.`,
            status: 'found',
            screenshotUrl: 'https://i.imgur.com/gfZiEol.png'
        });
    } else {
        results.push({
            id: `web-badoo`,
            source: 'Badoo',
            title: `No se encontraron perfiles en Badoo`,
            link: `#`,
            snippet: `La búsqueda automática no arrojó resultados claros en esta plataforma.`,
            status: 'not_found'
        });
    }

    results.push({
        id: `web-skokka`,
        source: 'Skokka',
        title: `Búsqueda de acompañantes en Skokka`,
        link: `https://www.skokka.com/buscar?q=${encodeURIComponent(query)}`,
        snippet: `Verifica si hay perfiles relacionados en sitios de acompañantes.`,
        status: 'info'
    });

    // Add simulated social media checks only if it's NOT likely a phone number
    if (!isLikelyPhoneNumber) {
        const tinderProfiles = (hash % 2); // 0 or 1
        if (tinderProfiles > 0) {
            results.unshift({
                id: `web-tinder-${hash}`,
                source: 'Tinder',
                title: `Posible perfil en apps de citas`,
                link: `#`,
                snippet: `Indicios de presencia en apps de citas (Tinder, etc.).`,
                status: 'found'
            });
        }
    }

    return results;
};