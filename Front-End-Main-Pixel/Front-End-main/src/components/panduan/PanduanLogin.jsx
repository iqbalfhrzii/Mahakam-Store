/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
 
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "../panduan/BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import LandingPage from "../../assets/Asset_Panduan/assets/LandingPage.png";
import Login from "../../assets/Asset_Panduan/assets/Login.png";
import LoginBerhasil from "../../assets/Asset_Panduan/assets/LoginBerhasil.png";
import LoginGagal from "../../assets/Asset_Panduan/assets/LoginGagal.png";
import LandingpageLog from "../../assets/Asset_Panduan/assets/LandingpageLog.png";

function PanduanLogin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="dark:bg-neutral-90 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100">
      <HeaderSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

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
          <div className="container mx-auto px-1 py-2">
            {/* Step 1 */}
            <div className="mb-16">
              <p className="mb-4">
                1. Pada Halaman Home Silahkan Klik “Hello, Sign in” yang terdapat
                bagian atas kanan halaman lalu, klik “Login” seperti yang ada di
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
                2. Setelah itu anda akan diarakan ke halaman Log in, Isi data
                berdasarkan data akun yang anda daftarkan sebelumnya di PixelStore,
                atau jika belum punya akun klik daftar.
              </p>
              <Zoom>
                <img
                  src={Login}
                  alt="Log In"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 3 */}
            <div className="mb-16">
              <p className="mb-4">
                3. Setelah selesai mengisi data Login akun, jika data yang anda isi
                benar, maka Popup "login berhasil" ditampilkan, dan langsung
                diarahkan ke halaman Landing Page.
              </p>
              <Zoom>
                <img
                  src={LoginBerhasil}
                  alt="Login Berhasil"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 4 */}
            <div className="mb-16">
              <p className="mb-4">
                4. Namun jika data yang anda isi tidak sesuai dengan data akun yang
                anda daftarkan, maka proses Log In anda gagal, dan Klik Ok untuk Isi
                data ulang.
              </p>
              <Zoom>
                <img
                  src={LoginGagal}
                  alt="Login Gagal"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            {/* Step 5 */}
            <div className="mb-16">
              <p className="mb-4">
                5. "Selamat datang di halaman utama Pixel Store. Silakan cari dan
                temukan asset yang Anda butuhkan."
              </p>
              <Zoom>
                <img
                  src={LandingpageLog}
                  alt="Landing Page Login"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanduanLogin;