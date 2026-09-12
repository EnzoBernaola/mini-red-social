import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";
import { useLocation } from "react-router-dom";
import api from "../api/api";


const NotificationContext = createContext();


export const NotificationProvider = ({ children, user }) => {


  const [count, setCount] = useState(0);

  const [toast, setToast] = useState(null);

  const location = useLocation();



  const fetchUnread = async () => {


    try {


      const data = await api.get(
        "/notifications/unread"
      );


      setCount(data.count);



    } catch (error) {


      console.error(
        "Error obteniendo unread:",
        error
      );


    }


  };




  // SOCKET

useEffect(() => {

  if (!user?._id) return;


  const handleNotification = (notification) => {

    setToast(notification);

    fetchUnread();

  };


  socket.on(
    "notification",
    handleNotification
  );


  return () => {

    socket.off(
      "notification",
      handleNotification
    );

  };

}, [user?._id]);






  // actualizar al navegar

  useEffect(() => {


    if (user) {

      fetchUnread();

    }


  }, [location.pathname, user]);






  return (

    <NotificationContext.Provider

      value={{

        count,

        fetchUnread,

        setCount,

        toast,

        setToast

      }}

    >

      {children}

    </NotificationContext.Provider>

  );


};



export const useNotifications = () => {

  return useContext(NotificationContext);

};