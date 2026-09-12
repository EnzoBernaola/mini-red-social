// hooks/useProfile.js
import { useEffect, useState } from "react";
import { API_URL } from "../api/config";

export const useProfile = (username, token) => {
  const [user, setUser] = useState(null);

const fetchUser = async () => {
  
  const res = await fetch(`${API_URL}/api/users/${username}`, {
    headers: { Authorization: `Bearer ${token}` }
  });


  const data = await res.json();


  setUser(data);
};

useEffect(() => {
  if (!username) return;

  fetchUser();
}, [username]);

  return { user, setUser, fetchUser };
};