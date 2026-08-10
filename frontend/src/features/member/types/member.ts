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

  /*
   * 프로필 이미지가 등록되지 않은 회원은 null.
   *
   * 현재 백엔드에서는
   * Private S3 Object에 대한
   * Presigned GET URL을 반환한다.
   */
  profileImageUrl: string | null;

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

export interface ProfileImageUploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface UpdateProfileImageRequest {
  objectKey: string;
}
