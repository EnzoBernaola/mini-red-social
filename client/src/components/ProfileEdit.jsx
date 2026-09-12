// components/ProfileEdit.jsx

import { useState } from "react";
import "../styles/ProfileEdit.css";
import { getImageUrl } from "../utils/getImageUrl";
import { API_URL } from "../api/config";

export default function ProfileEdit({
  user,
  token,
  onClose,
  onUserUpdate
}) {

  const [bio, setBio] = useState(user.bio || "");

  const [technologies, setTechnologies] = useState(
    user.technologies?.join(", ") || ""
  );

  const [newUsername, setNewUsername] = useState(
    user.username
  );

  const [avatarFile, setAvatarFile] = useState(null);

  const avatarUrl = getImageUrl(user.avatar);

  const [preview, setPreview] = useState(avatarUrl);

  const [loading, setLoading] = useState(false);


  // =========================
  // CAMBIAR AVATAR
  // =========================

  const handleAvatarChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setAvatarFile(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };


  // =========================
  // QUITAR SELECCIÓN
  // =========================

  const removeAvatarSelection = () => {

    setAvatarFile(null);

    setPreview(avatarUrl);

  };


  // =========================
  // GUARDAR PERFIL
  // =========================

  const handleSave = async () => {

    try {

      setLoading(true);


      // actualizar bio + tecnologías

      await fetch(
        `${API_URL}/api/users/me`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            bio,

            technologies: technologies
              .split(",")
              .map(t => t.trim())
              .filter(Boolean)
          })
        }
      );


      // actualizar username

      if (newUsername !== user.username) {

        await fetch(
          `${API_URL}/api/users/me/credentials`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
              username: newUsername
            })
          }
        );

      }


      // subir avatar

      if (avatarFile) {

        const formData = new FormData();

        formData.append(
          "avatar",
          avatarFile
        );


        await fetch(
          `${API_URL}/api/users/avatar`,
          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`
            },

            body: formData
          }
        );

      }


      // si cambia username, cambiar URL

      if (newUsername !== user.username) {

        window.location.href =
          `/profile/${newUsername}`;

        return;
      }


      await onUserUpdate();

      onClose();


    } catch (err) {

      console.error(
        "Error actualizando perfil:",
        err
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="profile-edit">


      <h3>
        Editar perfil
      </h3>



      {/* AVATAR */}

      <div className="profile-edit-avatar-section">


        <img
          src={preview}
          alt="Foto de perfil"
          className="profile-edit-avatar"
        />


        <label className="profile-upload-button">

          📷 Cambiar foto


          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />


        </label>


        {avatarFile && (

          <>

            <small>
              {avatarFile.name}
            </small>


            <button
              type="button"
              className="remove-avatar-button"
              onClick={removeAvatarSelection}
            >
              ✕ Quitar selección
            </button>


          </>

        )}


      </div>




      {/* USERNAME */}

      <div className="profile-edit-group">

        <label>
          Nombre de usuario
        </label>


        <input
          value={newUsername}
          onChange={(e) =>
            setNewUsername(e.target.value)
          }
        />

      </div>




      {/* BIO */}

      <div className="profile-edit-group">

        <label>
          Bio
        </label>


        <textarea
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
        />

      </div>




      {/* TECNOLOGÍAS */}

      <div className="profile-edit-group">

        <label>
          Tecnologías
        </label>


        <input
          value={technologies}
          onChange={(e) =>
            setTechnologies(e.target.value)
          }

          placeholder="React, Node, MongoDB..."
        />

      </div>




      {/* BOTONES */}

      <div className="profile-edit-actions">


        <button
          className="secondary-button"
          onClick={onClose}
        >
          Cancelar
        </button>



        <button
          className="primary-button"
          onClick={handleSave}
          disabled={loading}
        >

          {
            loading
              ? "Guardando..."
              : "Guardar cambios"
          }

        </button>


      </div>


    </div>

  );

}