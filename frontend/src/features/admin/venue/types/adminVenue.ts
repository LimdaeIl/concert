export type VenueStatus =
    | 'ACTIVE'
    | 'INACTIVE';

export interface Venue {
  venueId: number;
  name: string;
  phone: string | null;
  status: VenueStatus;

  roadAddress: string;
  jibunAddress: string | null;
  detailAddress: string | null;
  zipCode: string | null;

  latitude: number | null;
  longitude: number | null;
}

export interface CreateVenueRequest {
  name: string;
  phone: string | null;

  roadAddress: string;
  jibunAddress: string | null;
  detailAddress: string | null;
  zipCode: string | null;

  latitude: number | null;
  longitude: number | null;
}

export interface UpdateVenueRequest {
  name: string;
  phone: string | null;

  roadAddress: string;
  jibunAddress: string | null;
  detailAddress: string | null;
  zipCode: string | null;

  latitude: number | null;
  longitude: number | null;
}

export interface UpdateVenueStatusRequest {
  status: VenueStatus;
}
