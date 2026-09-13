import "./styles/global.css";
import { API_URL } from "./api/config";
import "./styles/buttons.css";
import "./styles/forms.css";
import "./styles/layout.css";
import "./styles/components.css";

import { OnlineProvider } from "./context/OnlineContext";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import { MessageProvider } from "./context/MessageContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";

import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Notification from "./components/Notification";
import PostDetail from "./pages/PostDetail";
import Messages from "./pages/Messages";
import ChangePassword from "./pages/ChangePassword";

import ToastNotification from "./components/ToastNotification";



/* =========================
   COMPONENTE GLOBAL TOAST
========================= */

function GlobalToast() {

  const { toast, setToast } = useNotifications();


  if (!toast) return null;


  return (

    <ToastNotification
      notification={toast}
      onClose={() => setToast(null)}
    />

  );

}





function App() {


  const [user, setUser] = useState(null);



  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );



  const [token, setToken] = useState(
  localStorage.getItem("token")
);

const login = (newToken) => {

  localStorage.setItem(
    "token",
    newToken
  );

  setToken(newToken);

};



  /* =========================
     LOGOUT
  ========================= */


  const logout = () => {


    localStorage.removeItem("token");


    setUser(null);


  };







  /* =========================
     FETCH USER
  ========================= */


  useEffect(() => {


    const fetchUser = async () => {


      if (!token) {

        setUser(null);

        return;

      }



      try {


        const res = await fetch(
          `${API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );



        const data = await res.json();



        if (res.ok) {

          setUser(data);

        } else {

          setUser(null);

        }


      } catch (error) {


        console.error(
          "Error obteniendo usuario:",
          error
        );


        setUser(null);


      }


    };



    fetchUser();



  }, [token]);







  /* =========================
     DARK MODE
  ========================= */


  useEffect(() => {


    if (darkMode) {


      document.body.classList.add("dark");

      localStorage.setItem(
        "theme",
        "dark"
      );


    } else {


      document.body.classList.remove("dark");

      localStorage.setItem(
        "theme",
        "light"
      );


    }


  }, [darkMode]);









  return (

    <Router>


      <OnlineProvider user={user}>


        <NotificationProvider user={user}>


          <MessageProvider user={user}>


            <Routes>


              <Route
                path="/"
                element={
                <Login login={login}/>}
              />



              <Route
                path="/register"
                element={<Register />}
              />



              <Route
                path="/feed"
                element={
                  <Feed
                    user={user}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    logout={logout}
                  />
                }
              />



              <Route
                path="/messages"
                element={<Messages />}
              />



              <Route
                path="/chat/:username"
                element={<Chat />}
              />



              <Route
                path="/profile/:username"
                element={<Profile />}
              />



              <Route
                path="/notification"
                element={<Notification />}
              />



              <Route
                path="/post/:postId"
                element={<PostDetail />}
              />



              <Route
                path="/settings/password"
                element={<ChangePassword />}
              />



            </Routes>





            <GlobalToast />



          </MessageProvider>


        </NotificationProvider>


      </OnlineProvider>


    </Router>

  );


}



export default App;