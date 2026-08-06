import { apiClient } from '@/lib/api/apiClient';

import type { Member } from '../types/member';

export async function getMe(): Promise<Member> {
  const { data } =
      await apiClient.get<Member>('/api/v1/members/me');

  return data;
}
