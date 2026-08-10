import type {
  SeatType,
} from '@/features/admin/seat/types/adminSeat';

export type SeatGrade =
    | 'VIP'
    | 'R'
    | 'S'
    | 'A'
    | 'B';

export type PerformanceSeatStatus =
    | 'AVAILABLE'
    | 'HELD'
    | 'RESERVED'
    | 'BLOCKED';

export interface AdminPerformanceSeat {
  performanceSeatId: number;
  performanceId: number;
  seatId: number;

  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: SeatType;

  grade: SeatGrade;
  price: number;

  status: PerformanceSeatStatus;

  heldBy: number | null;
  heldUntil: string | null;
}

export interface GetAdminPerformanceSeatsResponse {
  seats: AdminPerformanceSeat[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminPerformanceSeatsParams {
  page: number;
  size: number;

  keyword?: string;
  floor?: number;
  grade?: SeatGrade;
  seatType?: SeatType;
  status?: PerformanceSeatStatus;
}

export interface AdminPerformanceSeatCandidate {
  seatId: number;
  venueHallId: number;

  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: SeatType;
}

export interface GetAdminPerformanceSeatCandidatesResponse {
  performanceId: number;
  venueHallId: number;

  seats: AdminPerformanceSeatCandidate[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminPerformanceSeatCandidatesParams {
  page: number;
  size: number;

  keyword?: string;
  floor?: number;
  seatType?: SeatType;
}

export interface CreatePerformanceSeatItem {
  seatId: number;
  grade: SeatGrade;
  price: number;
}

export interface BulkCreatePerformanceSeatsRequest {
  seats: CreatePerformanceSeatItem[];
}

export interface UpdatePerformanceSeatRequest {
  grade: SeatGrade;
  price: number;
}

export interface UpdatePerformanceSeatStatusRequest {
  status:
      | 'AVAILABLE'
      | 'BLOCKED';
}
