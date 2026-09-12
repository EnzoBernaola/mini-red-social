import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useMessages } from "../context/MessageContext";
import { useOnline } from "../context/OnlineContext";

import socket from "../socket";

import api from "../api/api";

import "../styles/chat.css";
import { getImageUrl } from "../utils/getImageUrl";


export default function Chat() {


  const { username } = useParams();

  const navigate = useNavigate();


  const { fetchUnreadMessages } = useMessages();

  const { onlineUsers } = useOnline();



  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [user, setUser] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);



  const messagesEndRef = useRef(null);




  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({
      behavior:"smooth"
    });

  };





  /* ================= USUARIO LOGUEADO ================= */


  useEffect(()=>{


    const fetchMe = async()=>{


      try {


        const data = await api.get(
          "/users/me"
        );


        setCurrentUser(data);



      } catch(error) {


        console.error(
          "Error obteniendo usuario:",
          error
        );


      }


    };


    fetchMe();


  },[]);








  /* ================= USUARIO DEL CHAT ================= */


  useEffect(()=>{


    if(!username) return;



    const fetchUser = async()=>{


      try {


        let data;



        if(username.length === 24){


          data = await api.get(
            `/users/id/${username}`
          );


        } else {


          data = await api.get(
            `/users/${username}`
          );


        }



        setUser(data);



      } catch(error) {


        console.error(
          "Error obteniendo usuario:",
          error
        );


      }


    };


    fetchUser();


  },[username]);









  /* ================= MENSAJES TIEMPO REAL ================= */


  useEffect(()=>{


    if(!user) return;



    const handleMessage = async(message)=>{


      const senderId =
        message.sender?._id ||
        message.sender;



      const receiverId =
        message.receiver?._id ||
        message.receiver;




      if(
        senderId === user._id ||
        receiverId === user._id
      ){


        setMessages(prev=>[
          ...prev,
          message
        ]);




        if(senderId === user._id){



          await api.put(
            `/messages/read/${user._id}`
          );



          fetchUnreadMessages();


        }


      }


    };



    socket.on(
      "newMessage",
      handleMessage
    );



    return()=>{


      socket.off(
        "newMessage",
        handleMessage
      );


    };


  },[user]);









  /* ================= FETCH MENSAJES ================= */


  const fetchMessages = async(userId)=>{


    try {


      const data = await api.get(
        `/messages/${userId}`
      );



      setMessages(data);




      await api.put(
        `/messages/read/${userId}`
      );



      fetchUnreadMessages();



    } catch(error) {


      console.error(
        "Error obteniendo mensajes:",
        error
      );


    }


  };






  useEffect(()=>{


    if(user){

      fetchMessages(user._id);

    }


  },[user]);






  useEffect(()=>{


    scrollToBottom();


  },[messages]);








  /* ================= ENVIAR ================= */


  const sendMessage = async()=>{


    if(
      !text.trim() ||
      !user
    )
      return;



    try {


      await api.post(
        `/messages/${user._id}`,
        {
          text
        }
      );



      setText("");



    } catch(error) {


      console.error(
        "Error enviando mensaje:",
        error
      );


    }


  };






  if(
    !user ||
    !currentUser
  ){

    return <p>Cargando chat...</p>;

  }


  const isOnline =
    onlineUsers.includes(user._id);
   return (

    <div className="chat-container">


      <div className="chat-header">


        <button

          onClick={()=>navigate("/messages")}

          className="chat-back-btn"

        >

          ← Bandeja de entrada

        </button>





        <img

          src={
            getImageUrl(user.avatar)
          }

          alt="avatar"

          className="chat-header-avatar"

        />





        <div className="chat-header-info">


          <div className="chat-header-name">

            {user.username}

          </div>




          <div className="chat-header-status">


            {
              isOnline
                ? "🟢 En línea"
                : "⚫ Desconectado"
            }


          </div>


        </div>


      </div>








      <div className="chat-messages">


        {
          messages.map((m)=>{


            const senderId =
              m.sender?._id ||
              m.sender;



            const isMine =
              senderId === currentUser._id;





            return (


              <div

                key={m._id}

                className={
                  isMine
                    ? "message-row mine"
                    : "message-row other"
                }

              >





                {!isMine && (


                  <img


                    src={
                      getImageUrl(user.avatar)
                    }


                    alt="avatar"


                    className="message-avatar"


                  />


                )}






                <div


                  className={
                    isMine
                      ? "chat-bubble mine"
                      : "chat-bubble other"
                  }


                >



                  <div>

                    {m.text}

                  </div>




                  <div className="chat-time">


                    {
                      new Date(
                        m.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:"2-digit",
                          minute:"2-digit"
                        }
                      )
                    }


                  </div>



                </div>




              </div>


            );


          })

        }




        <div ref={messagesEndRef}/>


      </div>









      <div className="chat-input-box">



        <textarea


          value={text}


          onChange={(e)=>
            setText(e.target.value)
          }




          onKeyDown={(e)=>{


            if(
              e.key==="Enter" &&
              !e.shiftKey
            ){


              e.preventDefault();

              sendMessage();


            }


          }}




          placeholder="Escribí un mensaje..."

          className="chat-textarea"


        />





        <button


          onClick={sendMessage}


          className="chat-send-btn"


        >


          Enviar


        </button>




      </div>





    </div>

  );


}