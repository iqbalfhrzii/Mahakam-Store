import logoWeb from "../../../assets/logo/logoWeb.png";
import { FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10 mt-10 border-t border-gray-300 dark:bg-neutral-900 text-neutral-700 dark:text-primary-100 font-poppins relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src={logoWeb}
              alt="PixelStore Logo"
              className="w-24 h-24 md:w-32 md:h-32 mb-4 transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
            <p className="text-gray-500 text-sm dark:text-primary-100">
              Temukan, Bagikan, dan Berinovasi dengan Aset digital yang terbaik
              Anda.
            </p>
          </div>

          {/* Follow Us Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-primary-100 mb-3">
              Follow Us
            </h3>
            <div className="flex space-x-4 items-center">
              <a
                href="https://www.instagram.com/asset.bypixel/profilecard/?igsh=MXR1b2Z5ejE3aHcwaA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 dark:text-primary-100 hover:text-gray-900 dark:hover:text-white transition duration-200"
              >
                <FaInstagram className="w-6 h-6 mr-2" />
                <span className="text-[14px]">Instagram</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-primary-100 mb-3">
              Asset Navigation
            </h3>
            {[
              { href: "/asset-video", text: "Asset Video" },
              { href: "/asset-image", text: "Asset Image" },
              { href: "/asset-dataset", text: "Asset Dataset" },
              { href: "/asset-game", text: "Asset Game" },
              { href: "/asset-gratis", text: "Asset Gratis" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-700 dark:text-primary-100 hover:text-gray-900 dark:hover:text-white transition duration-200"
              >
                {link.text}
              </a>
            ))}
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-300 mt-4">
          <span className="text-gray-600 text-sm dark:text-primary-100">
            © 2024 PixelStore. All rights reserved.
          </span>
          <span className="text-gray-600 text-sm dark:text-primary-100 mt-4 md:mt-0">
            Designed with ❤️ by Pixel Team
          </span>
        </div>
      </div>

      {/* Cat Animation */}
      <motion.div
        className="absolute bottom-0 left-0"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <span role="img" aria-label="cat" className="text-6xl"></span>
      </motion.div>
    </footer>
  );
};

export default Footer;
