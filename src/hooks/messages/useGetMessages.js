import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";

export default function useGetMessages() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages"],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await axiosInstance.get("/messages", {
          params: {
            page: pageParam,
            limit_per_page: 10,
          },
        });
        console.log(res.data);

        return res.data;
      },
      getNextPageParam: (lastPage) => {
        // Laravel pagination
        if (lastPage.current_page < lastPage.last_page) {
          return lastPage.current_page + 1;
        }
        return undefined;
      },
    });

  // Flatten paginated data
  const messages = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
