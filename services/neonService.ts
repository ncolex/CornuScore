
import { Pool } from '@neondatabase/serverless';
import { Review, PersonProfile, UserProfile, ReviewCategory, ReputationLevel, RegisteredUser } from '../types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  console.log("Initializing database...");
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        country VARCHAR(255),
        total_score INTEGER,
        reputation VARCHAR(255)
      );
    `);
    console.log("Table 'persons' created or already exists.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS person_identifiers (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES persons(id),
        identifier VARCHAR(255) UNIQUE
      );
    `);
    console.log("Table 'person_identifiers' created or already exists.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES persons(id),
        user_id INTEGER REFERENCES users(id),
        category VARCHAR(255),
        text TEXT,
        score INTEGER,
        date TIMESTAMPTZ,
        pseudo_author VARCHAR(255),
        confirmations INTEGER,
        evidence_url VARCHAR(255)
      );
    `);
    console.log("Table 'reviews' created or already exists.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        contribution_score INTEGER
      );
    `);
    console.log("Table 'users' created or already exists.");
    console.log("Database initialization complete.");
  } catch (error) {
    console.error("Error during database initialization:", error);
  } finally {
    client.release();
  }
}

export const registerUser = async (userData: { phone: string; email?: string; password?: string }): Promise<{ success: boolean; message: string; user?: RegisteredUser }> => {
    const client = await pool.connect();
    try {
        const existingUser = await client.query('SELECT * FROM users WHERE phone = $1 OR email = $2', [userData.phone, userData.email]);
        if (existingUser.rows.length > 0) {
            return { success: false, message: 'El número de teléfono o correo electrónico ya está registrado.' };
        }

        const result = await client.query(
            'INSERT INTO users (phone, email, password_hash, contribution_score) VALUES ($1, $2, $3, 0) RETURNING *',
            [userData.phone, userData.email, userData.password ? `hashed_${userData.password}` : null]
        );

        const newUser = result.rows[0];
        return { success: true, message: 'Registro exitoso.', user: {
            id: newUser.id,
            phone: newUser.phone,
            email: newUser.email,
            passwordHash: newUser.password_hash,
            contributionScore: newUser.contribution_score
        } };
    } finally {
        client.release();
    }
};

export const getUserProfile = async (phone?: string): Promise<UserProfile | null> => {
    if (!phone) return null;

    const client = await pool.connect();
    try {
        const userResult = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (userResult.rows.length === 0) {
            return null;
        }

        const dbUser = userResult.rows[0];

        const reviewsResult = await client.query('SELECT * FROM reviews WHERE user_id = $1', [dbUser.id]);

        return {
            id: dbUser.id,
            pseudoUsername: `user***${dbUser.phone.slice(-4)}`,
            contributionScore: dbUser.contribution_score,
            reviews: reviewsResult.rows.map(r => ({
                id: r.id,
                category: r.category,
                text: r.text,
                score: r.score,
                date: r.date,
                pseudoAuthor: r.pseudo_author,
                confirmations: r.confirmations,
                evidenceUrl: r.evidence_url,
                personReviewed: r.person_id // This will be just the id, will need to resolve to a name
            }))
        };
    } finally {
        client.release();
    }
};

const calculateReputation = (score: number): ReputationLevel => {
    if (score > 0) return ReputationLevel.Positive;
    if (score > -3) return ReputationLevel.Warning;
    return ReputationLevel.Risk;
};

export const submitReview = async (reviewData: { personIdentifier: string, country: string, category: ReviewCategory, text: string, score: number, userId: number, evidenceUrl?: string, pseudoAuthor?: string }): Promise<boolean> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let personResult = await client.query('SELECT person_id FROM person_identifiers WHERE identifier = $1', [reviewData.personIdentifier]);
        let personId;

        if (personResult.rows.length > 0) {
            personId = personResult.rows[0].person_id;
        } else {
            const newPersonResult = await client.query('INSERT INTO persons (country, total_score, reputation) VALUES ($1, 0, $2) RETURNING id', [reviewData.country, ReputationLevel.Unknown]);
            personId = newPersonResult.rows[0].id;
            await client.query('INSERT INTO person_identifiers (person_id, identifier) VALUES ($1, $2)', [personId, reviewData.personIdentifier]);
        }

        await client.query(
            'INSERT INTO reviews (person_id, user_id, category, text, score, date, pseudo_author, confirmations, evidence_url) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 0, $7)',
            [personId, reviewData.userId, reviewData.category, reviewData.text, reviewData.score, reviewData.pseudoAuthor || 'Anónimo', reviewData.evidenceUrl]
        );

        const scoreResult = await client.query('SELECT SUM(score) as total_score FROM reviews WHERE person_id = $1', [personId]);
        const totalScore = parseInt(scoreResult.rows[0].total_score, 10);
        const newReputation = calculateReputation(totalScore);

        await client.query('UPDATE persons SET total_score = $1, reputation = $2 WHERE id = $3', [totalScore, newReputation, personId]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error submitting review:", error);
        return false;
    } finally {
        client.release();
    }
};

export const getProfileByQuery = async (query: string): Promise<PersonProfile | null> => {
    const normalizedQuery = query.toLowerCase().trim().replace(/[\s._-]+/g, '');
    if (!normalizedQuery) return null;

    const client = await pool.connect();
    try {
        const identifierResult = await client.query(
            'SELECT person_id FROM person_identifiers WHERE identifier ILIKE $1',
            [`%${normalizedQuery}%`]
        );

        if (identifierResult.rows.length === 0) {
            return null;
        }

        const personId = identifierResult.rows[0].person_id;

        const personResult = await client.query('SELECT * FROM persons WHERE id = $1', [personId]);
        if (personResult.rows.length === 0) {
            return null;
        }

        const dbPerson = personResult.rows[0];

        const reviewsResult = await client.query('SELECT * FROM reviews WHERE person_id = $1', [personId]);
        const identifiersResult = await client.query('SELECT identifier FROM person_identifiers WHERE person_id = $1', [personId]);

        return {
            id: dbPerson.id,
            identifiers: identifiersResult.rows.map(r => r.identifier),
            country: dbPerson.country,
            totalScore: dbPerson.total_score,
            reputation: dbPerson.reputation,
            reviews: reviewsResult.rows.map(r => ({
                id: r.id,
                category: r.category,
                text: r.text,
                score: r.score,
                date: r.date,
                pseudoAuthor: r.pseudo_author,
                confirmations: r.confirmations,
                evidenceUrl: r.evidence_url
            }))
        };
    } finally {
        client.release();
    }
};

export const getRankings = async (): Promise<{ topNegative: PersonProfile[], topPositive: PersonProfile[] }> => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM persons ORDER BY total_score ASC');
        const allPersons = result.rows;

        const topNegative = allPersons.slice(0, 5).map(p => ({
            id: p.id,
            identifiers: [], // Will be populated later if needed
            country: p.country,
            totalScore: p.total_score,
            reputation: p.reputation,
            reviews: [] // Will be populated later if needed
        }));

        const topPositive = allPersons.slice().reverse().slice(0, 5).map(p => ({
            id: p.id,
            identifiers: [], // Will be populated later if needed
            country: p.country,
            totalScore: p.total_score,
            reputation: p.reputation,
            reviews: [] // Will be populated later if needed
        }));

        return { topNegative, topPositive };
    } finally {
        client.release();
    }
};
