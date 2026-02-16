/**
 * Validation schemas for onboarding forms using Zod
 * Centralized validation logic for page8 and page9
 */

import { z } from 'zod';

/**
 * Page8: Plant name + personality form
 */
export const page8Schema = z.object({
  plantName: z
    .string()
    .min(1, 'Nom requis')
    .max(50, 'Maximum 50 caractères'),
  personality: z
    .enum(['funny', 'gentle', 'expert'])
    .refine((val) => ['funny', 'gentle', 'expert'].includes(val), {
      message: 'Veuillez sélectionner une personnalité'
    })
});

export type Page8FormData = z.infer<typeof page8Schema>;

/**
 * Page9: Signup form with email, password validation
 */
export const page9Schema = z
  .object({
    email: z
      .string()
      .min(1, 'Email requis')
      .email('Email invalide'),
    password: z
      .string()
      .min(6, 'Au moins 6 caractères')
      .max(128, 'Maximum 128 caractères'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmation requise')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'] // This sets which field the error appears on
  });

export type Page9FormData = z.infer<typeof page9Schema>;
