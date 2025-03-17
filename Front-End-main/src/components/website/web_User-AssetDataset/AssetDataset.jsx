/* eslint-disable no-unused-vars */
import { db } from "../../../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  query,
  where,
  runTransaction,
  getDocs,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HeaderNav from "../../headerNavBreadcrumbs/HeaderWebUser";
import NavbarSection from "../web_User-LandingPage/NavbarSection";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import CustomImage from "../../../assets/assetmanage/Iconrarzip.svg";
import IconDollar from "../../../assets/assetWeb/iconDollarLight.svg";
import IconCart from "../../../assets/assetWeb/iconCart.svg";
import { useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Footer from "../../website/Footer/Footer";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export function AssetDataset() {
  const navigate = useNavigate();
  const [AssetsData, setAssetsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedAssets, setLikedAssets] = useState(new Set());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedasset, setSelectedasset] = useState(null);
  const [alertLikes, setAlertLikes] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [purchasedAssets, setPurchasedAssets] = useState(new Set());
  const [validationMessage, setValidationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAndProcessZip = async () => {
    setLoading(true);
    try {
      const firebaseFileUrl = selectedasset.datasetFile;

      const apiBaseUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://pixelstore-be.up.railway.app";
      const proxyUrl = `${apiBaseUrl}/api/proxy-file?url=${encodeURIComponent(
        firebaseFileUrl
      )}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);

      const contents = [];
      const previews = [];
      const images = [];

      // Membuka tab baru di awal untuk menampilkan preview
      const newTab = window.open("", "_blank");
      if (!newTab) {
        throw new Error(
          "Unable to open new tab. Check your browser's popup blocker."
        );
      }
      newTab.document.write("<h1>Preview Dataset Contents</h1>");

      await Promise.all(
        Object.keys(zip.files).map(async (relativePath) => {
          const file = zip.files[relativePath];
          contents.push(relativePath);

          if (!file.dir) {
            const fileData = await file.async("blob");

            // Gambar
            if (
              relativePath.match(/\.(png|jpg|jpeg|gif|bmp)$/i) &&
              images.length < 20
            ) {
              const imageUrl = URL.createObjectURL(fileData);
              images.push({ name: relativePath, url: imageUrl });

              // Tambahkan gambar ke tab baru
              if (!newTab.document.getElementById("image-container")) {
                newTab.document.write(`
                  <div id="image-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;"></div>
                `);
              }

              const imageContainer =
                newTab.document.getElementById("image-container");
              const imageDiv = newTab.document.createElement("div");
              imageDiv.style.textAlign = "center";

              imageDiv.innerHTML = `
                <h3 style="margin-bottom: 10px; font-size: 14px;">${relativePath}</h3>
                <img src="${imageUrl}" alt="${relativePath}" style="max-width: 150px; max-height: 150px; object-fit: cover; margin: 10px;" />
              `;
              imageContainer.appendChild(imageDiv);
            }
            // CSV
            else if (relativePath.endsWith(".csv")) {
              const text = await file.async("text");
              const csvData = Papa.parse(text, { header: true }).data;
              previews.push({ name: relativePath, data: csvData });

              // Tambahkan tabel CSV ke tab baru
              newTab.document.write(`<h3>${relativePath}</h3>`);
              newTab.document.write(
                "<table border='1' style='border-collapse: collapse; width: 100%;'>"
              );

              if (csvData.length > 0) {
                newTab.document.write("<thead><tr>");
                Object.keys(csvData[0])
                  .slice(0, 10)
                  .forEach((key) => newTab.document.write(`<th>${key}</th>`));
                newTab.document.write("</tr></thead>");
              }

              newTab.document.write("<tbody>");
              csvData.slice(0, 10).forEach((row) => {
                newTab.document.write("<tr>");
                Object.values(row)
                  .slice(0, 10)
                  .forEach((value) =>
                    newTab.document.write(`<td>${value}</td>`)
                  );
                newTab.document.write("</tr>");
              });
              newTab.document.write("</tbody></table>");
            }
            // XLSX
            else if (relativePath.endsWith(".xlsx")) {
              const arrayBuffer = await file.async("arraybuffer");
              const workbook = XLSX.read(arrayBuffer, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheetData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheetName]
              );
              previews.push({ name: relativePath, data: sheetData });

              // Tambahkan tabel XLSX ke tab baru
              newTab.document.write(`<h3>${relativePath}</h3>`);
              newTab.document.write(
                "<table border='1' style='border-collapse: collapse; width: 100%;'>"
              );

              if (sheetData.length > 0) {
                newTab.document.write("<thead><tr>");
                Object.keys(sheetData[0])
                  .slice(0, 10)
                  .forEach((key) => newTab.document.write(`<th>${key}</th>`));
                newTab.document.write("</tr></thead>");
              }

              newTab.document.write("<tbody>");
              sheetData.slice(0, 10).forEach((row) => {
                newTab.document.write("<tr>");
                Object.values(row)
                  .slice(0, 10)
                  .forEach((value) =>
                    newTab.document.write(`<td>${value}</td>`)
                  );
                newTab.document.write("</tr>");
              });
              newTab.document.write("</tbody></table>");
            }
          }
        })
      );
    } catch (error) {
      console.error("Error fetching or processing ZIP:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mengambil ID pengguna saat ini (jika ada)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    // Bersihkan listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

  // Mengambil data asset dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "assetDatasets"),
      async (snapshot) => {
        const Assets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter asset dengan harga tidak terdefinisi atau nol
        const filteredAssets = Assets.filter(
          (asset) => asset.price !== undefined && asset.price !== 0
        );
        setAssetsData(filteredAssets);
      }
    );

    return () => unsubscribe();
  }, []);

  // Menangani pengambilan aset yang telah dibeli
  useEffect(() => {
    const fetchUserPurchasedAssets = async () => {
      if (!currentUserId) return;

      const purchasedQuery = query(
        collection(db, "buyAssets"),
        where("userId", "==", currentUserId)
      );

      try {
        const purchasedSnapshot = await getDocs(purchasedQuery);
        const purchasedIds = new Set();

        purchasedSnapshot.forEach((doc) => {
          // Menambahkan assetId dari dokumen ke dalam Set
          purchasedIds.add(doc.data().assetId);
        });

        // Mengupdate state dengan assetId yang dibeli
        setPurchasedAssets(purchasedIds);
      } catch (error) {
        console.error("Error fetching purchased assets: ", error);
      }
    };

    fetchUserPurchasedAssets();
  }, [currentUserId]);

  useEffect(() => {
    const results = AssetsData.filter((asset) =>
      asset.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, AssetsData]);

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!currentUserId) return;

      // Membuat query untuk mendapatkan dokumen berdasarkan userId
      const likesQuery = query(
        collection(db, "likes"),
        where("userId", "==", currentUserId)
      );

      try {
        const likesSnapshot = await getDocs(likesQuery);
        const userLikes = new Set();

        // Menambahkan assetId ke dalam set likedAssets
        likesSnapshot.forEach((doc) => {
          userLikes.add(doc.data().assetId);
        });

        setLikedAssets(userLikes);
      } catch (error) {
        // console.error("Error fetching likes: ", error);
      }
    };

    fetchUserLikes();
  }, [currentUserId]);

  const handleLikeClick = async (assetId, currentLikes) => {
    if (isProcessingLike) return;

    if (!currentUserId) {
      setAlertLikes("Anda perlu login untuk menyukai Asset ini");
      setTimeout(() => {
        setAlertLikes(false);
      }, 3000);
      return;
    }

    // Tandai bahwa kita sedang memproses
    setIsProcessingLike(true);

    const assetRef = doc(db, "assetDatasets", assetId);
    const likeRef = doc(db, "likes", `${currentUserId}_${assetId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const newLikedAssets = new Set(likedAssets);
        let newLikesAsset;
        if (newLikedAssets.has(assetId)) {
          // Untuk Hapus like
          transaction.delete(likeRef);
          newLikesAsset = Math.max(0, currentLikes - 1);
          transaction.update(assetRef, { likeAsset: newLikesAsset });
          newLikedAssets.delete(assetId);
        } else {
          // Untuk Tambah like
          transaction.set(likeRef, {
            userId: currentUserId,
            assetId: assetId,
          });
          newLikesAsset = currentLikes + 1;
          transaction.update(assetRef, { likeAsset: newLikesAsset });
          newLikedAssets.add(assetId);
        }

        // Update state setelah transaksi sukses
        setLikedAssets(newLikedAssets);
      });
    } catch (error) {
      // console.error("Error updating likes: ", error);
    } finally {
      // Selesaikan proses
      setIsProcessingLike(false);
    }
  };

  // Fungsi untuk memvalidasi apakah pengguna dapat menambahkan aset ke keranjang
  const validateAddToCart = (assetId) => {
    if (!currentUserId) {
      setValidationMessage(
        "Anda perlu login untuk menambahkan asset ke keranjang."
      );
      return false;
    }
    if (purchasedAssets.has(assetId)) {
      setValidationMessage(
        "Anda sudah membeli asset ini dan tidak bisa menambahkannya ke keranjang."
      );
      return false;
    }
    return true;
  };

  // Fungsi untuk menambahkan aset ke keranjang
  const handleAddToCart = async (selectedasset) => {
    if (!validateAddToCart(selectedasset.id)) return;

    // Cek apakah userId penjual sama dengan currentUserId
    if (selectedasset.userId === currentUserId) {
      alert("Anda tidak dapat membeli aset yang Anda jual sendiri.");
      return;
    }

    // Ambil userId dari selectedasset dan simpan dalam array
    const userIdFromAsset = [selectedasset.userId];
    console.log("User ID from Asset: ", userIdFromAsset);

    // Membuat referensi dokumen untuk keranjang menggunakan ID aset
    const cartRef = doc(db, "cartAssets", `${selectedasset.id}`);

    try {
      const cartSnapshot = await getDoc(cartRef);

      if (cartSnapshot.exists()) {
        setValidationMessage("Anda sudah menambahkan asset ini ke keranjang.");
        return;
      }

      // Menambahkan aset ke keranjang, termasuk userId dari selectedasset
      await setDoc(cartRef, {
        userId: currentUserId,
        assetId: selectedasset.id,
        datasetFile: selectedasset.datasetFile,
        datasetThumbnail: selectedasset.datasetThumbnail,
        name: selectedasset.datasetName,
        description: selectedasset.description,
        price: selectedasset.price,
        category: selectedasset.category,
        assetOwnerID: userIdFromAsset[0],
      });
      alert("Asset berhasil ditambahkan ke keranjang!");
    } catch (error) {
      console.error("Error adding to cart: ", error);
      alert("Terjadi kesalahan saat menambahkan aset ke keranjang.");
    }
  };

  // Fungsi untuk menangani pembelian aset
  const handleBuyNow = async (selectedasset) => {
    if (!currentUserId) {
      alert("Anda perlu login untuk menambahkan asset ke keranjang");
      navigate("/login");
      return;
    }

    // Cek apakah userId penjual sama dengan currentUserId
    if (selectedasset.userId === currentUserId) {
      alert("Anda tidak dapat membeli aset yang Anda jual sendiri.");
      return;
    }

    if (purchasedAssets.has(selectedasset.id)) {
      alert(
        "Anda sudah membeli asset ini dan tidak bisa menambahkannya ke keranjang."
      );
      return;
    }

    // Document ID sekarang mengikuti asset ID
    const cartRef = doc(db, "buyNow", ` ${selectedasset.id}`);
    const cartSnapshot = await getDoc(cartRef);
    if (cartSnapshot.exists()) {
      // alert("Anda sudah Membeli Asset ini.");
      return;
    }

    const {
      id,
      datasetName,
      description,
      price,
      datasetFile,
      datasetThumbnail,
      category,
    } = selectedasset;

    const missingFields = [];
    if (!datasetName) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined) missingFields.push("price");
    if (!datasetFile) missingFields.push("datasetFile");
    if (!datasetThumbnail) missingFields.push("datasetThumbnail");
    if (!category) missingFields.push("category");

    if (missingFields.length > 0) {
      alert(`Missing fields: ${missingFields.join(", ")}. Please try again.`);
      return;
    }

    try {
      await setDoc(cartRef, {
        userId: currentUserId,
        assetId: id,
        name: datasetName,
        description: description,
        price: price,
        datasetFile: datasetFile,
        datasetThumbnail: datasetThumbnail,
        category: category,
        assetOwnerID: selectedasset.userId,
      });

      navigate("/buy-now-asset");
    } catch (error) {
      console.error("Error adding to cart: ", error);
      alert(
        "Terjadi kesalahan saat menambahkan asset ke keranjang. Silakan coba lagi."
      );
    }
  };

  // Function to validate asset fields
  const validateAssetFields = ({
    datasetName,
    description,
    price,
    datasetFile,
    datasetThumbnail,
    category,
  }) => {
    const missingFields = [];
    if (!datasetName) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined) missingFields.push("price");
    if (!datasetFile) missingFields.push("datasetFile");
    if (!datasetThumbnail) missingFields.push("datasetThumbnail");
    if (!category) missingFields.push("category");
    return missingFields;
  };

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

  // Filter berdasarkan pencarian
  const filteredAssetsData = AssetsData.filter((asset) =>
    asset.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndexModal, setCurrentIndexModal] = useState(0);

  const handlePrevious = () => {
    if (currentIndexModal > 0) {
      setCurrentIndexModal(currentIndexModal - 1);
    }
  };

  const handleNext = () => {
    if (
      selectedasset.datasetThumbnail &&
      currentIndexModal < selectedasset.datasetThumbnail.length - 1
    ) {
      setCurrentIndexModal(currentIndexModal + 1);
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


      {/* Menampilkan pesan validasi jika ada */}
      {validationMessage && (
        <div className="alert flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md animate-fade-in">
          <AiOutlineInfoCircle className="w-6 h-6 mr-2" />
          <span className="block sm:inline">{validationMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setValidationMessage("")}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M14.348 14.849a1 1 0 01-1.415 0L10 11.414 6.707 14.707a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414L10 8.586l3.293-3.293a1 1 0 011.414 1.414L11.414 10l3.293 3.293a1 1 0 010 1.415z" />
            </svg>
          </button>
        </div>
      )}

      <div className="w-full p-12 mx-auto">
        {alertLikes && (
          <div className="alert flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md animate-fade-in">
            <AiOutlineInfoCircle className="w-6 h-6 mr-2" />
            <span className="block sm:inline">{alertLikes}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setAlertLikes(false)}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M14.348 14.849a1 1 0 01-1.415 0L10 11.414 6.707 14.707a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414L10 8.586l3.293-3.293a1 1 0 011.414 1.414L11.414 10l3.293 3.293a1 1 0 010 1.415z" />
              </svg>
            </button>
          </div>
        )}
        <h1 className="text-2xl font-semibold text-neutral-10 dark:text-primary-100  pt-[100px] -ml-10">
          All Category
        </h1>
      </div>
      <div className="pt-2 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 min-h-screen -mt-6 ">
        <div className="mb-4 mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 ">
          {filteredAssetsData.map((data) => {
            const likesAsset = data.likeAsset || 0;
            const likedByCurrentUser = likedAssets.has(data.id);
            const isPurchased = purchasedAssets.has(data.id);

            const handlePrevious = () => {
              setCurrentIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
              );
            };

            const handleNext = () => {
              setCurrentIndex((prevIndex) =>
                prevIndex < data.datasetThumbnail.length - 1
                  ? prevIndex + 1
                  : prevIndex
              );
            };

            return (
              <div
                key={data.id}
                className="w-[140px] h-[200px] ssm:w-[165px] ssm:h-[230px] sm:w-[180px] sm:h-[250px] md:w-[180px] md:h-[260px] lg:w-[210px] lg:h-[300px] rounded-[10px] shadow-md bg-primary-100 dark:bg-neutral-25 group flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
              >
                <div className="w-full h-[300px] relative overflow-hidden aspect-video cursor-pointer z-[10]">
                  {Array.isArray(data.datasetThumbnail) &&
                    data.datasetThumbnail.length > 0 ? (
                    <img
                      src={data.datasetThumbnail[currentIndex] || CustomImage}
                      alt={`Thumbnail ${currentIndex + 1}`}
                      className="h-full w-full object-cover rounded-t-[10px] border-none"
                      onClick={() => openModal(data)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CustomImage;
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  ) : (
                    <img
                      src={data.datasetThumbnail || CustomImage}
                      alt="Default Image"
                      className="h-full w-full object-cover rounded-t-[10px] border-none"
                      onClick={() => openModal(data)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CustomImage;
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  )}

                  {isPurchased && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      Sudah Dibeli
                    </div>
                  )}

                  {/* Navigasi Carousel */}
                  {Array.isArray(data.datasetThumbnail) &&
                    data.datasetThumbnail.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevious}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-transparent text-[25px]  text-white rounded-full p-2"
                        >
                          &#8592;
                        </button>
                        <button
                          onClick={handleNext}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent text-[25px] text-white rounded-full p-2"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                </div>

                {/* details section */}
                <div className="flex flex-col justify-between h-full p-2 sm:p-4">
                  <div>
                    <p className="text-xs text-neutral-10 font-semibold dark:text-primary-100">
                      {data.datasetName.length > 14
                        ? `${data.datasetName.substring(0, 14)}...`
                        : data.datasetName}
                    </p>

                    <h4 className="text-neutral-20 text-xs sm:text-sm lg:text-base dark:text-primary-100">
                      {data.description.length > 24
                        ? `${data.description.substring(0, 24)}......`
                        : data.description}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center mt-auto gap-2">
                    <button
                      onClick={() => handleLikeClick(data.id, likesAsset)}
                      className="flex justify-start items-center mr-2"
                    >
                      {likedByCurrentUser ? (
                        <FaHeart className="text-red-600" />
                      ) : (
                        <FaRegHeart className="text-neutral-10 text-[11px] sm:text-[14px] dark:text-primary-100 " />
                      )}
                      <p className="ml-2 text-[8px] sm:text-[11px] md:text-[11px] lg:text-[15px]">
                        ({likesAsset})
                      </p>
                    </button>
                    <p className="text-[8px] sm:text-[11px] md:text-[11px] lg:text-[15px]">
                      {data.price % 1000 === 0 && data.price >= 1000
                        ? `Rp. ${(data.price / 1000).toLocaleString("id-ID")}k`
                        : `Rp. ${data.price.toLocaleString("id-ID")}`}
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
        <div className="fixed inset-0 flex items-center justify-center z-50  ">
          <div className="fixed inset-0 bg-neutral-10 bg-opacity-50"></div>
          <div className="bg-primary-100 dark:bg-neutral-20 p-6 rounded-lg z-50 w-[90%] sm:w-[400px] md:w-[500px] lg:w-[550px] xl:w-[600px] 2xl:w-[750px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[700px] max-w-3xl mx-auto flex flex-col relative">
            <button
              className="absolute top-1 right-4 z-50 text-gray-600 dark:text-gray-400 text-4xl"
              onClick={closeModal}>
              &times;
            </button>

            <div
              onClick={() => openModal(selectedasset)}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="w-full h-[200px] sm:h-[200px] md:h-[200px] lg:h-[250px] xl:h-[300px] 2xl:h-[350px] aspect-[16/9] sm:aspect-[4/3] relative mt-4">
                <img
                  src={
                    Array.isArray(selectedasset.datasetThumbnail) &&
                      selectedasset.datasetThumbnail.length > 0
                      ? selectedasset.datasetThumbnail[currentIndexModal]
                      : selectedasset.datasetThumbnail ||
                      selectedasset.datasetFile ||
                      CustomImage
                  }
                  alt="Asset Dataset"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = CustomImage;
                  }}
                />

                {/* Carousel Navigation */}
                {Array.isArray(selectedasset.datasetThumbnail) &&
                  selectedasset.datasetThumbnail.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-transparent text-white text-[40px] rounded-full p-2"
                      >
                        &#8592;
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent text-white text-[40px] rounded-full p-2"
                      >
                        &#8594;
                      </button>
                    </>
                  )}
              </div>
            </div>
            <div className="p-1 pt-2 flex flex-col items-center justify-center">
              <button
                onClick={fetchAndProcessZip}
                disabled={loading}
                className={`px-6 py-2 text-white font-semibold rounded-lg 
                  ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                  } 
                  transition duration-200 ease-in-out`}
              >
                {loading ? "Loading..." : "Load Preview"}
              </button>
            </div>
            <div className="w-full text-center sm:text-left max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <h2 className="text-lg font-semibold mb-2 dark:text-primary-100 text-start">
                {selectedasset.datasetName}
              </h2>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Kategori: {selectedasset.category}
              </p>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Rp. {selectedasset.price.toLocaleString("id-ID")}
              </p>
              <div className="text-sm -mb-20 dark:text-primary-100 mt-4 text-start">
                <label className="flex-col mt-2 ">Deskripsi dataset:</label>
                <div className="mt-2 text-justify">
                  {selectedasset.description}
                </div>
              </div>

              <div className="mt-28">
                <button
                  onClick={() => handleAddToCart(selectedasset)}
                  className={`flex p-2 text-center items-center justify-center bg-neutral-60 w-full h-10 rounded-md ${purchasedAssets.has(selectedasset.id)
                    ? "bg-gray-400 pointer-events-none"
                    : "bg-neutral-60"
                    }`}
                  disabled={purchasedAssets.has(selectedasset.id)}
                >
                  <img
                    src={IconCart}
                    alt="Cart Icon"
                    className="w-6 h-6 mr-2"
                  />
                  <p>Tambahkan Ke Keranjang</p>
                </button>
                <button
                  onClick={() => handleBuyNow(selectedasset)}
                  className={`flex p-2 text-center items-center justify-center bg-neutral-60 w-full h-10 mt-2 rounded-md ${purchasedAssets.has(selectedasset.id)
                    ? "bg-gray-400 pointer-events-none"
                    : "bg-secondary-40"
                    }`}
                  disabled={purchasedAssets.has(selectedasset.id)}
                >
                  <img
                    src={IconDollar}
                    alt="Cart Icon"
                    className="w-6 h-6 mr-2 -ml-24"
                  />
                  <p>Beli Sekarang</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mt-10 flex items-center justify-center">
        <div className="text-center">
          {searchResults.length === 0 && searchTerm && (
            <p className="text-black text-[20px]">No assets found</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}