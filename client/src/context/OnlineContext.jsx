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


    const rejoin = () => {
      socket.emit("join", user._id);
    };

    rejoin();

    // El navegador puede cortar la conexión al pasar la pestaña a
    // segundo plano; socket.io la reconecta solo, pero el servidor
    // necesita el "join" de nuevo para volver a marcarnos online.
    socket.on("connect", rejoin);

    return () => {

      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

      socket.off("connect", rejoin);

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