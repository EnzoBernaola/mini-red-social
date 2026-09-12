import { useEffect, useRef } from "react";
import { useOnline } from "../../context/OnlineContext";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";


export default function ChatWindow({

  selectedChat,

  messages,

  currentUser,

  text,

  setText,

  sendMessage,

  backToConversations,

  closeWidget

}) {


  const messagesEndRef = useRef(null);


  const { onlineUsers } = useOnline();


  const isOnline =
    onlineUsers.includes(selectedChat._id);

  // bajar cuando llega un mensaje nuevo

  useEffect(()=>{


    if(messages.length){

      messagesEndRef.current?.scrollIntoView({
        behavior:"auto"
      });

    }


  },[messages]);







  return (

    <>


      <div className="chat-widget-header">


        <button

          className="chat-back-button"

          onClick={backToConversations}

        >

          ←

        </button>





        <div className="chat-widget-chat-user">


          <img

            src={
              getImageUrl(selectedChat.avatar)
            }

            alt="avatar"

          />




          <div className="chat-widget-user-status">


  <Link
  to={`/profile/${selectedChat.username}`}
  className="chat-widget-profile-link"
>

  {selectedChat.username}

</Link>



            <small>

           {
              isOnline
              ?
              "🟢 En línea"
              :
              "⚫ Desconectado"
            }

            </small>


          </div>



        </div>







        <button

          className="chat-close-button"

          onClick={closeWidget}

        >

          ✕

        </button>



      </div>









      <div className="chat-widget-messages">


        {
          messages.map((m)=>{


            const senderId =
              m.sender?._id ||
              m.sender;



            const isMine =
              senderId === currentUser?._id;




            return (

              <div

                key={m._id}

                className={
                  isMine
                    ?
                    "chat-widget-message mine"
                    :
                    "chat-widget-message other"
                }

              >



                <div className="chat-widget-text">

                  {m.text}

                </div>




                <div className="chat-widget-time">

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


            );


          })

        }





        <div ref={messagesEndRef}/>


      </div>









      <div className="chat-widget-input">



        <input


          value={text}


          onChange={(e)=>
            setText(e.target.value)
          }



          onKeyDown={(e)=>{


            if(
              e.key === "Enter" &&
              !e.shiftKey
            ){

              e.preventDefault();

              sendMessage();

            }


          }}



          placeholder="Mensaje..."


        />






        <button

          onClick={sendMessage}

        >

          Enviar

        </button>



      </div>



    </>

  );

}