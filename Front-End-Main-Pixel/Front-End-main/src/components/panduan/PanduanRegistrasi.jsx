/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
 
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "../panduan/BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import LandingPage from "../../assets/Asset_Panduan/assets/LandingPage.png";
import Register from "../../assets/Asset_Panduan/assets/Register.png";
import RegisterError from "../../assets/Asset_Panduan/assets/RegisterError.png";
import BerhasilDaftar from "../../assets/Asset_Panduan/assets/BerhasilDaftar.png";
import Login from "../../assets/Asset_Panduan/assets/Login.png";

function PanduanRegistrasi() {
  const defaultImageUrl =
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <div className="dark:bg-neutral-90 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100">
      <HeaderSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <aside
        ref={sidebarRef}
        id="sidebar-multi-level-sidebar"
        className={`fixed top-0 left-0 z-40 w-[280px] transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
          <NavigationItem />
        </div>
      </aside>
      <div className="p-8 sm:ml-[280px] h-full bg-primary-100 text-neutral-10 dark:bg-neutral-20 dark:text-neutral-10 min-h-screen pt-24">
        <div className="breadcrumbs text-sm mt-1 mb-10">
          <Breadcrumb />
        </div>
        <div className="flex-1 overflow-y-auto min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
          {/* Guide Content */}
          <div className="container mx-auto px-1 py-2">
            {/* Step 1 */}
            <div className="mb-16">
              <p className="mb-4">
                1. Pada Halaman Home Silahkan Klik “Hello, Sign in” yang terdapat
                bagian atas kanan halaman lalu, klik “Log In” seperti yang ada di
                gambar.
              </p>
              <Zoom>
                <img
                  src={LandingPage}
                  alt="Landing Page"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 2 */}
            <div className="mb-16">
              <p className="mb-4">
                2. Kemudian akan diarahkan ke halaman Register, kemudian isi data
                yang diminta seperti First Name, Last Name, Email, Username, dan
                Password. Jika sudah klik masuk/daftar.
              </p>
              <Zoom>
                <img
                  src={Register}
                  alt="Register"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 3 */}
            <div className="mb-16">
              <p className="mb-4">
                3. Pastikan data sudah terisi semua jika tidak maka akan muncul
                pemberitahuan untuk mengisi dengan benar, seperti gambar di bawah
                ini.
              </p>
              <Zoom>
                <img
                  src={RegisterError}
                  alt="Error"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 4 */}
            <div className="mb-16">
              <p className="mb-4">
                4. Jika data Anda sudah memenuhi syarat maka pendaftaran akun Anda
                telah berhasil, muncul PopUp "Berhasil melakukan pendaftaran" dan
                langsung diarahkan ke halaman login.
              </p>
              <Zoom>
                <img
                  src={BerhasilDaftar}
                  alt="Daftar Berhasil"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 5 */}
            <div className="mb-16">
              <p className="mb-4">
                5. Silahkan mengisi Username dan password menggunakan akun yang
                sudah didaftarkan di halaman login.
              </p>
              <Zoom>
                <img src={Login} alt="Login" className="w-full max-w-lg mx-auto" />
              </Zoom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanduanRegistrasi;