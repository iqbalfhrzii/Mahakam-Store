import { useState, useRef, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { FaChartLine, FaDollarSign, FaThumbsUp } from "react-icons/fa";
import NavigationItem from "../sidebarDashboardAdmin/navigationItemsAdmin";
import Breadcrumb from "../breadcrumbs/Breadcrumbs";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";

function SalesAsset() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [userAssets, setUserAssets] = useState([]);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "buyAssets"),
        (snapshot) => {
          const filteredAssets = [];
          let totalPrice = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();

            if (data.assetOwnerID === user.uid) {
              filteredAssets.push({
                ...data,
                docId: doc.id,
              });
              if (data.price) {
                totalPrice += Number(data.price);
              }
            }
          });

          setUserAssets(filteredAssets);
          setTotalSales(totalPrice);
        }
      );

      return () => unsubscribe();
    }

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
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const assetCollections = [
        "assetAudios",
        "assetImage2D",
        "assetImage3D",
        "assetDatasets",
        "assetImages",
        "assetVideos",
      ];

      const fetchLikes = async () => {
        let likesCount = 0;

        for (const collectionName of assetCollections) {
          const querySnapshot = await getDocs(collection(db, collectionName));

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.userId === user.uid && data.likeAsset) {
              likesCount += Number(data.likeAsset);
            }
          });
        }

        setTotalLikes(likesCount);
      };

      fetchLikes();
    }
  }, []);

  return (
    <>
      <div className="min-h-screen font-poppins dark:bg-neutral-10 dark:text-primary-100 text-neutral-20">
        <HeaderSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <aside
          ref={sidebarRef}
          id="sidebar-multi-level-sidebar"
          className={`fixed top-0 left-0 z-40 w-[280px] transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } sm:translate-x-0`}
          aria-label="Sidebar">
          <div className="min-h-screen px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
            <NavigationItem />
          </div>
        </aside>

        <div className="p-8 sm:ml-[280px] h-full dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 min-h-screen pt-24">
          <div className="breadcrumbs text-sm mt-1 mb-10">
            <Breadcrumb />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
            <div className="dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 shadow-lg rounded-lg p-6 flex items-center">
              <FaDollarSign className="text-4xl text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Total Penjualan Asset</h3>
                <p className="text-2xl font-bold">
                  Rp. {totalSales.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 shadow-lg rounded-lg p-6 flex items-center text-neutral-10">
              <FaChartLine className="text-4xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Aset Terjual</h3>
                <p className="text-2xl font-bold">{userAssets.length}</p>
              </div>
            </div>
            <div className="dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 shadow-lg rounded-lg p-6 flex items-center">
              <FaThumbsUp className="text-4xl text-yellow-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Jumlah Anda Disukai</h3>
                <p className="text-2xl font-bold">+{totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 ">
            <h3 className="text-lg font-semibold mb-4 text-neutral-10">
              Daftar Aset Terjual
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Aset
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Asset Terjual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userAssets.map((asset) => (
                    <tr key={asset.docId}>
                      <td className="px-6 py-4 border-b border-gray-200">
                        <img
                          src={
                            asset.image || "https://via.placeholder.com/50"
                          }
                          alt="Preview"
                          className="w-10 h-10 object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {asset.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {asset.category || "N/A"}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        Rp.{" "}
                        {asset.price
                          ? Number(asset.price).toLocaleString()
                          : "0"}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {asset.createdAt ? new Date(asset.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SalesAsset;
