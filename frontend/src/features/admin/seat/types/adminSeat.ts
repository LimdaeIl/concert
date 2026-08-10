export type SeatType =
    | 'STANDARD'
    | 'WHEELCHAIR'
    | 'COMPANION'
    | 'OBSTRUCTED_VIEW';

export type SeatStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'MAINTENANCE';

export interface AdminSeat {
  seatId: number;
  venueHallId: number;

  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;

  seatType: SeatType;
  status: SeatStatus;
}

export interface GetAdminSeatsResponse {
  seats: AdminSeat[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminSeatsParams {
  page: number;
  size: number;

  keyword?: string;
  floor?: number;
  seatType?: SeatType;
  status?: SeatStatus;
}

export interface CreateSeatItem {
  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: SeatType;
}

export interface BulkCreateSeatsRequest {
  seats: CreateSeatItem[];
}

export interface UpdateSeatRequest {
  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: SeatType;
}

export interface UpdateSeatStatusRequest {
  status: SeatStatus;
}
