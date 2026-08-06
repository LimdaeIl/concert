export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  id: number;
  accessToken: string;
}
