import { useEffect, useState } from "react";
import "../../styles/ChatWidget.css";
import { useOnline } from "../../context/OnlineContext";
import api from "../../api/api";
import socket from "../../socket";
import { useMessages } from "../../context/MessageContext";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";


export default function ChatWidget({ currentUser }) {


  const {
    fetchUnreadMessages,
    count
  } = useMessages();


  const [open,setOpen] = useState(false);

  const [conversations,setConversations] = useState([]);

  const [selectedChat,setSelectedChat] = useState(null);

  const [messages,setMessages] = useState([]);

  const [text,setText] = useState("");

  const { onlineUsers } = useOnline();



  const fetchConversations = async()=>{

    try{

      const data = await api.get("/messages");


      if(Array.isArray(data)){

        setConversations(
          data.sort(
            (a,b)=>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
          )
        );

      }


    }catch(error){

      console.error(
        "Error cargando conversaciones:",
        error
      );

    }

  };



  useEffect(()=>{

    if(open){
      fetchConversations();
    }

  },[open]);



  const openConversation = async(user)=>{

    setSelectedChat(user);
    setMessages([]);


    try{

      const data = await api.get(
        `/messages/${user._id}`
      );


      if(Array.isArray(data)){
        setMessages(data);
      }



      await api.put(
        `/messages/read/${user._id}`
      );


      fetchUnreadMessages();


    }catch(error){

      console.error(
        "Error abriendo conversación:",
        error
      );

    }

  };



  const backToConversations = ()=>{

    setSelectedChat(null);
    setMessages([]);

    fetchConversations();

  };



  useEffect(()=>{


    const handleNewMessage = (message)=>{


      const senderId =
        message.sender?._id ||
        message.sender;


      const receiverId =
        message.receiver?._id ||
        message.receiver;



      if(selectedChat){

        if(
          senderId === selectedChat._id ||
          receiverId === selectedChat._id
        ){

          setMessages(prev=>[
            ...prev,
            message
          ]);

        }

      }


      fetchConversations();

    };



    socket.on(
      "newMessage",
      handleNewMessage
    );


    return()=>{

      socket.off(
        "newMessage",
        handleNewMessage
      );

    };


  },[selectedChat]);



  const sendMessage = async()=>{

    if(
      !text.trim() ||
      !selectedChat
    )
      return;



    try{


      await api.post(
        `/messages/${selectedChat._id}`,
        {
          text
        }
      );


      setText("");


    }catch(error){

      console.error(
        "Error enviando mensaje:",
        error
      );

    }

  };



  const closeWidget = ()=>{

    setOpen(false);
    setSelectedChat(null);
    setMessages([]);

  }



  return (

    <>

      <button
        className="chat-widget-button"
        onClick={() => {
          setOpen(prev => !prev);
        }}
      >

        💬

        {count > 0 && (
          <span className="chat-widget-button-badge">
            {count}
          </span>
        )}

      </button>



      {
        open && (

          <div className="chat-widget-panel">


            {
              !selectedChat && (

                <ConversationList

                  conversations={conversations}

                  openConversation={openConversation}

                  closeWidget={closeWidget}

                />

              )
            }



            {
              selectedChat && (

                <ChatWindow

                  selectedChat={selectedChat}

                  messages={messages}

                  currentUser={currentUser}

                  text={text}

                  setText={setText}

                  sendMessage={sendMessage}

                  backToConversations={backToConversations}

                  closeWidget={closeWidget}

                />

              )
            }


          </div>

        )
      }


    </>

  );

}