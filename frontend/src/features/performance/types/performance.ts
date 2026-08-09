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

export type PerformanceDetailResponse = Performance;