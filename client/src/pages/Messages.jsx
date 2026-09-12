import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMessages } from "../context/MessageContext";
import socket from "../socket";
import { useOnline } from "../context/OnlineContext";
import api from "../api/api";
import { getImageUrl } from "../utils/getImageUrl";
import "../styles/Messages.css";

export default function Messages() {

  const { onlineUsers } = useOnline();

  const {
    resetCount,
    fetchUnreadMessages
  } = useMessages();


  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {


    const handleNewMessage = (message) => {


      fetchUnreadMessages();


      setConversations(prev => {


        const updated = [...prev];


        const senderId =
          message.sender?._id ||
          message.sender;



        const index = updated.findIndex(
          c => c._id?._id === senderId || c._id === senderId
        );



        if (index !== -1) {


          const convo = {

            ...updated[index],

            lastMessage: message.text,

            unreadCount:
              (updated[index].unreadCount || 0) + 1,

            updatedAt: message.createdAt

          };



          updated.splice(index, 1);

          updated.unshift(convo);


        }


        return updated;


      });


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


  }, []);



  useEffect(() => {

    fetchUnreadMessages();

  }, []);



  useEffect(() => {


    const fetchConversations = async () => {


      try {


        const data = await api.get("/messages");



        const sorted = data.sort(
          (a, b) =>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
        );



        setConversations(sorted);



      } catch (error) {


        console.error(
          "Error cargando conversaciones:",
          error
        );


      } finally {


        setLoading(false);


      }


    };



    fetchConversations();


  }, []);




  const formatTime = (date) => {

    const now = new Date();

    const msgDate = new Date(date);


    const diff = Math.floor(
      (now - msgDate) / 1000
    );


    if (diff < 60)
      return "Ahora";


    if (diff < 3600)
      return `${Math.floor(diff / 60)} min`;


    if (diff < 86400)
      return `${Math.floor(diff / 3600)} h`;


    return msgDate.toLocaleDateString();

  };




  return (

    <div className="messages-page">



      <div className="messages-header">


        <Link
          to="/feed"
          className="back-button"
        >
          ← Volver al Feed
        </Link>


        <h1>
          Mensajes
        </h1>


      </div>





      {loading && (

        <p className="messages-loading">
          Cargando conversaciones...
        </p>

      )}





      {!loading && conversations.length === 0 && (

        <p className="messages-empty">
          No tenés conversaciones todavía
        </p>

      )}






      <div className="conversations-list">



        {!loading && conversations.map((c) => (



          <Link

            key={c._id._id}

            to={`/chat/${c._id.username}`}

            className="card conversation-card"

          >



            <img

              className="conversation-avatar"

              src={
                getImageUrl(c._id.avatar)
              }

              alt="avatar"

            />





            <div className="conversation-main">



              <div className="conversation-top">



                <div className="conversation-user-wrapper">



                  <span className="conversation-user">

                    {c._id.username}

                  </span>



                  <small className="conversation-status">

                    {
                      onlineUsers?.includes(c._id._id)
                        ? "🟢 En línea"
                        : "⚫ Desconectado"
                    }

                  </small>



                </div>





                <span className="conversation-time">

                  {formatTime(c.updatedAt)}

                </span>



              </div>






              <div className="conversation-bottom">



                <span className="conversation-last-message">

                  {c.lastMessage}

                </span>





                {c.unreadCount > 0 && (

                  <span className="badge">

                    {c.unreadCount}

                  </span>

                )}



              </div>





            </div>




          </Link>



        ))}



      </div>



    </div>

  );

}