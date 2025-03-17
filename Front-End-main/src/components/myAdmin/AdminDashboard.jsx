/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import NavigationItem from "../sidebarDashboardAdmin/navigationItemsAdmin";
import Breadcrumb from "../breadcrumbs/Breadcrumbs";
import HeaderSideBar from "../headerNavBreadcrumbs/HeaderSidebar";
import { FaVideo, FaImage, FaDatabase, FaGamepad } from "react-icons/fa";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { useUserContext } from "../../contexts/UserContext";


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { count, collectionName } = payload[0].payload;

    return (
      <div className="bg-white border border-gray-300 rounded shadow-lg p-2">
        <p className="text-gray-700">{`Count: ${count}`}</p>
        <p className="text-gray-700">{`Collection: ${collectionName}`}</p>
      </div>
    );
  }
  return null;
};

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

function AdminDashboard() {
  const { width } = useWindowDimensions();
  const { userRole } = useUserContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assetCounts, setAssetCounts] = useState({
    assetAudios: 0,
    assetImage2D: 0,
    assetImage3D: 0,
    assetDatasets: 0,
    assetImages: 0,
    assetVideos: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [userUid, setUserUid] = useState("");

  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  const fetchAssetCountsFromFirestore = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUserUid(user.uid);
      }

      const collections = [
        { name: "assetVideos", label: "Videos" },
        { name: "assetImages", label: "Images" },
        { name: "assetImage2D", label: "Image2D" },
        { name: "assetImage3D", label: "Image3D" },
        { name: "assetDatasets", label: "Datasets" },
        { name: "assetAudios", label: "Audios" },
      ];

      const counts = {};
      const assetData = [];

      for (const { name, label } of collections) {
        const assetQuery = (userRole === "admin" || userRole === "superadmin")
          ? query(collection(db, name))
          : query(collection(db, name), where("userId", "==", userUid));

        const querySnapshot = await getDocs(assetQuery);
        counts[name] = querySnapshot.size;

        assetData.push({
          collectionName: label,
          count: counts[name],
        });
      }

      setChartData(assetData);
      setAssetCounts(counts);
    } catch (error) {
      console.error("Error fetching asset counts: ", error);
    }
  };

  useEffect(() => {
    fetchAssetCountsFromFirestore();

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, userUid, userRole]);

  const assetIcons = {
    assetAudios: (
      <FaGamepad className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
    assetImage2D: (
      <FaImage className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
    assetImage3D: (
      <FaImage className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
    assetDatasets: (
      <FaDatabase className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
    assetImages: (
      <FaImage className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
    assetVideos: (
      <FaVideo className="text-4xl text-neutral-20 dark:text-primary-100 mb-2" />
    ),
  };

  const assetLabels = {
    assetAudios: "Audios",
    assetImage2D: "Images 2D",
    assetImage3D: "Images 3D",
    assetDatasets: "Datasets",
    assetImages: "Images",
    assetVideos: "Videos",
  };

  const totalAssets = Object.values(assetCounts).reduce(
    (acc, count) => acc + count,
    0
  );

  return (
    <div className="dark:bg-neutral-20 dark:text-primary-100 min-h-screen font-poppins bg-primary-100 p-4 -mx-4 -mt-2">
      <HeaderSideBar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <aside
        ref={sidebarRef}
        id="sidebar-multi-level-sidebar"
        className={`fixed top-0 left-0 z-40 w-[280px] transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="min-h-screen px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
          <NavigationItem />
        </div>
      </aside>

      <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-14 2xl:p-14 h-full bg-primary-100 text-neutral-10 dark:bg-neutral-20 dark:text-neutral-10 min-h-screen pt-24 sm:ml-64 md:ml-72 lg:ml-[248px] xl:ml-[270px] 2xl:ml-[270px] -mt-2 sm:mt-14 md:mt-14 lg:mt-10 xl:mt-8 2xl:mt-10">
        <div className="breadcrumbs text-sm mt-1 mb-6">
          <Breadcrumb />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {Object.keys(assetCounts).map((key) => (
            <div
              key={key}
              className="flex items-center justify-center h-24 sm:h-32 rounded bg-primary-100 dark:bg-neutral-25 shadow-md dark:shadow-neutral-10 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col items-center justify-center text-center h-full p-2">
                {assetIcons[key]}
                <p className="text-base sm:text-md md:text-lg text-neutral-20 dark:text-primary-100">
                  {assetLabels[key]}
                </p>
                <p className="text-[8px] sm:text-[10px] text-neutral-20 dark:text-primary-100">
                  {assetCounts[key]} Total {assetLabels[key]}
                </p>
              </div>
            </div>
          ))}
        </div>


        {/* Tampilan Total Aset */}
        <div className="w-full flex flex-col items-center justify-center" style={{ height: 200 }}>
          <h2 className="text-2xl mb-4 text-neutral-20 dark:text-primary-100">
            Total Aset
          </h2>
          <div className="text-5xl font-bold text-neutral-20 dark:text-primary-100">
            {totalAssets}
          </div>
          <p className="text-sm text-gray-500">Total jumlah aset yang tersedia</p>
        </div>
        <div className="p-10 mt-2 sm:mt-2 md:mt-2 lg:mt-2 xl:mt-2 2xl:mt-2 w-full flex flex-col sm:flex-row gap-20">

          {/* Grafik Aset */}
          <div className="w-full mt-4 sm:mt-0" style={{ height: 400 }}>
            <h2 className="text-2xl mb-4 text-neutral-20 dark:text-primary-100">
              Grafik Aset
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="collectionName" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" fill="#3F83F8" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
