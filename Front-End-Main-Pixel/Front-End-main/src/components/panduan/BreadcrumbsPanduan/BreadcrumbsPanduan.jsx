/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import { Breadcrumb, Dropdown } from "flowbite-react";
import { Link as RouterLink } from "react-router-dom";
import { nameMap } from "./PathMapsPanduan";  

export default function BreadcrumbComponent() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

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

  return (
    <Breadcrumb aria-label="breadcrumb">
      {/* Breadcrumb Utama */}
      <Breadcrumb.Item>
        <RouterLink to="/panduan">
          <span className="text-[8px] sm:text-[8px] md:text-[8px] lg:text-[8px] xl:text-[10px]">
            {nameMap["/panduan"]}
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