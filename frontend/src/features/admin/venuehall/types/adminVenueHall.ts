export type VenueHallStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'MAINTENANCE';

export interface AdminVenueHall {
  venueHallId: number;
  venueId: number;
  name: string;
  floor: string | null;
  capacity: number;
  status: VenueHallStatus;
}

export interface GetAdminVenueHallsResponse {
  halls: AdminVenueHall[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminVenueHallsParams {
  page: number;
  size: number;

  keyword?: string;
  status?: VenueHallStatus;
}

export interface CreateVenueHallRequest {
  name: string;
  floor: string | null;
  capacity: number;
}

export interface UpdateVenueHallRequest {
  name: string;
  floor: string | null;
  capacity: number;
}

export interface UpdateVenueHallStatusRequest {
  status: VenueHallStatus;
}
