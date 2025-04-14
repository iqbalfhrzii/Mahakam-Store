/* eslint-disable no-unused-vars */
 
import React, { Children } from "react";
import SidebarNavPanduan from './SidebarNavP'
import MahakamStoreLogo from "../../../assets/logo/MahakamStoreLogo.png";

const Sidebar = () => {
  const navigationItems = [
     
    {
      section: "Panduan",
      items: [
        {
          href: "/panduan-registrasi",
          label: "Registrasi",
          
        },
        {
          href: "/panduan-login",
          label: "Login",
          
        },
        {
          href: "/panduan-lupa-password",
          label: "Lupa Password",
           
        },
        {
          href: "/panduan-jual-asset",
          label: "Jual Produk",
         
        },

        {
          href: "/panduan-edit-asset",
          label: "Edit Produk",
           
  },
  {
  href: "/",
  label: "Kembali ke Home",
     
  },
      ],
    },
    
  ].filter(Boolean);  

  return (
    <nav className="space-y-4 overflow-y-auto min-h-screen h-[1000vh] p-4 bg-neutral-100 dark:bg-neutral-10 font-poppins  ">
      <div className="h-[80px] flex items-center justify-center gap-4">
        <img alt="Logo" src={MahakamStoreLogo} className="w-28 h-28 rounded-full" />
        <h1 className="text-xl text-center font-bold text-neutral-20 dark:text-primary-100 py-8">
          Mahakam Store
        </h1>
      </div>
      {navigationItems.map((section, sectionIndex) => (
        <div key={sectionIndex} className="text-xs ">
          <h2 className="text-xl font-semibold text-neutral-10 dark:text-primary-100 mb-4 uppercase mt-8">
            {section.section}
          </h2>
          {section.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className={section.section === "Panduan" ? "mb-4 text-xs" : ""}>
              <SidebarNavPanduan
                item={item}
                isActive={false}
                onClick={item.onClick}
              />
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;