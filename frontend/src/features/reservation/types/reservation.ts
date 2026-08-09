export interface CreateReservationRequest {
  performanceSeatIds: number[];
}

export interface CreateReservationResponse {
  reservationId: number;
  reservationNumber?: string;
  performanceId?: number;
  totalAmount?: number;
  status?: string;
  expiresAt?: string;
}

export interface ReservationSeat {
  reservationSeatId: number;
  performanceSeatId: number;
  grade: string;
  price: number;
}

export interface ReservationDetail {
  reservationId: number;
  reservationNumber: string;
  performanceId: number;
  totalAmount: number;
  status: string;
  expiresAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  seats: ReservationSeat[];
}

export interface ReservationListResponse {
  reservations: ReservationDetail[];
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
  posterUrl: string | null;

  performanceId: number;
  startsAt: string;
  endsAt: string;

  venueId: number;
  venueName: string;

  venueHallId: number;
  venueHallName: string;

  ticketCount: number;
  totalAmount: number;

  payment: MyReservationPayment | null;

  reservedAt: string;

  canCancel: boolean;
  cancelType: string;

  requiresPayment: boolean;
  refundStatus: string;
}

export interface MyReservationPageResponse {
  content: MyReservationItem[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;
}

export interface MyReservationConcert {
  concertId: number;
  title: string;
  subtitle: string;
  category: string;
  runningTime: number;
  ageRating: string;
  posterUrl: string;
}

export interface MyReservationPerformance {
  performanceId: number;
  startsAt: string;
  endsAt: string;
  reservationOpensAt: string;
  reservationClosesAt: string;
}

export interface MyReservationVenue {
  venueId: number;
  name: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  zipCode: string;

  venueHallId: number;
  venueHallName: string;
  venueHallFloor: string;
}

export interface MyReservationPayment {
  paymentId: number;
  paymentNumber: string;
  provider: string;
  method: string | null;
  status: string;
  approvedAt: string | null;
}

export interface MyReservationSeat {
  reservationSeatId: number;
  performanceSeatId: number;
  seatId: number;

  sectionName: string;
  floor: number;
  rowName: string;
  seatNumber: string;
  seatType: string;

  grade: string;
  price: number;
}

export interface MyReservationDetail {
  reservationId: number;
  reservationNumber: string;
  reservationStatus: string;

  totalAmount: number;

  expiresAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  reservedAt: string;

  canCancel: boolean;
  cancelType: string | null;

  requiresPayment: boolean;
  refundStatus: string | null;

  concert: MyReservationConcert;
  performance: MyReservationPerformance;
  venue: MyReservationVenue;

  payment: MyReservationPayment | null;

  seats: MyReservationSeat[];
}

export interface PendingReservation {
  reservationId: number;
  reservationNumber: string;

  ticketCount: number;
  totalAmount: number;

  expiresAt: string | null;
}

export interface ReservationContext {
  maxTicketsPerMember: number;

  reservedTicketCount: number;
  remainingTicketCount: number;

  pendingReservation:
    | PendingReservation
    | null;
}
