/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import IconModalError from "../../assets/icon/iconModal/iconModalError.png";

const AutoLogout = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loggedOut, setLoggedOut] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const checkIdleTime = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      const currentTime = new Date().getTime();

      if (!lastActivity) {
        localStorage.setItem("lastActivity", currentTime);
        return;
      }

      const timeDiff = (currentTime - lastActivity) / 1000;
      // Set Waktu untuk Auto Logout jadi 24 jam (86400 detik) tinggal ganti angka yang 120
      if (timeDiff >= 86400 && user && !loggedOut) {
        handleLogout();
      }
    };

    const handleActivity = () => {
      localStorage.setItem("lastActivity", new Date().getTime());
    };

    const handleLogout = () => {
      setLoggedOut(true);

      auth
        .signOut()
        .then(() => {
          localStorage.removeItem("lastActivity");
          localStorage.removeItem("userRole");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("theme");
          // nnati kita ubah/ganti (/) jadi (/login) mengarah ke halman login jika sudah membuat home pagenya
          setModalMessage("Waktu anda habis, silahkan login kembali.");
          navigate("/");
        })
        .catch((error) => {
          console.error("Error signing out: ", error);
        });
    };

    // Tambahkan event listener untuk mendeteksi aktivitas pengguna
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    const intervalId = setInterval(checkIdleTime, 10000);

    return () => {
      // Hapus event listener dan interval saat komponen unmount
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(intervalId);
    };
  }, [navigate, user, loggedOut]);

  return (
    <>
      {modalMessage && (
        <div className="modal modal-open fixed inset-0 flex items-center justify-center z-50 pr-5">
          <div className="modal-box w-[90%] max-w-[450px] h-auto bg-neutral-90 rounded-lg">
            <img
              className="h-28 w-28 mx-auto mb-6"
              src={IconModalError}
              alt="icon pop up error"
            />
            <h3 className="text-lg text-primary-3 mx-auto text-center">
              {modalMessage}
            </h3>
            <div className="modal-action">
              <button
                onClick={() => {
                  setModalMessage(null);
                  navigate("/");
                }}
                className="btn bg-secondary-40 border-secondary-40 hover:bg-secondary-50 hover:border-secondary-50 hover:font-bold mx-auto mt-4 w-[79px] text-primary-100">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoLogout;
