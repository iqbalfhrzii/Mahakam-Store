/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useUserContext } from "../contexts/UserContext";
import BgLogin from "../assets/Background/bgLogin3.png";
import Logo from "../assets/icon/logo.jpg";
import IconModalError from "../assets/icon/iconModal/iconModalError.png";
import IconModalSuccess from "../assets/icon/iconModal/iconModalSucces.png";

function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [errorModal, setErrorModal] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { saveUserRole } = useUserContext();

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setLoginEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setLoginEmail(e.target.value);
    } else if (e.target.name === "password") {
      setLoginPassword(e.target.value);
    } else if (e.target.name === "rememberMe") {
      setRememberMe(e.target.checked);
    }
  };

  const checkUserRole = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data().role;
    }
    return null;
  };

  const loginAction = async (e) => {
    e.preventDefault();
    setErrorModal("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;

      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", loginEmail);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        const adminRole = data.user.role;
        if (adminRole === "superadmin") {
          setModalMessage("Login sebagai Superadmin berhasil!");
          saveUserRole("superadmin");
          setTimeout(() => {
            setModalMessage(null);
            navigate("/dashboard");
          }, 2000);
        } else if (adminRole === "admin") {
          setModalMessage("Login sebagai Admin berhasil!");
          saveUserRole("admin");
          setTimeout(() => {
            setModalMessage(null);
            navigate("/dashboard");
          }, 2000);
        } else {
          setModalMessage("Login berhasil!");
          saveUserRole("user");
          setTimeout(() => {
            setModalMessage(null);
            navigate("/");
          }, 2000);
        }
      } else {
        setErrorModal(data.error || "Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      setErrorModal("Email atau password tidak valid. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-20 min-h-screen h-full flex justify-center items-center font-poppins">
      <div className="flex flex-col lg:flex-row w-full max-w-[1920px] lg:h-[768px] h-auto min-h-screen">
        <div className="relative hidden sm:block lg:flex h-full text-center w-full lg:w-1/2 flex-col justify-center items-center p-6 ">
          <img
            src={BgLogin}
            alt="Login background"
            className="absolute w-full h-full inset-0 object-cover opacity-80"
          />
          <div className="relative mx-auto z-40 w-[60%] sm:w-[50%] md:w-[40%] lg:w-1/2 opacity-100 rounded-md p-4 sm:p-6">
            <img
              src={Logo}
              alt="Logo"
              className="w-44 h-44 sm:w-40 sm:h-40 z-50 rounded-t-full mx-auto mt-6 sm:mt-5"
            />
            <h2 className="relative z-50 text-1xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-100 mt-4">
              PixelStore
            </h2>
            <p className="text-center relative z-50 py-2 sm:py-4 lg:py-6 text-[10px] sm:text-[12px] md:text-[14px] lg:text-xl  text-primary-100">
              PixelStore, Sumber Inspirasi footage menarik di website kami untuk
              Project Anda!
            </p>
          </div>
        </div>

        <div className="card bg-neutral-20 w-full lg:w-1/2 flex justify-center items-center min-h-screen ">
          <div className="card-body w-full px-4 sm:px-8 lg:px-26 xl:px-2 py-8 lg:py-0 bg-neutral-20 ">
            <div className="relative w-full mx-auto ">
              <div className="mt-2 sm:mt-[3%] md:mt-[4%] lg:mt-[10%]  text-center mb-4">
                <h1 className="text-[26px] sm:text-[26px] md:text-[28px] lg:text-[36px] text-center font-bold text-primary-100">
                  LOGIN
                </h1>
              </div>
              <h2 className=" ml-[12px] sm:ml-[100px] md:ml-[130px] lg:ml-[80px] xl:ml-[100px] sm:w-2/3 text-[12px] sm:text-[14px] md:text-[16px] lg:text-xl text-center text-neutral-90 mb-10">
                Selamat Datang di PixelStore, Surga Kreatif untuk Asset
                Berkualitas!
              </h2>
            </div>

            <form onSubmit={loginAction} className="mx-auto w-full max-w-md">
              <div className="form-control items-start">
                <label className="label">
                  <span className="label-text text-[16px] sm:text-[14px] md:text-[14px] lg:text-[18px]  xl:text-[18px] sm:text-base text-primary-100 text-start">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  className="border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px]  xl:text-[16px]"
                  required
                  value={loginEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text  sm:text-base text-primary-100 text-[16px] sm:text-[14px] md:text-[14px] lg:text-[18px]  xl:text-[18px]">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    className="border border-neutral-90 rounded-md  w-full  h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px]  xl:text-[16px]"
                    required
                    value={loginPassword}
                    onChange={handleChange}
                  />

                  {/* Icon mata start */}
                  <button
                    type="button"
                    className="absolute  inset-y-0 right-0 pr-4 flex items-center text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeSlashIcon className="h-6 w-6 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </button>
                  {/* Icon mata End */}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="checkbox checkbox-md rounded-[2px] bg-primary-100 border-primary-100"
                      checked={rememberMe}
                      onChange={handleChange}
                    />
                    <span className="label-text text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]  xl:text-[16px] sm:text-base text-primary-100 ml-2">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/lupa-password"
                    className="relative inline-block  text-[10px] sm:text-[12px] md:text-[16px] lg:text-[16px]  xl:text-[16px] text-primary-40 hover:text-error-1 group">
                    Lupa Password ?
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-primary-40 transition-all duration-1000 transform group-hover:left-0 group-hover:w-1/2"></span>
                    <span className="absolute bottom-0 right-1/2 w-0 h-[2px] bg-primary-40 transition-all duration-1000 transform group-hover:right-0 group-hover:w-1/2"></span>
                  </Link>
                </div>
              </div>
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] text-[16px] sm:text-[16px] md:text-[16px] lg:text-[18px]  xl:text-[18px] mt-4   ${loading ? "bg-secondary-40 " : "bg-secondary-40  "
                    } text-primary-100`}
                  disabled={loading}>
                  {loading ? (
                    <span className="loading loading-infinity loading-lg"></span>
                  ) : (
                    "masuk"
                  )}
                </button>
              </div>
            </form>

            <div className="text-2xl text-center mt-2">
              <span className="text-primary-100 text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-xl">
                Belum Punya Akun?
              </span>

              <Link
                to="/register"
                className="relative ml-4 inline-block text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-[18px] text-primary-40 hover:text-error-1 group">
                Daftar ?
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-primary-40 transition-all duration-1000 transform group-hover:left-0 group-hover:w-1/2"></span>
                <span className="absolute bottom-0 right-1/2 w-0 h-[2px] bg-primary-40 transition-all duration-1000 transform group-hover:right-0 group-hover:w-1/2"></span>
              </Link>
            </div>
          </div>
          {errorModal && (
            <div className="modal modal-open fixed inset-0 flex items-center justify-center z-50 pr-5">
              <div className="modal-box w-[90%] max-w-[450px] h-auto bg-neutral-90 rounded-lg">
                <img
                  className="w-24 h-24 mx-auto mb-6 object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[300px] xl:max-h-[300px]"
                  src={IconModalError}
                  alt="icon pop up error"
                />
                <h3 className="text-center text-[12px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px] text-primary-0 mx-auto">
                  {errorModal}
                </h3>
                <div className="modal-action flex justify-center">
                  <button
                    onClick={() => setErrorModal(null)}
                    className="btn bg-secondary-40 border-secondary-40 hover:bg-secondary-50 hover:border-secondary-50 hover:font-bold mx-auto mt-4 w-[79px] text-primary-100">
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalMessage && (
            <div className="modal modal-open fixed inset-0 flex items-center justify-center z-50 pr-5">
              <div className="modal-box w-[90%] max-w-[450px] h-auto bg-neutral-90 rounded-lg">
                <img
                  className="w-24 h-24 mx-auto mb-6 object-contain max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[300px] xl:max-h-[300px]"
                  src={IconModalSuccess}
                  alt="icon pop up success"
                />
                <h3 className="text-center text-[12px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px] text-primary-0 mx-auto">
                  {modalMessage}
                </h3>
                <div className="modal-action flex justify-center">
                  <button
                    onClick={() => setModalMessage(null)}
                    className="btn bg-secondary-40 border-secondary-40 hover:bg-secondary-50 hover:border-secondary-50 hover:font-bold mx-auto mt-4 w-[79px] text-primary-100">
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
