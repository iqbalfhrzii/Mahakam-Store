/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import NavigationItem from "../sidebarDashboardAdmin/navigationItemsAdmin";
import IconSearch from "../../assets/icon/iconHeader/iconSearch.svg";
import Breadcrumb from "../breadcrumbs/Breadcrumbs";
import IconHapus from "../../assets/icon/iconCRUD/iconHapus.png";
import IconEdit from "../../assets/icon/iconCRUD/iconEdit.png";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import { db, auth, storage } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";

function ManageAssetImage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 5; // Jumlah aset yang ditampilkan per halaman

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Mengamati status autentikasi pengguna
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Periksa apakah pengguna adalah admin atau superadmin
        const adminQuery = query(
          collection(db, "admins"),
          where("uid", "==", currentUser.uid)
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          setRole(adminData.role); // Role bisa 'admin' atau 'superadmin'
        } else {
          // Jika bukan admin atau superadmin, cek apakah pengguna adalah user biasa
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", currentUser.uid)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            setRole("user");
          }
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk mengambil data sesuai role pengguna
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!user || !role) {
        // console.log("No user or role detected");
        return;
      }

      try {
        let q;
        if (role === "superadmin") {
          // Superadmin dapat melihat semua aset
          q = query(collection(db, "assetImages"));
        } else if (role === "admin") {
          // Ambil semua aset yang diupload oleh user dan admin
          q = query(collection(db, "assetImages"));
        } else if (role === "user") {
          // User hanya bisa melihat aset yang dia unggah sendiri
          q = query(
            collection(db, "assetImages"),
            where("userId", "==", user.uid)
          );
        }

        const querySnapshot = await getDocs(q);
        const items = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const createdAt =
            data.createdAt?.toDate().toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) || "N/A";

          items.push({
            id: doc.id,
            imageName: data.imageName,
            description: data.description,
            price: `Rp. ${data.price}`,
            image: data.uploadUrlImage,
            category: data.category,
            createdAt,
            userId: data.userId,
          });
        }

        // Jika role admin, filter hasil untuk menghapus yang diupload oleh superadmin
        if (role === "admin") {
          const superadminQuery = query(
            collection(db, "admins"),
            where("role", "==", "superadmin")
          );
          const superadminSnapshot = await getDocs(superadminQuery);
          const superadminIds = superadminSnapshot.docs.map(
            (doc) => doc.data().uid
          );

          // Filter items untuk mengeluarkan yang diupload oleh superadmin
          const filteredItems = items.filter(
            (item) => !superadminIds.includes(item.userId)
          );
          setAssets(filteredItems);
        } else {
          setAssets(items);
        }
      } catch (error) {
        // console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && role) {
      fetchData();
    }
  }, [user, role]);

  // Filtered assets based on search term
  const filteredAssets = assets.filter(
    (asset) =>
      asset.imageName &&
      asset.imageName.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
  const startIndex = (currentPage - 1) * assetsPerPage;
  const currentAssets = filteredAssets.slice(
    startIndex,
    startIndex + assetsPerPage
  );

  // Fungsi hapus gambar
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (confirmDelete) {
      try {
        const ImageRef = ref(storage, `image-asset/uploadUrlImage-${id}.jpg`);
        await deleteObject(ImageRef);
        await deleteDoc(doc(db, "assetImages", id));
        setAssets(assets.filter((asset) => asset.id !== id));
        setAlertSuccess(true);
      } catch (error) {
        // console.error("Error deleting image: ", error);
        setAlertError(true);
      }
    } else {
      alert("Deletion cancelled");
    }
  };

  const closeAlert = () => {
    setAlertError(false);
  };

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
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
          <div className="min-h-screen px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
            <NavigationItem />
          </div>
        </aside>

        {/* Alert Success */}
        {alertSuccess && (
          <div
            role="alert"
            className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[300px] text-[10px] sm:text-[10px] p-4 bg-success-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
            onClick={closeAlert}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Image berhasil dihapus.</span>
            </div>
          </div>
        )}

        {/* Alert Error */}
        {alertError && (
          <div
            role="alert"
            className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[340px] text-[10px] sm:text-[10px] p-4 bg-primary-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
            onClick={closeAlert}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Gagal menghapus image, silakan coba lagi</span>
            </div>
          </div>
        )}

        {/* Isi Konten */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-14 xl:p-14 2xl:p-14 h-full bg-primary-100 text-neutral-10 dark:bg-neutral-20 dark:text-neutral-10 min-h-screen pt-24 sm:ml-64 md:ml-72 lg:ml-60 xl:ml-[270px] 2xl:ml-[270px] -mt-2 sm:mt-14 md:mt-14 lg:mt-10 xl:mt-10 2xl:mt-10">
          <div className="breadcrumbs text-sm mt-1 mb-6">
            <Breadcrumb />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Button Container */}
            <div className="flex items-center justify-center md:justify-start">
              <div className="flex bg-primary-2 rounded-lg items-center w-full md:w-36">
                <Link
                  to="/manage-asset-image/add"
                  className="rounded-lg flex justify-center items-center text-[14px] bg-secondary-40 hover:bg-secondary-30 text-primary-100 dark:text-primary-100 mx-auto h-[45px] w-full md:w-[400px]"
                >
                  + Add Image
                </Link>
              </div>
            </div>

            {/* Search Box */}
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
          ) : alertError ? (
            <div className="text-red-500 text-center mt-4">{alertError}</div>
          ) : (
            <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg p-8 dark:bg-neutral-25">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 bg-primary-100 dark:text-neutral-90">
                <thead className="text-xs text-neutral-20 uppercase dark:bg-neutral-25 dark:text-neutral-90 border-b dark:border-neutral-20">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Preview
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Image Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Harga
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Created At
                    </th>
                    <th scope="col" className="justify-center mx-auto">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="bg-primary-100 dark:bg-neutral-25 dark:text-neutral-9"
                    >
                      <td className="px-6 py-4">
                        <img src={asset.image} className="w-12 h-12 " />
                      </td>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 dark:text-neutral-90 whitespace-nowrap"
                      >
                        {asset.imageName}
                      </th>
                      <td className="px-6 py-4">{asset.category}</td>
                      <td className="px-6 py-4">{asset.price}</td>
                      <td className="px-6 py-4">{asset.createdAt || "N/A"}</td>
                      <td className="mx-auto flex gap-4 mt-8">
                        <Link to={`/manage-asset-image/edit/${asset.id}`}>
                          <img
                            src={IconEdit}
                            alt="icon edit"
                            className="w-5 h-5"
                          />
                        </Link>
                        <button onClick={() => handleDelete(asset.id)}>
                          <img
                            src={IconHapus}
                            alt="icon hapus"
                            className="w-5 h-5"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex join pt-72 justify-end ">
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
    </>
  );
}

export default ManageAssetImage;
