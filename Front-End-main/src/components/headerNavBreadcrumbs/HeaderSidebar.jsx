/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useTheme } from "../../contexts/ThemeContext";
import { onAuthStateChanged } from "firebase/auth";
// import { nameMap } from "../breadcrumbs/PathMap";
import { useNavigate } from "react-router-dom";
import IconToggelMenu from "../../assets/icon/iconHeader/iconMenu.svg";
import IconLightMode from "../../assets/icon/iconDarkMode&LigthMode/ligth_mode.svg";
import IconDarkMode from "../../assets/icon/iconDarkMode&LigthMode/dark_mode.svg";
import IconUserDark from "../../assets/icon/iconDarkMode&LigthMode/iconUserDark.svg";
import IconUserLight from "../../assets/icon/iconDarkMode&LigthMode/iconUserLight.svg";
import IconLogoutDark from "../../assets/icon/iconDarkMode&LigthMode/logOutDark.svg";
import IconLogoutLight from "../../assets/icon/iconDarkMode&LigthMode/logOutLight.svg";
import IconStoreLight from "../../assets/icon/iconHeaderDashboard/iconStoreLight.svg";
import IconStoreDark from "../../assets/icon/iconHeaderDashboard/iconStoreDark.svg";

// eslint-disable-next-line react/prop-types
function HeaderSidebar({ toggleSidebar }) {
  const { darkMode, toggleDarkMode } = useTheme();
  // const location = useLocation();
  const navigate = useNavigate();
  // const currentPath = location.pathname;
  // const pageName = nameMap[currentPath] || "Unknown Page";
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  // Fungsi handleLogout untuk menangani logout
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUsername(
          currentUser.displayName || currentUser.email.split("@")[0] || "User"
        );
      } else {
        setUser(null);
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Menampilkan initial dari nama pengguna menggantikan foto prifile jika tidak tersedia
  const getInitial = (name) => {
    const nameParts = name.split(" ");

    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    } else {
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const secondInitial = nameParts[1].charAt(0).toUpperCase();
      return firstInitial + secondInitial;
    }
  };

  const getPhotoURLFromToken = () => {
    const token = localStorage.getItem("authToken");  
    if (!token) return null;  
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));  
      return payload.image || payload.profileImageUrl || null; 
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;  
    }
  };

  return (
    <section className="navbar h-24 fixed z-40 top-0 left-0 pt-0 text-neutral-10 shadow-md font-poppins font-semibold dark:text-primary-100 bg-neutral-90 dark:bg-neutral-20 dark:shadow-lg dark:shadow-neutral-10 gap-6">
      <div className="flex-1">
        <button
          onClick={toggleSidebar}
          type="button"
          className="inline-flex items-center p-2 ms-3 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-neutral-90 dark:bg-neutral-10 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <img
            src={IconToggelMenu}
            alt="iconToggelMenu"
            className="w-10 h-5 mx-auto"
          />
        </button>
        {/* <ul className="breadcrumb text-xl">
          <li
            className="breadcrumb-item active hidden md:block text-xl text-neutral-20 dark:text-primary-100 font-semibold sm:ml-[200px] md:ml-[240px] lg:ml-[240px] xl:ml-[230px]"
            aria-current="page">
            {pageName}
          </li>
        </ul> */}
      </div>

      <div className="flex-none gap-2">
        {user ? (
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex-none text-neutral-20 dark:text-primary-100">
                <ul className="menu menu-horizontal">
                  <li>
                    <details className="relative">
                      <summary className="cursor-pointer">{username}</summary>
                      <ul className="bg-neutral-90 dark:bg-neutral-20 rounded-lg w-48 shadow-lg">
                        <li className="flex  mb-1 w-full h-10  transition-colors duration-300 hover:bg-secondary-40 hover:text-primary-100 focus:outline-none">
                          <div className="flex items-center">
                            <img
                              src={darkMode ? IconUserDark : IconUserLight}
                              alt="Logout Icon"
                              className="w-5 h-5 me-2"
                            />
                            <Link to="/profil" type="button">
                              Profile
                            </Link>
                          </div>
                        </li>

                        <li className="flex  mb-1 w-full h-10 -p-2 transition-colors duration-300 hover:bg-secondary-40 hover:text-primary-100 focus:outline-none">
                          <div className="flex items-center">
                            <img
                              src={darkMode ? IconStoreLight : IconStoreDark}
                              alt="Logout Icon"
                              className="w-6 h-6 me-2"
                            />
                            <Link to="/" alt="ast">
                              Asset Store
                            </Link>
                          </div>
                        </li>

                        <li>
                          <div className="flex items-center justify-center bg-neutral-90 hover:border-none dark:bg-neutral-20 hover:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40  rounded-none">
                            <div
                              onClick={toggleDarkMode}
                              className="flex w-full h-6 transition-colors duration-100 focus:outline-none gap-4 -p-1  ">
                              {darkMode ? (
                                <img
                                  src={IconDarkMode}
                                  alt="icon dark mode"
                                  className="w-5 h-5 transition-transform duration-100"
                                />
                              ) : (
                                <img
                                  src={IconLightMode}
                                  alt="icon light mode"
                                  className="w-6 h-6 transition-transform duration-100"
                                />
                              )}
                              <span
                                className={`text-[13px] font-semibold transition-colors duration-100${
                                  darkMode
                                    ? "text-neutral-100"
                                    : "text-neutral-800"
                                }`}>
                                {darkMode ? "Light Mode" : "Dark Mode"}
                              </span>
                            </div>
                          </div>
                        </li>
                        <li className="flex w-full h-10 transition-colors duration-300 hover:bg-secondary-40 hover:text-primary-100 focus:outline-none">
                          <div className="flex items-center">
                            <img
                              src={darkMode ? IconLogoutDark : IconLogoutLight}
                              alt="Logout Icon"
                              className="w-5 h-5 me-2"
                            />
                            <button type="button" onClick={handleLogout}>
                              Logout
                            </button>
                          </div>
                        </li>
                      </ul>
                    </details>
                  </li>
                </ul>
              </div>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar mx-2 w-14 h-14 rounded-full  -ml-3">
                 <div className="w-14 h-14 p-3 rounded-full overflow-hidden bg-neutral-80 flex items-center justify-center text-secondary-40 font-bold text-2xl mx-auto ">
                      {user ? (
                        user.image || user.profileImageUrl || getPhotoURLFromToken() ? ( 
                          <img
                            alt="Avatar"
                            src={user.image || user.profileImageUrl || getPhotoURLFromToken()} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-[22px] text-center mx-auto -ml-1">
                            {getInitial(username)}
                          </span>
                        )
                      ) : (
                        <img
                          alt="Default User Icon"
                          src="/path/to/default-user-icon.svg"
                          className="w-10 h-10"
                        />
                      )}
                    </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-none text-neutral-20 dark:text-primary-100">
            <ul className="menu menu-horizontal px-1">
              <li>
                <details>
                  <summary className="cursor-pointer">Hello, Sign in</summary>
                  <ul className="bg-neutral-90 dark:bg-neutral-20 rounded-t-none p-2">
                    <li>
                      <Link to="/login">Login</Link>
                    </li>
                    <li>
                      <Link to="/register">Register</Link>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeaderSidebar;
