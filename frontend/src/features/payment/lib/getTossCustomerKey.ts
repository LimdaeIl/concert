const STORAGE_KEY =
    'concert_toss_customer_key';

export function getTossCustomerKey(): string {
  const saved =
      localStorage.getItem(STORAGE_KEY);

  if (saved) {
    return saved;
  }

  const customerKey =
      crypto.randomUUID();

  localStorage.setItem(
      STORAGE_KEY,
      customerKey,
  );

  return customerKey;
}
