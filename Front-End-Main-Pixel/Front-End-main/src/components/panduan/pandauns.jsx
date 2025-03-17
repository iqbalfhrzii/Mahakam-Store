/* eslint-disable no-unused-vars */
 
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationItem from "./SidebarPanduan/NavigationPanduan";
import Breadcrumb from "./BreadcrumbsPanduan/BreadcrumbsPanduan";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";


function Panduan() {
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
        <div>
            <h1 className="text-4xl font-bold mb-6">Selamat Datang di Panduan!</h1>
            <p className="text-lg mb-4">
              Gunakan sidebar di sebelah kiri untuk memilih panduan yang Anda butuhkan.
            </p>
          </div>       
      </div>
    </div>
  );
}

export default Panduan;