import { useOnline } from "../../context/OnlineContext";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ConversationList({
  conversations,
  openConversation
}) {

  const { onlineUsers } = useOnline();

  return (

    <div className="chat-widget-list">

      {conversations.length === 0 && (

        <p className="chat-widget-empty">
          No hay conversaciones
        </p>

      )}

      {conversations.map((c) => {

        const isOnline = onlineUsers.includes(c._id._id);

        return (

          <div

            key={c._id._id}

            className="chat-widget-user"

            onClick={() => openConversation(c._id)}

          >

            <img

              src={
                getImageUrl(c._id.avatar)
              }

              alt="avatar"

            />

            <div className="chat-widget-user-info">

              <div className="chat-widget-name">

                {c._id.username}

              </div>

              <div className="chat-widget-status">

                {isOnline
                  ? "🟢 En línea"
                  : "⚫ Desconectado"}

              </div>

              <div className="chat-widget-last">

                {c.lastMessage}

              </div>

            </div>

            {c.unreadCount > 0 && (

              <span className="chat-widget-badge">

                {c.unreadCount}

              </span>

            )}

          </div>

        );

      })}

    </div>

  );

}