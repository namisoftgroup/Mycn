import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";

export default function useReply() {
  const {
    mutate: reply,
    isPending,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation({
    mutationFn: async ({ messageId, replyMessage }) => {
      const res = await axiosInstance.post(`/messages/${messageId}`, {
        reply: replyMessage,
        _method: "put",
      });
      if (res.data.code !== 200) {
        throw new Error(res.data.message || "Error replying to message");
      }
      return res.data;
    },
  });
  return { reply, isPending, isError, isSuccess, data, error };
}
