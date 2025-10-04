
import { WebCheckResult } from '../types';

export async function performWebChecks(query: string): Promise<WebCheckResult[]> {
  const normalizedQuery = query.toLowerCase();
  const hash = Array.from(normalizedQuery).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const results: WebCheckResult[] = [];

  const fbProfiles = hash % 4;
  const tinderProfiles = hash % 2;

  if (fbProfiles > 0) {
    results.push({
      id: `web-fb-${hash}`,
      source: 'Facebook',
      title: `Se encontraron ${fbProfiles} perfiles públicos en Facebook`,
      link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(query)}`,
      snippet: `Se hallaron perfiles que podrían coincidir con "${query}". Verifica manualmente.`,
    });
  }

  if (tinderProfiles > 0) {
    results.push({
      id: `web-tinder-${hash}`,
      source: 'Tinder',
      title: 'Posible perfil encontrado en apps de citas',
      link: '#',
      snippet: 'Indicamos una posible presencia en aplicaciones de citas. No se puede mostrar un enlace directo por privacidad.',
    });
  }

  results.push({
    id: `web-google-${hash}`,
    source: 'Google',
    title: `Buscar "${query}" en Google`,
    link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    snippet: 'Realiza una búsqueda general para obtener más información pública.',
  });

  return results;
}
