import {
  apiClient,
  publicApiClient,
} from '@/lib/api/apiClient';

import type {
  CreateVenueRequest,
  UpdateVenueRequest,
  UpdateVenueStatusRequest,
  Venue,
} from '../types/adminVenue';

export interface GetVenuesResponse {
  venues: Venue[];
}

export async function getAdminVenues():
    Promise<GetVenuesResponse> {
  const { data } =
      await publicApiClient.get<GetVenuesResponse>(
          '/api/v1/venues',
      );

  return data;
}

export async function getAdminVenue(
    venueId: number,
): Promise<Venue> {
  const { data } =
      await publicApiClient.get<Venue>(
          `/api/v1/venues/${venueId}`,
      );

  return data;
}

export async function createVenue(
    request: CreateVenueRequest,
): Promise<Venue> {
  const { data } =
      await apiClient.post<Venue>(
          '/api/v1/admin/venues',
          request,
      );

  return data;
}

export async function updateVenue(
    venueId: number,
    request: UpdateVenueRequest,
): Promise<Venue> {
  const { data } =
      await apiClient.patch<Venue>(
          `/api/v1/admin/venues/${venueId}`,
          request,
      );

  return data;
}

export async function updateVenueStatus(
    venueId: number,
    request: UpdateVenueStatusRequest,
): Promise<Venue> {
  const { data } =
      await apiClient.patch<Venue>(
          `/api/v1/admin/venues/${venueId}/status`,
          request,
      );

  return data;
}