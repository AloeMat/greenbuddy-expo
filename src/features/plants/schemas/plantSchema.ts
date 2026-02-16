/**
 * Plant Schema Validation - Zod
 * Valide les entrées utilisateur pour les plantes
 */

import { z } from 'zod';

/**
 * Schema pour créer/éditer une plante
 */
export const plantSchema = z.object({
  nomCommun: z
    .string()
    .min(1, 'Plant name is required')
    .max(50, 'Plant name must be less than 50 characters'),

  nomScientifique: z
    .string()
    .max(100, 'Scientific name must be less than 100 characters')
    .optional(),

  personnalite: z.enum(
    ['cactus', 'orchidee', 'monstera', 'succulente', 'fougere', 'carnivore', 'pilea', 'palmier']
  ).default('succulente'),

  imageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),

  wateringFrequencyDays: z
    .number()
    .int('Watering frequency must be a whole number')
    .min(1, 'Watering frequency must be at least 1 day')
    .max(30, 'Watering frequency must be at most 30 days'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
});

export type PlantFormData = z.infer<typeof plantSchema>;

/**
 * Schema pour l'authentification
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema pour l'enregistrement
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .min(1, 'Password is required'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema pour les préférences utilisateur
 */
export const userPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  language: z.enum(['en', 'fr']).default('en'),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
    })
    .optional(),
});

export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;
