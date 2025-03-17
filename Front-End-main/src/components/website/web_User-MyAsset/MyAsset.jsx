/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { db } from "../../../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HeaderNav from "../../headerNavBreadcrumbs/HeaderWebUser";
import NavbarSection from "../web_User-LandingPage/NavbarSection";
import CustomImage from "../../../assets/assetmanage/Iconrarzip.svg";
import Footer from "../../website/Footer/Footer";
import IconDownload from "../../../assets/icon/iconHeader/iconMyasset.svg";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export function MyAsset() {
  const [AssetsData, setAssetsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedasset, setSelectedasset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Mengambil ID pengguna saat ini (jika ada)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        navigate("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]); // Add navigate to dependencies

  const fetchAssets = async () => {
    const buyAssetsCollection = "buyAssets";
    const myAssetsCollection = "myAssets";

    try {
      const buyAssetsSnapshot = await getDocs(
        query(
          collection(db, buyAssetsCollection),
          where("userId", "==", currentUserId)
        )
      );

      const buyAssetsData = buyAssetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const myAssetsSnapshot = await getDocs(
        query(
          collection(db, myAssetsCollection),
          where("userId", "==", currentUserId)
        )
      );

      const myAssetsData = myAssetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const allFilteredAssets = [...buyAssetsData, ...myAssetsData];
      setAssetsData(allFilteredAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchAssets();
    }
  }, [currentUserId]);

  // Filter pencarian
  useEffect(() => {
    if (searchTerm) {
      const results = AssetsData.filter(
        (asset) =>
          asset.datasetName &&
          asset.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(AssetsData);
    }
  }, [searchTerm, AssetsData]);

  // Menampilkan modal
  const openModal = (asset) => {
    setSelectedasset(asset);
    setModalIsOpen(true);
  };

  // Menutup modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedasset(null);
  };

  const filteredAssetsData = AssetsData.filter((asset) => {
    const datasetName =
      asset.audioName ||
      asset.datasetName ||
      asset.imageName ||
      asset.asset2DName ||
      asset.asset3DName ||
      asset.videoName ||
      asset.name;
    return (
      datasetName &&
      datasetName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const downloadAsset = async (asset) => {
    setIsLoading(true);
    try {
      const allowedSizes = [
        "Large (1920x1280)",
        "Medium (1280x1280)",
        "Small (640x427)",
        "Original (6000x4000)",
        "HD",
        "SD (360x640)",
        "SD (540x960)",
        "HD (720x1280)",
        "Full HD (1080x1920)",
        "Quad HD (1440x2560)",
        "4K UHD (2160x3840)",
      ];

      const fileUrl =
        asset.datasetFile && asset.datasetFile !== "tidak ada"
          ? asset.datasetFile
          : asset.uploadUrlAudio ||
          asset.uploadUrlVideo ||
          asset.uploadUrlImage ||
          asset.asset2DFile ||
          asset.asset3DFile ||
          asset.image;

      console.log("url : ", fileUrl);

      const fileName =
        asset.datasetFile && asset.datasetFile !== "tidak ada"
          ? asset.datasetName || "dataset.zip"
          : asset.audioName ||
          asset.videoName ||
          asset.imageName ||
          asset.asset2DName ||
          asset.asset3DName ||
          asset.datasetName ||
          asset.name ||
          "asset.zip";

      const type = asset.uploadUrlAudio
        ? "audio"
        : asset.uploadUrlVideo
          ? "video"
          : asset.uploadUrlImage || asset.image
            ? "image"
            : asset.datasetFile && asset.datasetFile !== "tidak ada"
              ? "zip"
              : "other";

      if (!fileUrl || !type) {
        alert("File atau tipe tidak tersedia untuk diunduh.");
        return;
      }

      const size =
        asset.size && allowedSizes.includes(asset.size)
          ? asset.size
          : "Medium (1280x1280)";

      const normalizeSize = (size) => {
        const sizeMapping = {
          SD_360x640: "SD (360x640)",
          SD_540x960: "SD (540x960)",
          HD_720x1280: "HD (720x1280)",
          Full_HD_1080x1920: "Full HD (1080x1920)",
          Quad_HD_1440x2560: "Quad HD (1440x2560)",
          "4K_UHD_2160x3840": "4K UHD (2160x3840)",
          Large_1920x1280: "Large (1920x1280)",
          Medium_1280x1280: "Medium (1280x1280)",
          Small_640x427: "Small (640x427)",
          Original_6000x4000: "Original (6000x4000)",
        };

        return sizeMapping[size] || size;
      };

      const normalizedSize = normalizeSize(size);

      if (!allowedSizes.includes(normalizedSize)) {
        alert("Ukuran tidak valid.");
        return;
      }

      const proxyUrl = `http://localhost:3000/proxy/download?fileUrl=${encodeURIComponent(
        fileUrl
      )}&size=${encodeURIComponent(normalizedSize)}&type=${encodeURIComponent(
        type
      )}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gagal mengunduh file. Kode status: ${response.status}. ${errorText}`
        );
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      setIsLoading(false);
    } catch (error) {
      console.error("Error downloading the files:", error);
      alert("Terjadi kesalahan saat mengunduh file. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100 ">
      <div className="w-full shadow-lg bg-primary-100 dark:text-primary-100 relative z-40 ">
        <div className="-mt-10 pt-[2px] sm:pt-[60px] md:pt-[70px] lg:pt-[70px] xl:pt-[70px] 2xl:pt-[70px] w-full">
          <HeaderNav />
        </div>
        <div className="mt-0 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
          <NavbarSection />
        </div>
      </div>

      <div className="absolute ">
        <div className="bg-primary-100 dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 sm:bg-none md:bg-none lg:bg-none xl:bg-none 2xl:bg-none fixed  left-[50%] sm:left-[40%] md:left-[45%] lg:left-[50%] xl:left-[44%] 2xl:left-[50%] transform -translate-x-1/2 z-20 sm:z-40 md:z-40 lg:z-40 xl:z-40 2xl:z-40  flex justify-center top-[253px] sm:top-[20px] md:top-[20px] lg:top-[20px] xl:top-[20px] 2xl:top-[20px] w-full sm:w-[200px] md:w-[200px] lg:w-[100px] xl:w-[600px] 2xl:w-[1000px] -mt-16 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
          <div className="justify-center">
            <form
              className=" mx-auto  w-[570px] sm:w-[200px] md:w-[400px] lg:w-[500px] xl:w-[700px] 2xl:w-[1000px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative">
                <input
                  type="search"
                  id="location-search"
                  className="block w-full p-4 pl-24 placeholder:pr-10 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
                  placeholder="Search assets..."
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute inset-y-0 left-8 flex items-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-6 h-6 mx-auto"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </span>
                <span className="absolute inset-y-0 left-20 flex items-center text-neutral-20 dark:text-neutral-20 text-[20px]">
                  |
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="w-full p-12 mx-auto">
        <h1 className="text-2xl font-semibold text-neutral-10 dark:text-primary-100  pt-[100px] -ml-10">
          My Asset
        </h1>
      </div>
      <div className="pt-2 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 min-h-screen ">
        <div className="mb-4 mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 place-items-center gap-2 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 ">
          {filteredAssetsData.map((data) => {
            let collectionsToFetch = "myAssets";
            if (data.audioName) {
              collectionsToFetch = "myAssets";
            } else if (data.imageName) {
              collectionsToFetch = "myAssets";
            } else if (data.datasetName) {
              collectionsToFetch = "myAssets";
            } else if (data.asset2DName) {
              collectionsToFetch = "myAssets";
            } else if (data.asset3DName) {
              collectionsToFetch = "myAssets";
            } else if (data.videoName) {
              collectionsToFetch = "myAssets";
            } else if (data.name) {
              collectionsToFetch = "buyAssets";
            }

            return (
              <div
                key={data.id}
                className="w-[140px] h-[200px] ssm:w-[165px] ssm:h-[230px] sm:w-[180px] sm:h-[250px] md:w-[180px] md:h-[260px] lg:w-[210px] lg:h-[300px] rounded-[10px] shadow-md bg-primary-100 dark:bg-neutral-25 group flex flex-col justify-between"
              >
                <div
                  onClick={() => openModal(data)}
                  className="w-full h-[300px] relative overflow-hidden aspect-video cursor-pointer z-[10]"
                >
                  <div className="w-full h-[200px] sm:h-[200px] md:h-[200px] lg:h-[250px] xl:h-[300px] 2xl:h-[350px] aspect-[16/9] sm:aspect-[4/3] relative mt-4">
                    {Array.isArray(data.thumbnailGame) &&
                      data.thumbnailGame.length > 0 && (
                        <img
                          src={data.thumbnailGame[0] || CustomImage}
                          alt="Asset Thumbnail"
                          className="h-full w-full object-cover rounded-t-[10px] border-none"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = CustomImage;
                          }}
                        />
                      )}
                    {Array.isArray(data.audioThumbnail) &&
                      data.audioThumbnail.length > 0 && (
                        <img
                          src={data.audioThumbnail[0] || CustomImage}
                          alt="Asset Thumbnail"
                          className="h-full w-full object-cover rounded-t-[10px] border-none"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = CustomImage;
                          }}
                        />
                      )}

                    {data.uploadUrlVideo ? (
                      <video
                        src={data.uploadUrlVideo}
                        alt="Asset Video"
                        className="h-full w-full object-cover rounded-t-[10px] border-none"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : data.video ? (
                      <video
                        src={data.video}
                        alt="Asset Video"
                        className="h-full w-full object-cover rounded-t-[10px] border-none"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : data.image && data.image.includes(".mp4") ? (
                      <video
                        src={data.image}
                        alt="Asset Video"
                        className="h-full w-full object-cover rounded-t-[10px] border-none"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : (
                      <img
                        src={
                          data.datasetThumbnail ||
                          data.asset2DThumbnail ||
                          data.asset3DThumbnail ||
                          data.audioThumbnail ||
                          data.image
                        }
                        alt="Asset Image"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = CustomImage;
                        }}
                        className="h-full w-full object-cover rounded-t-[10px] border-none"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between h-full p-2 sm:p-2">
                  <div onClick={() => openModal(data)} className="px-2 py-2">
                    <p className="text-xs text-neutral-10 font-semibold dark:text-primary-100 ">
                      {(
                        data.audioName ||
                        data.datasetName ||
                        data.asset2DName ||
                        data.asset3DName ||
                        data.imageName ||
                        data.videoName ||
                        data.name ||
                        "Nama Tidak Tersedia"
                      ).slice(0, 14) +
                        ((
                          data.audioName ||
                          data.datasetName ||
                          data.asset2DName ||
                          data.asset3DName ||
                          data.imageName ||
                          data.videoName ||
                          "Nama Tidak Tersedia"
                        ).length > 14
                          ? "..."
                          : "")}
                    </p>

                    <p className="text-neutral-20 text-xs sm:text-sm lg:text-base dark:text-primary-100">
                      {data.description.length > 24
                        ? `${data.description.substring(0, 24)}......`
                        : data.description || "Deskripsi Tidak Tersedia"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal untuk detail asset */}
      {modalIsOpen && selectedasset && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-neutral-10 bg-opacity-50"></div>
          <div className="bg-primary-100 dark:bg-neutral-20 p-6 rounded-lg z-50 w-full sm:w-[400px] md:w-[500px] lg:w-[550px] xl:w-[600px] 2xl:w-[750px] mx-4 flex flex-col relative">
            <button
              className="absolute top-1 right-4 text-gray-600 dark:text-gray-400 text-4xl"
              onClick={closeModal}
            >
              &times;
            </button>

            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full h-[200px] sm:h-[200px] md:h-[200px] lg:h-[250px] xl:h-[300px] 2xl:h-[350px] aspect-[16/9] sm:aspect-[4/3] relative mt-4">
                {Array.isArray(selectedasset.thumbnailGame) &&
                  selectedasset.thumbnailGame[0] ? (
                  <img
                    src={selectedasset.thumbnailGame[0]}
                    alt="Asset Thumbnail"
                    className="h-full w-full object-cover rounded-t-[10px] border-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                  />
                ) : Array.isArray(selectedasset.audioThumbnail) &&
                  selectedasset.audioThumbnail[0] ? (
                  <img
                    src={selectedasset.audioThumbnail[0]}
                    alt="Asset Thumbnail"
                    className="h-full w-full object-cover rounded-t-[10px] border-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                  />
                ) : selectedasset.uploadUrlVideo ? (
                  <video
                    src={selectedasset.uploadUrlVideo}
                    className="h-full w-full object-cover rounded-t-[10px] border-none"
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : selectedasset.image &&
                  selectedasset.image.includes(".mp4") ? (
                  <video
                    src={selectedasset.image}
                    className="h-full w-full object-cover rounded-t-[10px] border-none"
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <img
                    src={
                      selectedasset.uploadUrlImage ||
                      selectedasset.datasetThumbnail ||
                      selectedasset.asset2DThumbnail ||
                      selectedasset.asset3DThumbnail ||
                      selectedasset.Image_umum ||
                      selectedasset.image ||
                      CustomImage
                    }
                    alt="Asset Image"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                    className="w-full h-[300px] relative overflow-hidden aspect-video cursor-pointer z-[10]"
                  />
                )}
              </div>
            </div>
            <div className="w-full mt-4 text-center sm:text-left max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <h2 className="text-lg sm:text-xl text-neutral-10 font-semibold dark:text-primary-100 text-start">
                {selectedasset.datasetName ||
                  selectedasset.name ||
                  selectedasset.asset2DName ||
                  selectedasset.asset3DName ||
                  selectedasset.audioName ||
                  selectedasset.videoName ||
                  selectedasset.imageName}
              </h2>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Kategori: {selectedasset.category}
              </p>
              <div className="text-sm mb-2 dark:text-primary-100  text-start">
                <label className="flex-col mt-2">Deskripsi Asset:</label>
                <div className="mt-2 text-justify">
                  {selectedasset.description}
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadAsset(selectedasset)}
              className="flex p-2 text-center items-center justify-center bg-neutral-60 text-primary-100 w-full h-10 mt-6 rounded-md"
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? (
                <span className="loader"></span> // Add your loading spinner or text here
              ) : (
                <>
                  <img
                    src={IconDownload}
                    alt="Download Icon"
                    className="w-6 h-6 mr-2"
                  />
                  <p>Download</p>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MyAsset;