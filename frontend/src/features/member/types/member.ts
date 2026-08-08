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

export interface MemberMeResponse {
  id: number;
  email: string;
  name: string;
  phone: string;

  address: MemberAddress;
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
