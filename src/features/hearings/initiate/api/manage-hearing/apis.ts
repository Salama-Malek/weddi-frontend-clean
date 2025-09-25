import { api } from "@/services/apiClient";

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<any[], void>({
      query: () => "posts",
    }),
  }),
});

export const { useGetPostsQuery } = caseApi;
