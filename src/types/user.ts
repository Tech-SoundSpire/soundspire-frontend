// types/user.ts
export interface UserAttributes {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  gender: 'male' | 'female';
  date_of_birth?: Date;
  city?: string;
  country?: string;
  mobile_number: string;
  profile_picture_url?: string;
  bio?: string;
  isVerified: boolean;
  is_artist: boolean;
  google_id?: string;
  spotify_linked: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  deleted_at?: Date;
  isAdmin: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
}
