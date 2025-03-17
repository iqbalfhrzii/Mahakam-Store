/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "../panduan/BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import AddImageSudah from "../../assets/Asset_Panduan/assets/AddImageSudah.png";
import AddAssetImg from "../../assets/Asset_Panduan/assets/AddAssetImg.png";
import PopupDelete from "../../assets/Asset_Panduan/assets/PopupDelete.png";
import Hilang from "../../assets/Asset_Panduan/assets/Hilang.png";
import edit from "../../assets/Asset_Panduan/assets/edit.png";
import hapus from "../../assets/Asset_Panduan/assets/hapus.png";

function EditAsset() {
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
                1. Untuk mengedit/menghapus konten yang telah Anda upload, pergi ke
                halaman Manage Asset.
              </p>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                2. Di halaman Manage Asset, pilih konten yang ingin diedit atau
                dihapus dengan klik tombol
                <span className="inline-flex items-center">
                  <img src={edit} alt="Edit" className="mx-1 inline h-4" />
                  untuk edit atau klik
                  <img src={hapus} alt="Hapus" className="mx-1 inline h-4" />
                  untuk hapus.
                </span>
              </p>
              <Zoom>
                <img
                  src={AddImageSudah}
                  alt="Add Image"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                3. Klik tombol edit untuk diarahkan ke halaman edit aset. Di sana,
                ubah aset sesuai kebutuhan, seperti contoh gambar berikut.
              </p>
              <Zoom>
                <img
                  src={AddAssetImg}
                  alt="Add Dataset"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                4. Setelah mengedit informasi aset, klik "Save" untuk menyimpan
                perubahan atau "Cancel" untuk membatalkan.
              </p>
              <Zoom>
                <img
                  src={AddAssetImg}
                  alt="Dataset"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                5. Jika ingin menghapus konten, akan muncul pop-up konfirmasi.
              </p>
              <Zoom>
                <img
                  src={PopupDelete}
                  alt="Pop Up Delete"
                  className="w-full max-w-lg mx-auto"
                />
              </Zoom>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                6. Di pop-up, klik "Delete" untuk menghapus atau "Close" untuk
                membatalkan.
              </p>
            </div>

            <div className="mb-16">
              <p className="mb-4">
                7. Konten yang dihapus tidak lagi muncul di daftar isi.
              </p>
              <Zoom>
                <img
                  src={Hilang}
                  alt="Dataset Hilang"
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

export default EditAsset;