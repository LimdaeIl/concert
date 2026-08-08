export interface Performance {
  performanceId: number;
  concertId: number;
  venueHallId: number;
  startsAt: string;
  endsAt: string;
  reservationOpensAt: string;
  reservationClosesAt: string;
  maxTicketsPerMember: number;
  status: string;
}

export interface PerformanceListResponse {
  performances: Performance[];
}

export type PerformanceDetailResponse =
    Performance;

export interface PerformanceSeat {
  performanceSeatId: number;
  performanceId: number;
  seatId: number;
  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: string;
  grade: string;
  price: number;
  status: string;
}

export interface PerformanceSeatListResponse {
  seats: PerformanceSeat[];
}

export interface ReservationPaymentSummary {
  paymentId: number;
  paymentNumber: string;
  provider: string;
  method: string | null;
  status: string;
  approvedAt: string | null;
}

export interface MyReservationItem {
  reservationId: number;
  reservationNumber: string;
  reservationStatus: string;

  concertId: number;
  concertTitle: string;
  posterUrl: string;

  performanceId: number;
  startsAt: string;
  endsAt: string;

  venueId: number;
  venueName: string;

  venueHallId: number;
  venueHallName: string;

  ticketCount: number;
  totalAmount: number;

  payment: ReservationPaymentSummary | null;

  reservedAt: string;

  canCancel: boolean;
  cancelType: string | null;
  requiresPayment: boolean;
  refundStatus: string | null;
}

export interface MyReservationPageResponse {
  content: MyReservationItem[];

  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}