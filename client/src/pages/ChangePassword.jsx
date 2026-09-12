import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";


export default function ChangePassword() {


  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");




  const handleSubmit = async (e) => {


    e.preventDefault();



    try {


      const data = await api.put(
        "/users/me/password",
        {
          currentPassword,
          newPassword
        }
      );



      setMessage(
        "Contraseña actualizada correctamente"
      );


      setCurrentPassword("");

      setNewPassword("");



    } catch (error) {


      setMessage(
        error.response?.data?.msg ||
        "Error al cambiar contraseña"
      );


    }


  };





  return (

    <div>


      <Link to="/feed">

        <button>
          Volver
        </button>

      </Link>



      <h2>
        Cambiar contraseña
      </h2>



      <form onSubmit={handleSubmit}>


        <div>

          <label>
            Contraseña actual
          </label>


          <input

            type="password"

            value={currentPassword}

            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }

            required

          />

        </div>




        <div>


          <label>
            Nueva contraseña
          </label>


          <input

            type="password"

            value={newPassword}

            onChange={(e) =>
              setNewPassword(e.target.value)
            }

            required

          />


        </div>




        <button type="submit">

          Guardar

        </button>



      </form>




      {message && (

        <p>
          {message}
        </p>

      )}




    </div>

  );

}