/* eslint-disable no-unused-vars */
 
import React, { Children } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { useTheme } from "../../contexts/ThemeContext";
import { useUserContext } from "../../contexts/UserContext";
import SidebarNavItem from "../../components/sidebarDashboardAdmin/SidebarNavItemAdmin";
import IconDashboardDark from "../../assets/icon/iconSidebar/iconDashboard.png";
import IconAssetVideoDark from "../../assets/icon/iconSidebar/iconAssetVideo.png";
import IconAssetGambarDark from "../../assets/icon/iconSidebar/iconAssetGambar.png";
import IconAssetGameDark from "../../assets/icon/iconSidebar/iconAssetGame.png";
import IconAssetDatasetDark from "../../assets/icon/iconSidebar/iconAssetDataset.png";
import IconManageAdminDark from "../../assets/icon/iconSidebar/iconManageAdmin.png";
import IconManageAdminLight from "../../assets/icon/iconSidebarLigthMode/iconManageAdminDark.svg";
// Icon untuk LightMode
import IconDashboardLight from "../../assets/icon/iconSidebarLigthMode/iconDashboardLightMode.png";
import IconAssetVideoLightMode from "../../assets/icon/iconSidebarLigthMode/iconAssetVideoLightMode.png";
import IconAssetGambarLightMode from "../../assets/icon/iconSidebarLigthMode/iconAssetGambarLightMode.png";
import IconAssetDatasetLightMode from "../../assets/icon/iconSidebarLigthMode/iconAssetDatasetLightMode.png";
import IconAssetGameLightMode from "../../assets/icon/iconSidebarLigthMode/iconAssetGameLightMode.png";
import IconlogoutLightMode from "../../assets/icon/iconSidebarLigthMode/iconLogOutDarkMode.png";
import IconlogoutDarkMode from "../../assets/icon/iconSidebar/iconLogOut.svg";
import IconDollarLight from "../../assets/icon/iconSidebar/iconDollarLight.svg";
import IconDollarDark from "../../assets/icon/iconSidebar/iconDollarDark.svg";
import IconRevenueLight from "../../assets/icon/iconSidebar/iconRevenueLight.svg";
import IconRevenueDark from "../../assets/icon/iconSidebar/iconRevenueDark.svg";
import Logo from "../../assets/logo/logoWeb.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { userRole } = useUserContext("userRole");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (error) {
      // console.error("Logout failed:", error.message);
    }
  };

  const navigationItems = [
    {
      section: "Dashboard",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: darkMode ? (
            <img src={IconDashboardDark} alt="iconDashboardDark" />
          ) : (
            <img src={IconDashboardLight} alt="iconDashboardLight" />
          ),
        },
      ],
    },
    {
      section: "Manage Assets",
      items: [
        {
          href: "/manage-asset-video",
          label: "Manage Asset Video",
          icon: darkMode ? (
            <img src={IconAssetVideoDark} alt="iconAssetVideoDark" />
          ) : (
            <img src={IconAssetVideoLightMode} alt="iconAssetVideoLightMode" />
          ),
        },
        {
          href: "/manage-asset-image",
          label: "Manage Asset Image",
          icon: darkMode ? (
            <img src={IconAssetGambarDark} alt="iconAssetGambarDark" />
          ) : (
            <img
              src={IconAssetGambarLightMode}
              alt="iconAssetGambarLightMode"
            />
          ),
        },
        {
          href: "/manage-asset-dataset",
          label: "Manage Asset Dataset",
          icon: darkMode ? (
            <img src={IconAssetDatasetDark} alt="iconAssetDatasetDark" />
          ) : (
            <img
              src={IconAssetDatasetLightMode}
              alt="iconAssetDatasetLightMode"
            />
          ),
        },
        {
          type: "dropdown",
          href: "#",
          label: "Manage Asset Game",
          icon: darkMode ? (
            <img src={IconAssetGameDark} alt="iconAssetGameDark" />
          ) : (
            <img src={IconAssetGameLightMode} alt="iconAssetGameLightMode" />
          ),
          children: [
            {
              href: "/manage-asset-2D",
              label: "Manage Asset 2D",
            },
            {
              href: "/manage-asset-3D",
              label: "Manage Asset 3D",
            },
            {
              href: "/manage-asset-audio",
              label: "Manage Asset Audio",
            },
          ],
        },

        {
          href: "/sale",
          label: "Sales",
          icon: darkMode ? (
            <img src={IconDollarLight} alt="IconDollarLight" />
          ) : (
            <img src={IconDollarDark} alt="IconDollarDark" />
          ),
        },

        {
          href: "/revenue",
          label: "Revenue",
          icon: darkMode ? (
            <img src={IconRevenueLight} alt="IconRevenueLight" />
          ) : (
            <img src={IconRevenueDark} alt="IconRevenueDark" />
          ),
        },

        {
          href: "/paymentSetting",
          label: "No.Rekening ",
          icon: darkMode ? (
            <img src={IconRevenueLight} alt="IconRevenueLight" />
          ) : (
            <img src={IconRevenueDark} alt="IconRevenueDark" />
          ),
        },
      ],
    },


    (userRole === "superadmin" || userRole === "admin") && {
      section: "User Management",
      items: [
        {
          href: "/manage-users",
          label: "Manage Users",
          icon: darkMode ? (
            <img src={IconManageAdminDark} alt="iconManageAdminDark" />
          ) : (
            <img src={IconManageAdminLight} alt="iconlightMode" />
          ),
          children: [
            {
              href: "/manage-admin/add",
              label: "Manage Admin",
            },
          ],
        },
        {
          href: "/user-revenue",
          label: "User Revenue",
          icon: darkMode ? (
            <img src={IconManageAdminDark} alt="iconManageAdminDark" />
          ) : (
            <img src={IconManageAdminLight} alt="iconlightMode" />
          ),
        },
      ],
    },


    userRole === "superadmin" && {
      section: "Admin Management",
      items: [
        {
          href: "/manage-admin",
          label: "Manage Admin",
          icon: darkMode ? (
            <img src={IconManageAdminDark} alt="iconManageAdminDark" />
          ) : (
            <img src={IconManageAdminLight} alt="iconlightMode" />
          ),
          children: [
            {
              href: "/manage-admin/add",
              label: "Manage Admin",
            },
          ],
        },
      ],
    },
    {
      section: "Log Out",
      items: [
        {
          href: "/",
          label: "Log Out",
          icon: darkMode ? (
            <img src={IconlogoutDarkMode} alt="iconlogoutDarkMode" />
          ) : (
            <img src={IconlogoutLightMode} alt="iconLogoutLightMode" />
          ),
          onClick: handleLogout,
        },
      ],
    },
  ].filter(Boolean); // Kita gunakan Bolean dengan memfilter untuk menghapus nilai false jika bukan superadmin

  return (
    <nav className="space-y-4 p-4 -mt-8 dark:bg-neutral-10 font-poppins  lg:h-auto lg:overflow-y-auto transform lg:scale-95"> {/* Menambahkan transform scale */}
      <div className="h-[60px] flex items-center justify-center gap-4">
        <img alt="Logo" src={Logo} className="w-24 h-24 rounded-full" />
        <h1 className="text-xl text-center font-bold text-neutral-20 dark:text-primary-100 py-8">
          PixelStore
        </h1>
      </div>
      {navigationItems.map((section, sectionIndex) => (
        <div key={sectionIndex} className="text-xs ">
          <h2 className="text-xs font-semibold text-neutral-10 dark:text-primary-100 mb-1 uppercase mt-6">
            {section.section}
          </h2>
          {section.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className={section.section === "Manage Assets" || section.section === "Manage Users" ? "mb-1 -mt-0.5" : ""}
            >
              <SidebarNavItem
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
