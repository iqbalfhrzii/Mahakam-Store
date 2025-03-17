/* eslint-disable no-unused-vars */
import React, {  useRef, useState} from "react";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "../panduan/BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Login from "../../assets/Asset_Panduan/assets/Login.png";
import EmailPass from "../../assets/Asset_Panduan/assets/EmailPass.png";
import Email from "../../assets/Asset_Panduan/assets/Email.svg";
import LinkPemulihan from '../../assets/Asset_Panduan/assets/LinkPemulihan.svg';
import Reset from '../../assets/Asset_Panduan/assets/Reset.svg';
import PasswordGanti from '../../assets/Asset_Panduan/assets/PasswordGanti.svg';

function LupaPassword() {
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
          <div className="container mx-auto px-1 py-2">
            <div className="mb-16">
              <p className="mb-4">
                1. Pada Halaman Login, silahkan klik Lupa Password
              </p>
              <Zoom>
                <img
                  src={Login}
                  alt="Lupa Password"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
            <div className="mb-16">
              <p className="mb-4">
                2. Kemudian anda akan diarahkan ke halaman pemulihan akun, dan isi
                Email berdasarkan email akun yang anda daftarkan. Jika data yang
                anda isi salah, maka pada bar pengisian akan ada peringatan untuk
                melakukan pengisian ulang dengan benar.
              </p>
              <Zoom>
                <img
                  src={EmailPass}
                  alt="Ganti Password"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
            <div className="mb-16">
              <p className="mb-4">
                3. Dan jika data yang anda isi benar , link pemulihan password akan dikirimkan ke inbox email anda, silahkan cek inbox email anda , jika tidak ada maka cari di folder spam.
              </p>
              <Zoom>
                <img
                  src={Email}
                  alt="Ganti Password Berhasil"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
            <div className="mb-16">
              <p className="mb-4">
                4. Klik Link yang tersedia di inbox email.</p>
              <Zoom>
                <img
                  src={LinkPemulihan}
                  alt="Link"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
            <div className="mb-16">
              <p className="mb-4">
                5. Tulislah Password yang ingin dipakai, lalu tekan save.</p>
              <Zoom>
                <img
                  src={Reset}
                  alt="Reset Password"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>
            <div className="mb-16">
              <p className="mb-4">
                6. Password telah diubah silahkan kembali ke halaman login untuk masuk.</p>
              <Zoom>
                <img
                  src={PasswordGanti}
                  alt="Ganti Password"
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

export default LupaPassword;