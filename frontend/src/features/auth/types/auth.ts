export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  id: number;
  accessToken: string;
}

export interface SendEmailVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface SendPhoneVerificationRequest {
  phone: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  verificationCode: string;
}

export interface VerificationTokenResponse {
  verificationToken: string;
}

export interface EmailVerificationResponse {
  email: string;
  verificationToken: string;
  expiresInSeconds: number;
}

export interface PhoneVerificationResponse {
  phone: string;
  verificationToken: string;
  expiresInSeconds: number;
}