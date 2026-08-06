export interface InvalidParameter {
  name: string;
  reason: string;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  invalidParameters?: InvalidParameter[];
}

export interface ApiError {
  status: number;
  message: string;
  invalidParameters: InvalidParameter[];
}
