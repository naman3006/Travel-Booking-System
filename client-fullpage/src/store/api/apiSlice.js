// src/store/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getDestinations: builder.query({ query: () => '/destinations' }),
    getBooking: builder.query({ query: (id) => `/bookings/${id}` }),
    // ...
  }),
});

export const { useGetDestinationsQuery } = apiSlice;