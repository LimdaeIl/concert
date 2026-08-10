export type PerformanceStatus =
  | 'SCHEDULED'
  | 'OPEN'
  | 'SOLD_OUT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AdminPerformance {
  performanceId: number;
  concertId: number;
  venueHallId: number;

  venueName: string;
  venueHallName: string;

  startsAt: string;
  endsAt: string;

  reservationOpensAt: string;
  reservationClosesAt: string;

  maxTicketsPerMember: number;

  status: PerformanceStatus;
}

export interface GetAdminPerformancesResponse {
  performances: AdminPerformance[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface GetAdminPerformancesParams {
  page: number;
  size: number;

  status?: PerformanceStatus;

  from?: string;
  to?: string;
}

export interface CreatePerformanceRequest {
  venueHallId: number;

  startsAt: string;
  endsAt: string;

  reservationOpensAt: string;
  reservationClosesAt: string;

  maxTicketsPerMember: number;
}

export interface UpdatePerformanceRequest {
  venueHallId: number;

  startsAt: string;
  endsAt: string;

  reservationOpensAt: string;
  reservationClosesAt: string;

  maxTicketsPerMember: number;
}

export interface UpdatePerformanceStatusRequest {
  status: PerformanceStatus;
}
