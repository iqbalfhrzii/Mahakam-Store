/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useTheme } from "../../contexts/ThemeContext";
// Import Firebase Firestore
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import IconLightMode from "../../assets/icon/iconDarkMode&LigthMode/ligth_mode.svg";
import IconDarkMode from "../../assets/icon/iconDarkMode&LigthMode/dark_mode.svg";
import IconUserDark from "../../assets/icon/iconDarkMode&LigthMode/iconUserDark.svg";
import IconUserLight from "../../assets/icon/iconDarkMode&LigthMode/iconUserLight.svg";
import IconLogoutDark from "../../assets/icon/iconDarkMode&LigthMode/logOutDark.svg";
import IconLogoutLight from "../../assets/icon/iconDarkMode&LigthMode/logOutLight.svg";
import IconCart from "../../assets/icon/iconHeader/iconCart.svg";
import IconMyAsset from "../../assets/icon/iconHeader/iconMyasset.svg";
import logoWeb from "../../assets/logo/logoWeb.png";

function HeaderWebUser() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const displayUsername = windowWidth < 1282 ? username.slice(0, 4) : username;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUsername(
          currentUser.displayName || currentUser.email.split("@")[0] || "User"
        );
      } else {
        setUser(null);
        setUsername("");
        // setCartCount(0);
      }
    });

    // Fetch Cart Count
    // const fetchCartCount = async () => {
    //   if (user) {
    //     const cartCollection = collection(db, "cartAssets");
    //     // Create a query to filter by user UID
    //     const q = query(cartCollection, where("userId", "==", user.uid));
    //     const cartSnapshot = await getDocs(q);

    //     // Set the cartCount based on the size of the cartSnapshot
    //     setCartCount(cartSnapshot.size);
    //   }
    // };

    // Fetch cart count whenever the user changes
    // fetchCartCount();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("resize", handleResize);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (error) {
      // Handle logout error here if needed
    }
  };

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
    <div className="h-36 sm:h-0 md:h-0 lg:h-0 xl:h-0 2xl:h-0 ">
      <section className="navbar h-28 fixed z-30 top-0 left-0 pt-0 text-neutral-10  font-poppins font-semibold dark:text-primary-100 bg-primary-100 dark:bg-neutral-20 gap-2">
        <div className="flex gap-2 items-center">
          <img
            src={logoWeb}
            alt="logo"
            className="w-12 sm:w-16 md:w-18 lg:w-20 xl:w-20 2xl:w-24 h-auto"
          />
          <h2 className="text-[8px] sm:text-sm md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl hidden sm:block">
            PixelStore
          </h2>
        </div>

        <div className="fixed top-0 right-0 p-4 z-50">
          {/* cart an my asset */}
          <div className="z-50  gap-14 sm:gap-1 md:gap-1 lg:gap-1 xl:gap-1 2xl:gap-2 flex justify-center items-center">
            <Link
              to="/my-asset"
              className="z-20  w-[45px] sm:w-[45px] md:w-[44px] lg:w-[44px] xl:w-[60px] 2xl:w-[34px] h-[20px] sm:h-[28px] md:h-[28px] lg:h-[28px] xl:h-[28px] 2xl:h[28px] -ml-[30px] sm:ml-1 md:ml-1 lg:ml-0 xl:ml-0 2xl:ml-2 gap-1 text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[8px] 2xl:text-[8px]">
              <img
                src={IconMyAsset}
                alt="icon my asset"
                className="w-[24px] h-[24px] ml-4 sm:-ml-1 md:-ml-1 lg:-ml-1 xl:-ml-1 2xl:-ml-1"
              />
              <label className="ml-2  sm:-ml-4 md:-ml-4 lg:-ml-4 xl:-ml-4 2xl:-ml-4 text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[8px] 2xl:text-[8px]">
                My asset
              </label>
            </Link>

            <Link
              to="/cart"
              className="relative w-[20px] sm:w-[45px] md:w-[28px] lg:w-[28px] xl:w-[28px] 2xl:w-[28px] h-[20px] sm:h-[28px] md:h-[28px] lg:h-[28px] xl:h-[28px] 2xl:h[28px] -ml-[30px] sm:ml-1 md:ml-1 lg:ml-0 xl:ml-0 2xl:ml-2 gap-2 text-[8px] sm:text-[10px] md:text-[10px] lg:text-[10px] xl:text-[10px] 2xl:text-[10px]">
              <img
                src={IconCart}
                alt="icon cart"
                className="w-[24px] h-[24px]"
              />
              {/* {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )} */}
              <label>Cart</label>
            </Link>
          </div>

          <div className="flex-none gap-2">
            {user ? (
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="flex-none text-neutral-20 dark:text-primary-100">
                    <ul className="menu menu-horizontal">
                      <li>
                        <details className="relative ">
                          <summary className="cursor-pointer">
                            {displayUsername}
                          </summary>
                          <ul className="bg-neutral-90 dark:bg-neutral-20 rounded-lg w-48 shadow-lg ">
                            <li className="flex mb-1 w-full h-8 transition-colors duration-300 focus:outline-none">
                              <div className="flex items-center hover:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40  ">
                                <img
                                  src={darkMode ? IconUserDark : IconUserLight}
                                  alt="User Icon"
                                  className="w-5 h-5 me-2"
                                />
                                <Link to="/profile" type="button">
                                  Profile
                                </Link>
                              </div>
                            </li>
                            <li>
                              <div className="flex items-center justify-center p-2 bg-neutral-90 hover:border-none dark:bg-neutral-20   rounded-lg hover:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40 ">
                                <div
                                  onClick={toggleDarkMode}
                                  className="flex w-full h-6 transition-colors duration-100 focus:outline-none gap-4 ml-1  ">
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
                                    className={`text-[13px] font-semibold transition-colors duration-100${darkMode
                                      ? "text-neutral-100"
                                      : "text-neutral-800"
                                      }`}>
                                    {darkMode ? "Light Mode" : "Dark Mode"}
                                  </span>
                                </div>
                              </div>
                            </li>
                            <li className="flex mb-1 w-full h-8 transition-colors duration-300 focus:outline-none">
                              <div
                                className="flex items-center hover:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40"
                                onClick={handleLogout}>
                                <img
                                  src={
                                    darkMode ? IconLogoutDark : IconLogoutLight
                                  }
                                  alt="Logout Icon"
                                  className="w-5 h-5 me-2"
                                />
                                <button type="button">Logout</button>
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
                    id="dropdownDefaultButton"
                    data-dropdown-toggle="dropdown"
                    className="btn btn-ghost btn-circle avatar mx-2 w-14 h-14 rounded-full -ml-3">
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
              <div className="flex-none text-neutral-20 dark:text-primary-100 bg-primary-100">
                <ul className="menu-horizontal px-1 bg-primary-100">
                  <li>
                    <div className="dropdown dropdown-hover bg-primary-100">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn m-1 bg-primary-100 hover:bg-primary-100 ">
                        <p className="text-center mx-auto mt-1 text-neutral-10">
                          Hello, Sign in
                        </p>
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-primary-100 rounded-box z-[1] w-52 p-2 shadow ">
                        <li>
                          <Link to="/login">Login</Link>
                        </li>
                        <li>
                          <Link to="/register">Register</Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeaderWebUser;
