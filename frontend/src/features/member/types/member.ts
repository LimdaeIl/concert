export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  phone: string;

  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;

  emailVerificationToken: string;
  phoneVerificationToken: string;
}

export interface SignUpResponse {
  id: number;
}

export interface MemberAddress {
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;
}

export type MemberRole =
    | 'MEMBER'
    | 'ADMIN';

export type SocialProvider =
    | 'GOOGLE'
    | 'KAKAO'
    | 'GITHUB';

export interface MemberMeResponse {
  id: number;
  email: string;
  name: string;
  phone: string;

  role: MemberRole;

  address: MemberAddress;

  socialProviders: SocialProvider[];
}

export interface UpdateMemberProfileRequest {
  name: string;

  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;
}

export interface ChangeEmailRequest {
  email: string;
  verificationToken: string;
}

export interface ChangePhoneRequest {
  phone: string;
  verificationToken: string;
}