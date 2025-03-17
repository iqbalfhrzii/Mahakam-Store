/* eslint-disable no-unused-vars */
 
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import NavigationItem from "../sidebarDashboardAdmin/navigationItemsAdmin";
import IconSearch from "../../assets/icon/iconHeader/iconSearch.svg";
import Breadcrumb from "../breadcrumbs/Breadcrumbs";
import IconHapus from "../../assets/icon/iconCRUD/iconHapus.png";
import IconEdit from "../../assets/icon/iconCRUD/iconEdit.png";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import { getAuth } from "firebase/auth";
import { getStorage, ref, deleteObject } from "firebase/storage";

function ManageAdmin() {
  const defaultImageUrl =
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Pagination state untuk tabelnya
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3000/api/admins");
        setAdmins(response.data);
        setFilteredAdmins(response.data);
      } catch (error) {
        // console.error("Error fetching admin data: ", error);
        setError("Failed to fetch admins. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    // Filter admins whenever search term changes
    if (searchTerm) {
      setFilteredAdmins(
        admins.filter((admin) =>
          admin.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredAdmins(admins);
    }

    // Reset current page to 1 when search term changes
    setCurrentPage(1);
  }, [searchTerm, admins]);

  const handleDeleteAdmin = async (id) => {
    setIsLoading(true);
    setError(null);
    const admin = admins.find((admin) => admin.id === id);
    if (!admin) {
      // console.error("Admin not found in local state");
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken(true);

      // Hapus admin dari database
      const response = await axios.delete(
        `http://localhost:3000/api/admins/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        // Hapus gambar dari Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, admin.profileImageUrl);
        await deleteObject(imageRef);

        // Perbarui state Admin
        setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        setFilteredAdmins((prev) => prev.filter((admin) => admin.id !== id));
        navigate("/manage-admin");
      } else {
        setError("Failed to delete admin. Please try again.");
      }
    } catch (error) {
      // console.error("Error deleting admin:", error);
      if (error.response) {
        // console.error("Error response data:", error.response.data);
      }
      setError(
        error.response?.data?.message ||
          "Failed to delete admin. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setAdminToDelete(null);
    }
  };

  const confirmDeleteAdmin = () => {
    if (adminToDelete) {
      handleDeleteAdmin(adminToDelete.id);
    }
  };

  // Menghitung jumlah halaman
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);
  const startIndex = (currentPage - 1) * adminsPerPage;
  const currentAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + adminsPerPage
  );

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
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
          <NavigationItem />
        </div>
      </aside>

      <div className="p-8 sm:ml-[280px] h-full bg-primary-100 text-neutral-10 dark:bg-neutral-20 dark:text-neutral-10 min-h-screen pt-24">
        <div className="breadcrumbs text-sm mt-1 mb-10">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-center md:justify-start">
              <div className="flex bg-primary-2 rounded-lg items-center w-full md:w-48">
                <Link
                  to="/manage-admin/add"
                  className="rounded-lg flex justify-center items-center text-[14px] bg-secondary-40 hover:bg-secondary-30 text-primary-100 dark:text-primary-100 mx-auto h-[45px] w-full md:w-[400px]"
                >
                  + Add new Admin
                </Link>
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <div className="relative h-[48px] bg-primary-100 dark:bg-neutral-20 rounded-lg border border-neutral-90 dark:border-neutral-25 dark:border-2">
              <img
                src={IconSearch}
                alt="iconSearch"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input border-none bg-primary-100 dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 pl-10 h-[40px] w-full focus:outline-none"
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64 mt-20">
            <div className="animate-spin rounded-full h-60 w-60 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center mt-4">{error}</div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-8 dark:bg-neutral-25 mt-4">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 bg-primary-100 dark:text-neutral-90 ">
              <thead className="text-xs text-neutral-20 uppercase dark:bg-neutral-25 dark:text-neutral-90 border-b dark:border-neutral-20">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Photo
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Created at
                  </th>
                  <th scope="col" className="justify-center mx-auto">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="bg-primary-100 dark:bg-neutral-25 dark:text-neutral-9"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={admin.profileImageUrl || defaultImageUrl}
                        alt={`${admin.username}'s profile`}
                        className="w-12 h-12 rounded-lg"
                      />
                    </td>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 dark:text-neutral-90 space-nowrap"
                    >
                      {admin.username}
                    </th>
                    <td className="px-6 py-4">{admin.role}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      {admin.createdAt
                        ? new Date(
                            admin.createdAt._seconds * 1000
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </td>
                    <td className="mx-auto flex gap-4 mt-8">
                      <Link to={`/manage-admin/edit/${admin.id}`}>
                        <img
                          src={IconEdit}
                          alt="Edit"
                          className="w-5 h-5 cursor-pointer"
                        />
                      </Link>
                      <img
                        src={IconHapus}
                        alt="Delete"
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => {
                          setIsModalOpen(true);
                          setAdminToDelete(admin);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {error && (
              <div className="text-red-600 mt-4 text-center">{error}</div>
            )}
          </div>
        )}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold">Konfirmasi Penghapusan</h2>
              <p className="mt-2">
                Apakah Anda yakin ingin menghapus admin
                <span className="font-bold">{adminToDelete?.username}</span>?
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                  onClick={confirmDeleteAdmin}
                >
                  Hapus
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Section */}
        <div className="flex join pt-72 justify-end">
          <button
            className="join-item w-14 text-[20px] bg-secondary-40 hover:bg-secondary-50 border-secondary-50 hover:border-neutral-40 opacity-90"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button className="join-item btn dark:bg-neutral-30 bg-neutral-60 text-primary-100 hover:bg-neutral-70 hover:border-neutral-30 border-neutral-60 dark:border-neutral-30">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="join-item w-14 text-[20px] bg-secondary-40 hover:bg-secondary-50 border-secondary-50 hover:border-neutral-40 opacity-90"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageAdmin;
