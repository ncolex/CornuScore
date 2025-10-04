
import { db } from '../db';
import { personas, reseñas } from '../db/schema';

const data = [
  {
    "Persona Reseñada": "Gerard Piqué",
    "Categoría": "Infidelidad",
    "Calificación": "😡",
    "Texto": "Separación con Shakira tras versiones persistentes de infidelidad; la historia volvió a circular en 2025.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.infobae.com/colombia/2025/09/20/shakira-no-habria-descubierto-a-pique-y-clara-chia-por-la-mermelada-circula-nueva-version-de-la-infidelidad/"
  },
  {
    "Persona Reseñada": "Nicole Kidman",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Ruptura con Keith Urban tras 19 años; reportes indican separación y convivencia por separado, tono cordial público.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://pagesix.com/celebrity-news/celebrity-breakups-of-2025/"
  },
  {
    "Persona Reseñada": "Keith Urban",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Aparece sin anillo tras conocerse el divorcio de Nicole Kidman; primer show sin la alianza.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://nypost.com/2025/10/03/entertainment/keith-urban-ditches-wedding-ring-for-first-performance-after-nicole-kidman-divorce-news/"
  },
  {
    "Persona Reseñada": "Lori Loughlin",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Separación de Mossimo Giannulli tras 28 años; viven separados, sin trámite de divorcio confirmado.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.cosmopolitan.com/entertainment/celebs/a68814999/lori-loughlin-mossimo-giannulli-split-after-28-years-of-marriage/"
  },
  {
    "Persona Reseñada": "Orlando Bloom",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Separación de Katy Perry confirmada; foco en coparentalidad positiva con su hija Daisy.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.instyle.com/orlando-bloom-rare-photo-daughter-daisy-hair-after-katy-perry-split-11824265"
  },
  {
    "Persona Reseñada": "Jessica Mulroney",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Separación de Ben Mulroney tras 16 años; confirmada en 2025.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.eonline.com/photos/37466/2025-celebrity-breakups"
  },
  {
    "Persona Reseñada": "Sydney Sweeney",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Ruptura con Jonathan Davino confirmada en marzo de 2025; relación estaba 'rota hace tiempo'.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.quien.com/espectaculos/2025/09/30/las-rupturas-de-celebridades-mas-sonadas-e-inesperadas-del-2025"
  },
  {
    "Persona Reseñada": "Tim Burton",
    "Categoría": "Positivo",
    "Calificación": "🤔",
    "Texto": "Fin de relación con Monica Bellucci en buenos términos tras dos años.",
    "Autor Pseudo": "Prensa",
    "Evidencia": "https://www.glamour.es/galerias/rupturas-parejas-2025"
  }
];

const categoryMap: { [key: string]: string } = {
  'Infidelidad': 'INFIDELITY',
  'Positivo': 'POSITIVE',
};

async function main() {
  console.log('Seeding database from CSV data...');

  for (const row of data) {
    let persona = await db.query.personas.findFirst({
      where: (personas, { eq }) => eq(personas.nombre, row["Persona Reseñada"]),
    });

    if (!persona) {
      const newPerson = await db.insert(personas).values({ nombre: row["Persona Reseñada"] }).returning();
      persona = newPerson[0];
    }

    if (persona) {
      await db.insert(reseñas).values({
        personaId: persona.id,
        categoria: categoryMap[row.Categoría] || 'POSITIVE',
        calificacion: row.Calificación,
        texto: row.Texto,
        autorPseudo: row["Autor Pseudo"],
        evidencia: row.Evidencia,
        puntaje: row.Calificación === '😡' ? -10 : 10,
      });
    }
  }

  console.log('Database seeded!');
}

main().catch(console.error);
