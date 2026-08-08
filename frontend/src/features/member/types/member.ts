export interface MemberAddress {
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface MemberMeResponse {
  memberId: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  address: MemberAddress;
  socialProviders: string[];
}

export interface UpdateMemberProfileRequest {
  name: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface ChangeEmailRequest {
  email: string;
  emailVerificationToken: string;
}

export interface ChangePhoneRequest {
  phone: string;
  phoneVerificationToken: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  phone: string;

  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;

  latitude: number;
  longitude: number;

  emailVerificationToken: string;
  phoneVerificationToken: string;
}

export interface SignUpResponse {
  memberId: number;
  email: string;
  name: string;
  role: string;
  status: string;
}
