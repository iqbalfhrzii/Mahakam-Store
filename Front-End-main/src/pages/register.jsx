/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { auth, db } from "../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import BgLogin from "../assets/Background/bgLogin3.png";
import Logo from "../assets/icon/logo.jpg";
import IconModalError from "../assets/icon/iconModal/iconModalError.png";
import IconModalSuccess from "../assets/icon/iconModal/iconModalSucces.png";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const registerAction = async (e) => {
    e.preventDefault();
    setModalMessage("");
    setErrorModal("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date(),
      });

      setModalMessage("Berhasil Melakukan Registrasi");
      // Alihkan ke halaman login setelah 5 detik
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      setErrorModal("Registration failed. Please try again.");
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
          <div className="relative mx-auto z-40 w-[60%] sm:w-[50%] md:w-[40%] lg:w-1/2 opacity-100 rounded-lg p-4 sm:p-6">
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

        <div className="card bg-neutral-90 w-full lg:w-1/2 flex justify-center items-center">
          <div className="card-body w-full px-4 sm:px-8 lg:px-16 py-8 lg:py-0 bg-neutral-20">
            <div className="mt-8 sm:mt-[3%] md:mt-[4%] lg:mt-[10%]  text-center">
              <h1 className="text-[26px] sm:text-[26px] md:text-[28px] lg:text-[36px] text-center font-bold text-primary-100">
                Register
              </h1>
            </div>
            <div className="relative w-full mx-auto ">
              <h2 className=" ml-[12px] sm:ml-[90px] md:ml-[110px] lg:ml-[80px] xl:ml-[100px] sm:w-2/3 text-[12px] sm:text-[14px] md:text-[16px] lg:text-xl text-center text-nuetral-90 mb-10">
                Ayo Selesaikan Pendaftaran dan Segera bergabung Ke Tomb Oati
                Market
              </h2>
            </div>

            <form onSubmit={registerAction} className="mx-auto w-full max-w-md">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="form-control flex-grow md:flex-1 flex items-center">
                  <label className="label">
                    <span className="label-text text-[16px] sm:text-[14px] md:text-[14px] lg:text-[18px] xl:text-[18px] sm:text-base text-primary-100 text-start">
                      First Name
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-control flex-grow md:flex-1">
                  <label className="label">
                    <span className="label-text text-[16px] sm:text-[14px] md:text-[14px] lg:text-[18px] xl:text-[18px] sm:text-base text-primary-100 text-start">
                      Last Name
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-contro mt-4">
                <label className="label">
                  <span className="label-text text-[16px] sm:text-[14px] md:text-[14px] lg:text-[18px]  xl:text-[18px] sm:text-base text-primary-100 text-start">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  className=" border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px]  xl:text-[16px]"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-xl sm:text-base text-primary-100">
                    Username
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  className=" border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px]  xl:text-[16px]"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-xl sm:text-base text-primary-100">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className=" border border-neutral-90 rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] input input-bordered bg-neutral-90 text-neutral-20 text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px]  xl:text-[16px]"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/*  Icon mata start */}
                  <button
                    type="button"
                    className="absolute  inset-y-0 right-0 pr-5 flex items-center text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeSlashIcon className="h-6 w-6 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </button>
                  {/*  Icon mata End */}
                </div>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`rounded-md w-full h-[40px] sm:h-[48px] md:h-[48px] lg:h-[48px] xl:h-[48px] 2xl:h-[48px] text-[16px] sm:text-[16px] md:text-[16px] lg:text-[18px]  xl:text-[18px] mt-4   ${
                    loading ? "bg-secondary-40 " : "bg-secondary-40  "
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
            <div className="text-2xl text-center mt-5">
              <span className="text-primary-100 text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-xl">
                Sudah Punya Akun?
              </span>
              <Link
                className="ml-4 text-primary-30  hover:text-primary-30   text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-xl"
                to="/login">
                Login
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

export default Register;
