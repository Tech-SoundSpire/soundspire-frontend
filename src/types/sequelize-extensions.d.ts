
import 'sequelize';

declare module 'sequelize' {
  interface SaveOptions<T> {
    context?: {
      isGoogleSignup?: boolean;
    };
  }

  interface CreateOptions<T> {
    context?: {
      isGoogleSignup?: boolean;
    };
  }
}