export interface UserVerificationAttributes {
  verification_id: string;
  user_id: string;
  verification_token: string;
  verification_type: "email" | "password_reset" | string;
  expires_at: Date;
  created_at?: Date;
  is_used?: boolean;
}