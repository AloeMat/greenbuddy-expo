/**
 * Plant Factories
 * Implement Factory and Flyweight patterns
 *
 * Available Factories:
 * - AvatarImageFactory: Shares avatar images across all plants (-95% memory)
 */

export {
  AvatarImageFactory,
  avatarFactory,
  createAvatarImageFactory,
  type AvatarImage,
  type AvatarFactoryStats
} from './AvatarImageFactory';
