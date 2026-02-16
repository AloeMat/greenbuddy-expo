/**
 * Validation schemas for authentication forms using Zod
 * Centralized validation logic for login and register screens
 */

import { z } from 'zod';

/**
 * Login form validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(6, 'Au moins 6 caractères'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form validation
 */
export const registerSchema = z
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
    path: ['confirmPassword']
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
