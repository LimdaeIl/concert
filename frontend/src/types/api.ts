export interface InvalidParameter {
  name: string;
  reason: string;
}

export interface ApiProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  invalidParameters?: InvalidParameter[];
}