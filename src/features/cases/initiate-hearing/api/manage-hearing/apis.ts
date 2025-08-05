import { api } from "@services/config/api";

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<any[], void>({
      query: () => 'posts',
    }),
  }),
});

export const {
  useGetPostsQuery
} = caseApi;
