/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";


const SidebarNavItem = ({ item }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!item) return null;

  // ini akan menentukan apakah item ini aktif berdasarkan rute saat ini
  const isActive = item?.href && location.pathname === item.href;
  const isChildActive = item.children?.some(
    (child) => location.pathname === child.href
  );
  const isOpenDropdown = isOpen || isChildActive;

  const itemClass = `font-poppins flex items-center w-full p-2 text-neutral-10 font-semibold rounded-r-full hover:rounded-r-full hover:text-primary-100 hover:font-semibold hover:rounded-lg dark:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40 ${
    isActive ? "bg-secondary-40 text-primary-100 dark:bg-secondary-40" : ""
  }`;

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Jika item yang di clik adalah dropdown
  if (item.type === "dropdown") {
    return (
      <div>
        <button className={itemClass} onClick={toggleDropdown}>
          {item.icon}
          <span className="ml-3">{item.label}</span>
          <span className="ml-2">v</span>
        </button>
        {isOpenDropdown && (
          <ul className="pl-6 mt-2 space-y-2 overflow-y-auto max-h-40">
            {item.children?.map((child, index) => {
              const isChildActive =
                child.href && location.pathname === child.href;
              return (
                <li key={index}>
                  <Link
                    to={child.href || "#"}
                    className={`font-poppins flex items-center w-full p-2 text-neutral-10 font-semibold rounded-r-full hover:text-primary-100 hover:font-semibold hover:rounded-lg dark:text-primary-100 hover:bg-secondary-40 dark:hover:bg-secondary-40 ${
                      isChildActive ? "bg-secondary-40 text-primary-100" : ""
                    }`}>
                    {child.icon}
                    <span className="ml-3">{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  if (item?.href) {
    return (
      <Link to={item.href} className={itemClass} onClick={item.onClick}>
        {item.icon}
        <span className="ml-3">{item.label}</span>
      </Link>
    );
  }

  return null;
};

export default SidebarNavItem;
