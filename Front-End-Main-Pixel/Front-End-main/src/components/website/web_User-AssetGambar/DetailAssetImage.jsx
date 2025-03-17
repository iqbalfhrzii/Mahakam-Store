// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// import LoginUser from "./LoginUser";
import { Link } from "react-router-dom";

function DetailAssetImage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  const openLoginPopup = () => setIsLoginPopupOpen(true);
  const closeLoginPopup = () => setIsLoginPopupOpen(false);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2000);
  };

  const asset = {
    id: 1,
    name: "Mobile Legend",
    owner: "John Doe",
    description: "Game haram kata MUI",
    imageUrl: "background.jpg",
    price: "Rp. Gratis",
    type: "JPEG",
    category: "Game",
    likes: "infinite",
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className={`min-h-screen bg-white dark:bg-gray-900 transition duration-500 ease-in-out ${
          isDarkMode ? "dark" : ""
        }`}
        style={{ fontFamily: "'Poppins', sans-serif" }}>
        <header className="bg-[#171717] shadow-md py-3 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src="PixelStore.png"
                alt="PixelStore Logo"
                className="h-16 w-16 md:h-20 md:w-20 mr-2"
              />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                PixelStore
              </h1>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-1/2 lg:w-1/3 mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search | Type"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white bg-blue-500 rounded-md p-2">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                className="flex items-center bg-white hover:bg-blue-600 text-black py-1 px-2 md:py-2 md:px-4 rounded-md transition transform hover:scale-105 duration-300 ease-in-out"
                onClick={toggleDarkMode}>
                {isDarkMode ? (
                  <SunIcon className="h-4 w-4 md:h-6 md:w-6 text-gray-800" />
                ) : (
                  <MoonIcon className="h-4 w-4 md:h-6 md:w-6 text-gray-800" />
                )}
              </button>

              <div className="relative group">
                <button className="flex items-center p-1 md:p-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <UserIcon className="h-4 w-4 md:h-6 md:w-6 text-gray-800" />
                  <span className="ml-1 md:ml-2 text-xs md:text-sm text-gray-800">
                    Hello, Sign in
                  </span>
                  <svg
                    className="ml-1 h-3 w-3 md:h-4 md:w-4 text-black-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 bg-white dark:bg-gray-800 shadow-md rounded-md py-0 px-4 hidden group-hover:block">
                  <button
                    onClick={openLoginPopup}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Sign In
                  </button>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Sign Up
                  </Link>
                </div>
              </div>

              <button className="flex items-center bg-white hover:bg-blue-600 text-black py-1 px-2 md:py-2 md:px-4 rounded-md transition transform hover:scale-105 duration-300 ease-in-out">
                <ShoppingCartIcon className="h-4 w-4 md:h-6 md:w-6" />
                <span className="ml-1 md:ml-2 text-xs md:text-sm">Cart</span>
              </button>
            </div>
          </div>
        </header>

        {isLoginPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-2xl h-[90vh] max-h-[400px] overflow-y-auto bg-white rounded-lg p-4">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                onClick={closeLoginPopup}>
                <XMarkIcon className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              {/* <LoginUser /> */}
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <nav className="bg-[#201E43] text-white py-3 md:py-5 overflow-x-auto">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-2 md:space-x-6">
              <Link
                to="#"
                className="text-xs md:text-sm hover:underline whitespace-nowrap">
                Telusuri Semua
              </Link>
              <span className="text-xs md:text-sm">|</span>
              <Link
                to="#"
                className="text-xs md:text-sm hover:underline whitespace-nowrap">
                Asset Video
              </Link>
              <Link
                to="/asset-gambar"
                className="text-xs md:text-sm hover:underline whitespace-nowrap">
                Asset Gambar
              </Link>
              <Link
                to="#"
                className="text-xs md:text-sm hover:underline whitespace-nowrap">
                Asset Dataset
              </Link>
              <Link
                to="#"
                className="text-xs md:text-sm hover:underline whitespace-nowrap">
                Asset Game
              </Link>
            </div>
            <Link
              to="#"
              className="text-xs md:text-sm hover:underline whitespace-nowrap">
              Asset Gratis
            </Link>
          </div>
        </nav>

        {/* Banner Section */}
        <section
          className="relative bg-cover bg-center h-32 md:h-64 flex items-center justify-center"
          style={{ backgroundImage: "url(background.jpg)" }}>
          <div className="bg-gray-800 bg-opacity-50 p-4 md:p-6 rounded-md text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-4">
              Butuh Asset berkualitas untuk tugas dan proyekmu?
            </h2>
            <p className="text-sm md:text-lg text-white">
              Jelajahi ribuan Asset menarik di website kami!
            </p>
          </div>
        </section>

        {/* Asset Section */}
        <main className="container mx-auto my-6 px-4">
          <div className="flex flex-col md:flex-row rounded-md shadow-md bg-white">
            <div className="w-full md:w-1/2 text-black">
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-64 md:h-auto object-cover"
              />
              <div className="p-4">
                <p className="text-sm">{asset.description}</p>
              </div>
            </div>

            <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col space-y-4 md:space-y-6 text-black">
              <h3 className="text-xl md:text-2xl font-bold">{asset.name}</h3>
              <p className="text-sm md:text-base">Pemilik: {asset.owner}</p>
              <p className="text-base md:text-lg font-semibold">
                Harga: {asset.price}
              </p>
              <p className="text-sm md:text-base">Tipe: {asset.type}</p>
              <p className="text-sm md:text-base">Kategori: {asset.category}</p>

              <div className="space-y-3 md:space-y-4">
                <button
                  className="bg-[#575859] text-white px-4 md:px-6 py-2 rounded-md w-full flex items-center justify-center space-x-2"
                  onClick={() =>
                    showToast("Berhasil ditambahkan ke keranjang")
                  }>
                  <ShoppingCartIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base">
                    Tambahkan ke Keranjang
                  </span>
                </button>

                <Link
                  to="/detail-asset-gambar"
                  className="bg-blue-500 text-white px-4 md:px-6 py-2 rounded-md hover:bg-blue-600 w-full flex items-center justify-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="text-sm md:text-base">Beli dan Unduh</span>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {isToastVisible && (
          <div className="fixed bottom-5 right-5 p-4 bg-green-500 text-white rounded-md shadow-lg">
            {toastMessage}
          </div>
        )}

        {/* Footer */}
        <footer className="bg-[#212121] text-white py-8 md:py-20">
          <div className="container mx-auto flex flex-col items-center px-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4 md:mb-8">
              <Link to="#" className="text-sm md:text-base hover:text-gray-400">
                Terms And Conditions
              </Link>
              <Link to="#" className="text-sm md:text-base hover:text-gray-400">
                File Licenses
              </Link>
              <Link to="#" className="text-sm md:text-base hover:text-gray-400">
                Refund Policy
              </Link>
              <Link to="#" className="text-sm md:text-base hover:text-gray-400">
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs md:text-sm text-center">
              Copyright &copy; 2024 All rights reserved by PixelStore
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default DetailAssetImage;
