import { createContext, useContext, useEffect, useCallback, useState } from "react";
import socket from "../socket";
import api from "../api/api";

const MessageContext = createContext();

export const MessageProvider = ({ children, user }) => {

  const [count, setCount] = useState(0);

  // =========================
  // OBTENER MENSAJES NO LEÍDOS
  // =========================

  const fetchUnreadMessages = useCallback(async () => {

    if (!user?._id) {
      setCount(0);
      return;
    }

    try {

      const data = await api.get("/messages/unread");

      setCount(data.count);

    } catch (error) {

      console.error(
        "Error obteniendo mensajes no leídos:",
        error
      );

    }

  }, [user?._id]);


  // =========================
  // SOCKET
  // =========================

  useEffect(() => {

    if (!user?._id) {
      setCount(0);
      return;
    }

    const handleNewMessage = (message) => {

      const receiverId =
        message.receiver?._id ||
        message.receiver;

      if (receiverId !== user._id) return;

      setCount((prev) => prev + 1);

      const event = new CustomEvent(
        "newNotification",
        {
          detail: {
            type: "message",
            fromUser: message.sender,
            text: message.text
          }
        }
      );

      window.dispatchEvent(event);

    };


    socket.on(
      "newMessage",
      handleNewMessage
    );


    return () => {

      socket.off(
        "newMessage",
        handleNewMessage
      );

    };

  }, [user?._id]);


  // =========================
  // CONTADOR INICIAL
  // =========================

  useEffect(() => {

    if (!user?._id) {
      setCount(0);
      return;
    }

    fetchUnreadMessages();

  }, [user?._id, fetchUnreadMessages]);


  // =========================
  // RESET
  // =========================

  const resetCount = () => {

    setCount(0);

  };


  return (

    <MessageContext.Provider
      value={{
        count,
        setCount,
        fetchUnreadMessages,
        resetCount
      }}
    >

      {children}

    </MessageContext.Provider>

  );

};


export const useMessages = () =>
  useContext(MessageContext);