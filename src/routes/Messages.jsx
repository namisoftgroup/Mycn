// s;
// import { useCallback, useRef, useState } from "react";
// import { Card, Form, Spinner } from "react-bootstrap";
// import { useTranslation } from "react-i18next";
// import useGetMessages from "../hooks/messages/useGetMessages";
// import SubmitButton from "../ui/forms/SubmitButton";
// import NotificationLoader from "../ui/loaders/NotificationLoader";

// export default function Messages() {
//   const { t } = useTranslation();
//   const {
//     messages,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//   } = useGetMessages();

//   const observer = useRef(null);
//   const [replyText, setReplyText] = useState({});

//   const lastMessageRef = useCallback(
//     (node) => {
//       if (isFetchingNextPage) return;

//       if (observer.current) observer.current.disconnect();

//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasNextPage) {
//           fetchNextPage();
//         }
//       });

//       if (node) observer.current.observe(node);
//     },
//     [fetchNextPage, hasNextPage, isFetchingNextPage]
//   );

//   if (isLoading || isFetchingNextPage) {
//     return (
//       <div className="row">
//         {Array.from({ length: 3 }).map((_, index) => (
//           <div className="col-12 p-2" key={index} style={{ height: "240px" }}>
//             <NotificationLoader />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="messages-page ">
//       <div className="row">
//         {messages.map((msg, index) => {
//           const isLast = index === messages.length - 1;

//           return (
//             <div className="col-12 p-2" key={msg.id}>
//               <Card
//                 ref={isLast ? lastMessageRef : null}
//                 className="message-card"
//               >
//                 <Card.Body>
//                   <div className="message-header">
//                     <strong>{msg.admin}</strong>
//                     <span>{msg.created_at}</span>
//                   </div>

//                   <p className="message-text">{msg.message}</p>

//                   {msg.reply ? (
//                     <div className="reply-box">
//                       <strong>Reply</strong>
//                       <p>{msg.reply}</p>
//                     </div>
//                   ) : (
//                     <Form className="form_ui">
//                       <div className="row">
//                         <div className="col-12 p-2">
//                           <Form.Control
//                             as="textarea"
//                             rows={2}
//                             placeholder="Write a reply..."
//                             value={replyText[msg.id] || ""}
//                             onChange={(e) =>
//                               setReplyText({
//                                 ...replyText,
//                                 [msg.id]: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div className="col-12 p-2">
//                           <SubmitButton text={t("Send Reply")} />
//                         </div>
//                       </div>
//                     </Form>
//                   )}
//                 </Card.Body>
//               </Card>
//             </div>
//           );
//         })}
//       </div>

//       {isFetchingNextPage && (
//         <div className="messages-loader">
//           <Spinner animation="border" />
//         </div>
//       )}
//     </div>
//   );
// }
import { useCallback, useRef, useState } from "react";
import { Card, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import SubmitButton from "../ui/forms/SubmitButton";
import NotificationLoader from "../ui/loaders/NotificationLoader";
import useGetMessages from "../hooks/messages/useGetMessages";
import useReply from "../hooks/messages/useReply";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Messages() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetMessages();

  const { reply, isPending, isError, isSuccess, error } = useReply();

  const observer = useRef(null);
  const [replyText, setReplyText] = useState({});

  const lastMessageRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleReply = (messageId) => {
    const replyMessage = replyText[messageId];
    if (!replyMessage?.trim()) return;

    reply(
      { messageId, replyMessage },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          toast.success(res?.message);
        },
        onError: (error) => {
          console.error("Error sending reply:", error);
        },
      }
    );
  };

  const handleFormSubmit = (messageId, e) => {
    e.preventDefault();
    e.stopPropagation();
    handleReply(messageId);
  };

  const handleKeyPress = (e, messageId) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleReply(messageId);
    }
  };

  return (
    <div className="messages-page ">
      {" "}
      <div className="row">
        {!isLoading && messages?.length === 0 && (
          <div className="col-12 p-2">
            <div className="empty_wrap">
              <img src="/icons/messages.svg" alt="empty-box" />
              <h6>{t("empty_messages")}</h6>
            </div>
          </div>
        )}
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          const isReplying = isPending && replyText[msg.id];

          return (
            <div className="col-12 p-2" key={msg.id}>
              <Card
                ref={isLast ? lastMessageRef : null}
                className="message-card"
              >
                <Card.Body>
                  <div className="message-header">
                    <strong>{msg.admin}</strong>
                    <span>{msg.created_at}</span>
                  </div>

                  <p className="message-text">{msg.message}</p>

                  {msg.reply ? (
                    <div className="reply-box">
                      <strong>Reply</strong>
                      <p>{msg.reply}</p>
                    </div>
                  ) : (
                    <Form
                      className="form_ui"
                      onSubmit={(e) => handleFormSubmit(msg.id, e)}
                    >
                      <div className="row">
                        <div className="col-12 p-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Write a reply..."
                            value={replyText[msg.id] || ""}
                            onChange={(e) =>
                              setReplyText({
                                ...replyText,
                                [msg.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => handleKeyPress(e, msg.id)}
                            disabled={isReplying} // تعطيل الحقل أثناء الإرسال
                            className={isError ? "border-danger" : ""}
                          />
                          {isError && error?.message && (
                            <div className="text-danger small mt-1">
                              {error.message}
                            </div>
                          )}
                        </div>
                        <div className="col-12 p-2">
                          <SubmitButton
                            text={t("Send Reply")}
                            onClick={() => handleReply(msg.id)}
                            disabled={!replyText[msg.id]?.trim() || isReplying}
                            loading={isReplying}
                          />
                          <div className="form-text small mt-1">
                            {t("Press Ctrl+Enter to send")}
                          </div>
                        </div>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </div>
          );
        })}

        {(isLoading || isFetchingNextPage) &&
          Array.from({ length: 3 }).map((_, index) => (
            <div className="col-12 p-2" key={index}>
              <NotificationLoader />
            </div>
          ))}
      </div>
    </div>
  );
}
