/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Breadcrumb, Dropdown } from "flowbite-react";
import { Link as RouterLink } from "react-router-dom";
import { nameMap } from "./PathMapWeb";  

export default function BreadcrumbComponent() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState(null);

  // Function untuk mendapatkan nama breadcrumb, termasuk penanganan URL dengan parameter
  const getBreadcrumbName = (path) => {
    // Cek jika ada rute yang mengandung parameter dinamis
    const dynamicPaths = Object.keys(nameMap).filter((key) =>
      key.includes("/:")
    );

    for (let dynamicPath of dynamicPaths) {
      const regexPath = dynamicPath.replace(/:\w+/g, "\\w+");
      const regex = new RegExp(`^${regexPath}$`);
      if (regex.test(path)) {
        return nameMap[dynamicPath];
      }
    }

    return nameMap[path] || "Page Not Found";
  };

  // Function untuk menampilkan dropdown
  const handleDropdownToggle = (index) => {
    setSelectedDropdown(index);
    setDropdownOpen(true);
  };

  // Function untuk menutup dropdown
  const handleDropdownClose = () => {
    setDropdownOpen(false);
    setSelectedDropdown(null);
  };

  return (
    <Breadcrumb aria-label="breadcrumb">
      {/* Breadcrumb Utama */}
      <Breadcrumb.Item>
        <RouterLink to="/dashboard">
          <span className="text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[10px]">
            {nameMap["/dashboard"]}
          </span>
        </RouterLink>
      </Breadcrumb.Item>

      {/* Breadcrumb Dinamis */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const breadcrumbName = getBreadcrumbName(to);
        if (breadcrumbName === "Page Not Found") {
          return null;
        }

        // Jika breadcrumbName adalah salah satu yang memiliki dropdown, tampilkan dropdown
        if (
          breadcrumbName === "Asset 2D" ||
          breadcrumbName === "Asset 3D" ||
          breadcrumbName === "Asset Audio"
        ) {
          return (
            <Breadcrumb.Item key={to}>
              <Dropdown
                isOpen={dropdownOpen && selectedDropdown === index}
                toggle={() => handleDropdownToggle(index)}
                onClose={handleDropdownClose}
                className="relative">
                <Dropdown.Toggle
                  as={RouterLink}
                  to={to}
                  className="cursor-pointer">
                  <span className="text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[10px]">
                    {breadcrumbName}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={RouterLink} to="/manage-asset-audio">
                    Asset 2D
                  </Dropdown.Item>
                  <Dropdown.Item as={RouterLink} to="/manage-asset-audio">
                    Asset 3D
                  </Dropdown.Item>
                  <Dropdown.Item as={RouterLink} to="/manage-asset-audio">
                    Asset Audio
                  </Dropdown.Item>
                  <Dropdown.Item as={RouterLink} to="*">
                    Error Page 404
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Breadcrumb.Item>
          );
        }

        // Jika bukan dropdown, tampilkan biasa
        return (
          <Breadcrumb.Item key={to}>
            <RouterLink to={to}>
              <span className="text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[10px]">
                {breadcrumbName}
              </span>
            </RouterLink>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
