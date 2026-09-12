import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";

const OnlineContext = createContext();

export function OnlineProvider({ children, user }) {

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );


    // =========================
    // SIN USUARIO
    // =========================

    if (!user?._id) {

      if (socket.connected) {

        socket.emit("logout");
        socket.disconnect();

      }

      setOnlineUsers([]);

      return () => {

        socket.off(
          "onlineUsers",
          handleOnlineUsers
        );

      };

    }


    // =========================
    // USUARIO AUTENTICADO
    // =========================

    if (!socket.connected) {
      socket.connect();
    }


    socket.emit(
      "join",
      user._id
    );


    return () => {

      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

    };

  }, [user?._id]);


  return (

    <OnlineContext.Provider
      value={{
        onlineUsers
      }}
    >

      {children}

    </OnlineContext.Provider>

  );

}


export function useOnline() {
  return useContext(OnlineContext);
}