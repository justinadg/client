import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../utils/apiUtils";

export const staffsApi = createApi({
  reducerPath: "staffsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    fetchStaffs: builder.query({
      query: () => "/staffs", // Updated endpoint
      providesTags: ["Staff"],
    }),
    fetchStaffById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ["Staff"],
    }),
    assignStaff: builder.mutation({
      query: ({ id, ...staffData }) => ({
        url: `/staffs/${id}/assign`,
        method: "PATCH",
        body: staffData,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...staffData }) => ({
        url: `/staffs/${id}/update`,
        method: "PATCH",
        body: staffData,
      }),
      invalidatesTags: ["Staff"],
    }),
    unassignStaff: builder.mutation({
      query: (id) => ({
        url: `/staffs/${id}/unassign`,
        method: "PATCH",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useFetchStaffsQuery,
  useFetchStaffByIdQuery,
  useAssignStaffMutation,
  useUpdateStaffMutation,
  useUnassignStaffMutation,
} = staffsApi;
