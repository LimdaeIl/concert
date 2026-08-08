const AUTH_SESSION_KEY =
    'concert_auth_session';

export function hasAuthSession(): boolean {
  return (
      localStorage.getItem(
          AUTH_SESSION_KEY,
      ) === 'true'
  );
}

export function markAuthSession(): void {
  localStorage.setItem(
      AUTH_SESSION_KEY,
      'true',
  );
}

export function clearAuthSession(): void {
  localStorage.removeItem(
      AUTH_SESSION_KEY,
  );
}
