/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
 
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "../panduan/BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import HomeJualAset from "../../assets/Asset_Panduan/assets/HomeJualAset.png"
import Dashboard from "../../assets/Asset_Panduan/assets/Dashboard.png";
import ManageAssetImg from "../../assets/Asset_Panduan/assets/ManageAssetImg.png";
import File from "../../assets/Asset_Panduan/assets/File.png";
import AddAssetImg from "../../assets/Asset_Panduan/assets/AddAssetImg.png";
import AddImage from "../../assets/Asset_Panduan/assets/AddImage.png";

function JualAsset() {
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
        aria-label="Sidebar"
      >
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
                1. Pastikan anda sudah mendaftar akun di PixelStore dan Login
                menggunakan akun yang terdaftar.
              </p>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                2. Kemudian pada halaman Landing Page, klik Jual Asset dan pilih
                menu Mulai Jual Asset seperti gambar dibawah.
              </p>
              <Zoom>
                <img
                  src={HomeJualAset}
                  alt="Jual Asset"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                3. Setelah itu anda akan diarahkan ke halaman Dashboard untuk
                mengatur asset yang dijual.
              </p>
              <Zoom>
                <img
                  src={Dashboard}
                  alt="Halaman Asset Market"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                4. Pada Halaman ini anda dapat memilih konten apa yang anda akan
                Upload ke PixelStore dan yang akan anda jual nantinya.
              </p>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                5. Sebagai contoh, jika Anda ingin menjual gambar sebagai asset
                gambar, klik 'Manage Asset Image' di sidebar, kemudian pilih 'Add
                Image' untuk mengunggah gambar yang ingin dijual. Setelah itu, Anda
                akan diarahkan langsung ke halaman unggah asset gambar.
              </p>
              <Zoom>
                <img
                  src={ManageAssetImg}
                  alt="Manage Asset"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                6. Di halaman "add asset image" unggah gambar yang ingin Anda jual.
                Anda akan langsung diarahkan ke file explorer untuk memilih gambar
                tersebut.
              </p>
              <Zoom>
                <img
                  src={File}
                  alt="Add Asset"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                7. Setelah menambahkan gambar yang ingin dijual, lengkapi kolom
                "Image Name" sebagai nama gambar, pilih kategori yang sesuai,
                tambahkan deskripsi, dan tentukan harga untuk aset tersebut. Jika
                semua sudah sesuai, klik "Save" untuk menyimpan aset gambar Anda.
              </p>
              <Zoom>
                <img
                  src={AddAssetImg}
                  alt="Add Asset Image"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                8. Setelah itu anda akan diarahkan ke halaman sebelumnya yaitu
                Halaman Add Image, dan pada halaman ini anda bisa melihat konten
                yang telah anda upload.
              </p>
              <Zoom>
                <img
                  src={AddImage}
                  alt="Dataset"
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

export default JualAsset;