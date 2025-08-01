// types/user.ts
export interface UserAttributes {
  user_id: string;
  username: string;
  email: string;
  password_hash?: string | null;
  full_name?: string | null;
  gender?: 'Male' | 'Female'| 'Other' | null;
  date_of_birth?: Date | null;
  city?: string | null;
  country?: string;
  mobile_number?: string | null;
  profile_picture_url?: string;
  bio?: string;
  is_verified: boolean;
  is_artist: boolean;
  google_id?: string;
  spotify_linked: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  deleted_at?: Date;
}
