export interface MemberAddress {
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface Member {
  memberId: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  address: MemberAddress | null;
  socialProviders: string[];
}
