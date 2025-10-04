import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    phoneNumber: varchar('phone_number', { length: 50 }).unique(),
    password: varchar('password', { length: 255 }),
    googleId: varchar('google_id', { length: 255 }).unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const personas = pgTable('personas', {
    id: serial('id').primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    pais: varchar('pais', { length: 255 }),
    instagram: varchar('instagram', { length: 255 }),
    celular: varchar('celular', { length: 50 }),
    email: varchar('email', { length: 255 }),
    apodo: varchar('apodo', { length: 255 }),
});

export const reseñas = pgTable('reseñas', {
    id: serial('id').primaryKey(),
    personaId: integer('persona_id').references(() => personas.id),
    userId: integer('user_id').references(() => users.id),
    fecha: timestamp('fecha').defaultNow(),
    categoria: varchar('categoria', { length: 50 }),
    calificacion: varchar('calificacion', { length: 10 }),
    puntaje: integer('puntaje'),
    texto: text('texto'),
    autorPseudo: varchar('autor_pseudo', { length: 255 }),
    evidencia: varchar('evidencia', { length: 1024 }),
    confirmaciones: integer('confirmaciones').default(0),
    status: varchar('status', { length: 50 }).default('published'), // e.g., published, hidden
});

export const usersRelations = relations(users, ({ many }) => ({
    reseñas: many(reseñas),
}));

export const personasRelations = relations(personas, ({ many }) => ({
    reseñas: many(reseñas),
}));

export const reseñasRelations = relations(reseñas, ({ one }) => ({
    persona: one(personas, {
        fields: [reseñas.personaId],
        references: [personas.id],
    }),
    user: one(users, {
        fields: [reseñas.userId],
        references: [users.id],
    }),
}));