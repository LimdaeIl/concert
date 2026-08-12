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

/*
 * ============================================================
 * Admin Performance Seat
 * ============================================================
 */

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

/*
 * ============================================================
 * Performance Seat List
 * ============================================================
 */

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

/*
 * ============================================================
 * 기존 Candidate List
 *
 * 검색 / 필터 / pagination 용 API.
 * 기존 endpoint를 유지한다.
 * ============================================================
 */

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

/*
 * ============================================================
 * Candidate Seat Map
 *
 * 판매 좌석 추가 배치도 전용.
 * pagination 없이 전체 후보 좌석을 내려받는다.
 * ============================================================
 */

export interface AdminPerformanceSeatCandidateMapSeat {
  seatId: number;
  venueHallId: number;

  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;

  seatType: SeatType;
}

export interface GetAdminPerformanceSeatCandidateMapResponse {
  performanceId: number;
  venueHallId: number;

  performanceStatus: string;

  candidateSeatCount: number;

  seats: AdminPerformanceSeatCandidateMapSeat[];
}

/*
 * ============================================================
 * Create
 * ============================================================
 */

export interface CreatePerformanceSeatItem {
  seatId: number;
  grade: SeatGrade;
  price: number;
}

export interface BulkCreatePerformanceSeatsRequest {
  seats: CreatePerformanceSeatItem[];
}

/*
 * ============================================================
 * Update
 * ============================================================
 */

export interface UpdatePerformanceSeatRequest {
  grade: SeatGrade;
  price: number;
}

export interface UpdatePerformanceSeatStatusRequest {
  status:
      | 'AVAILABLE'
      | 'BLOCKED';
}
