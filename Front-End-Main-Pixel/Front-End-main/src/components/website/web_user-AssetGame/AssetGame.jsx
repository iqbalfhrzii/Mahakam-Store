/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { db } from "../../../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  runTransaction,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HeaderNav from "../../headerNavBreadcrumbs/HeaderWebUser";
import NavbarSection from "../web_User-LandingPage/NavbarSection";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import CustomImage from "../../../assets/assetmanage/Iconrarzip.svg";
import IconDownload from "../../../assets/icon/iconDownload/iconDownload.svg";

import IconDollar from "../../../assets/assetWeb/iconDollarLight.svg";
import IconCart from "../../../assets/assetWeb/iconCart.svg";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../website/Footer/Footer";

const DropdownMenu = ({ onCategorySelect }) => {
  const [isHovered, setIsHovered] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownItems = {
    "All Category": [{ name: "See all" }],
    "3D": [
      { name: "Animations" },
      { name: "3D Character" },
      { name: "3D Environment" },
      { name: "3D GUI" },
      { name: "Props" },
      { name: "Vegetation" },
      { name: "Vehicle" },
    ],
    "2D": [
      { name: "Characters" },
      { name: "Environment" },
      { name: "Fonts" },
      { name: "GUI" },
      { name: "Textures & Materials" },
    ],
    Audio: [
      { name: "Audio Effects" },
      { name: "Background Music" },
      { name: "Voice Overs" },
      { name: "Sound Design" },
    ],
  };

  const handleClick = (category, subCategory) => {
    onCategorySelect(category, subCategory);
  };

  return (
    <div className="absolute px-0 sm:px-4 py-6 mt-[125px] min-w-full ">
      <div className="sm:hidden w-full ">
        <button
          className="w-full bg-neutral-90 text-neutral-20 py-2 rounded-md flex justify-between items-center p-4"
          onClick={() => setIsOpen(!isOpen)}>
          Tampil berdasarkan Category
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-2 bg-neutral-90 text-neutral-20 rounded-md shadow-lg ">
            {Object.keys(dropdownItems).map((category) => (
              <div key={category} className="p-4">
                <h4 className="font-bold">{category}</h4>
                {dropdownItems[category].map(({ name }) => (
                  <button
                    key={name}
                    className="block py-2 hover:bg-secondary-40 hover:text-primary-100 w-full text-left transition duration-200 "
                    onClick={() => handleClick(category, name)}>
                    {name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden sm:flex space-x-6 relative">
        {Object.keys(dropdownItems).map((category) => (
          <div
            key={category}
            className="relative inline-block group"
            onMouseEnter={() => setIsHovered(category)}
            onMouseLeave={() => setIsHovered(null)}>
            <button
              className="px-4 py-2 text-neutral-20 bg-neutral-90 rounded-md transition duration-300 ease-in-out"
              aria-haspopup="true"
              aria-expanded={isHovered === category}>
              {category}
            </button>

            {isHovered === category && (
              <div
                className="absolute left-0 z-20 w-64 mt-0.5 bg-neutral-90 rounded-md shadow-lg"
                onMouseEnter={() => setIsHovered(category)}
                onMouseLeave={() => setIsHovered(null)}>
                <div className="p-4 text-neutral-20">
                  <h4 className="font-bold mb-1">{category}</h4>
                  {dropdownItems[category].map(({ name }) => (
                    <button
                      key={name}
                      className="block py-2 p-2  hover:bg-secondary-40 hover:text-primary-100 transition  rounded-md duration-200 w-full text-left"
                      onClick={() => handleClick(category, name)}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function AssetGame() {
  const [AssetsData, setAssetsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedAssets, setLikedAssets] = useState(new Set());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedasset, setselectedasset] = useState(null);
  const [alertLikes, setAlertLikes] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [purchasedAssets, setPurchasedAssets] = useState(new Set());
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [fetchMessage, setFetchMessage] = useState("");
  const navigate = useNavigate();

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

  const fetchAssets = async (selectedSubCategory) => {
    const collectionsFetch = ["assetAudios", "assetImage2D", "assetImage3D"];

    try {
      const promises = collectionsFetch.map((collectionName) => {
        let q;

        if (selectedSubCategory && selectedSubCategory != "See all") {
          q = query(
            collection(db, collectionName),
            where("category", "==", selectedSubCategory)
          );
        } else {
          q = collection(db, collectionName);
        }
        return getDocs(q);
      });

      const results = await Promise.allSettled(promises);

      const successfulSnapshots = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const allAssets = successfulSnapshots.reduce((accumulator, snapshot) => {
        const docsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return [...accumulator, ...docsData];
      }, []);

      const filteredAssets = allAssets
        .flat()
        .filter((asset) => asset.price > 0);

      filteredAssets.sort((a, b) => (b.likeAsset || 0) - (a.likeAsset || 0));

      if (filteredAssets.length === 0) {
        setFetchMessage("Asset Tidak Tersedia!");
      } else {
        setFetchMessage("");
      }

      setAssetsData(filteredAssets);
    } catch (error) {
      console.error("Error fetching assets: ", error);
    }
  };

  useEffect(() => {
    fetchAssets(selectedSubCategory);
  }, [selectedSubCategory]);

  // Filter pencarian
  useEffect(() => {
    if (searchTerm) {
      const results = AssetsData.filter(
        (asset) =>
          asset.audioName &&
          asset.audioName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(AssetsData);
    }
  }, [searchTerm, AssetsData]);

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!currentUserId) return;
      const likesQuery = query(
        collection(db, "likes"),
        where("userId", "==", currentUserId)
      );

      try {
        const likesSnapshot = await getDocs(likesQuery);
        const userLikes = new Set();

        likesSnapshot.forEach((doc) => {
          userLikes.add(doc.data().id);
        });

        setLikedAssets(userLikes);
      } catch (error) {
        // console.error("Error fetching likes: ", error);
      }
    };

    fetchUserLikes();
  }, [currentUserId]);

  const handleLikeClick = async (id, currentLikes, collectionsToFetch) => {
    if (isProcessingLike) return;

    if (!currentUserId) {
      setAlertLikes("Login untuk menyukai Asset ini");
      setTimeout(() => {
        setAlertLikes(false);
      }, 3000);
      return;
    }

    // Tandai bahwa kita sedang memproses
    setIsProcessingLike(true);

    const assetRef = doc(db, collectionsToFetch, id);
    const likeRef = doc(db, "likes", `${currentUserId}_${id}`);

    try {
      await runTransaction(db, async (transaction) => {
        const newLikedAssets = new Set(likedAssets);
        let newLikesAsset;
        if (newLikedAssets.has(id)) {
          // Untuk Hapus like
          transaction.delete(likeRef);
          newLikesAsset = Math.max(0, currentLikes - 1);
          transaction.update(assetRef, { likeAsset: newLikesAsset });
          newLikedAssets.delete(id);
        } else {
          // Untuk Tambah like
          transaction.set(likeRef, {
            userId: currentUserId,
            id: id,
            collectionsToFetch: collectionsToFetch,
          });
          newLikesAsset = currentLikes + 1;
          transaction.update(assetRef, { likeAsset: newLikesAsset });
          newLikedAssets.add(id);
        }

        // Update state setelah transaksi sukses
        setLikedAssets(newLikedAssets);
      });
      await fetchAssets();
    } catch (error) {
      // console.error("Error updating likes: ", error);
    } finally {
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
        thumbnailGame:
          selectedasset.audioThumbnail ||
          selectedasset.asset2DThumbnail ||
          selectedasset.asset3DThumbnail ||
          "No Thumbnail Asset",
        image:
          selectedasset.asset2DFile ||
          selectedasset.asset3DFile ||
          selectedasset.uploadUrlAudio ||
          "No Image Asset",
        name:
          selectedasset.audioName ||
          selectedasset.asset2DName ||
          selectedasset.asset3DName ||
          "No Name Asset",
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

    const cartRef = doc(db, "buyNow", selectedasset.id.trim());

    const cartSnapshot = await getDoc(cartRef);
    if (cartSnapshot.exists()) {
      return;
    }

    const {
      audioName,
      asset2DName,
      asset3DName,
      asset2DFile,
      asset3DFile,
      uploadUrlAudio,
      audioThumbnail,
      asset2DThumbnail,
      asset3DThumbnail,
      category,
      description,
      price,
    } = selectedasset;

    const missingFields = validateAssetFields({
      asset2DFile,
      asset3DFile,
      uploadUrlAudio,
      audioName,
      asset2DName,
      asset3DName,
      description,
      price,
      category,
    });

    if (missingFields.length > 0) {
      alert(`Missing fields: ${missingFields.join(", ")}. Please try again.`);
      return;
    }

    try {
      await setDoc(cartRef, {
        userId: currentUserId,
        assetId: selectedasset.id,
        thumbnailGame:
          audioThumbnail ||
          asset2DThumbnail ||
          asset3DThumbnail ||
          "No Thumbnail Asset",
        image: asset2DFile || asset3DFile || uploadUrlAudio || "No Image Asset",
        name: audioName || asset2DName || asset3DName || "No Name Asset",
        description: selectedasset.description,
        price: selectedasset.price,
        category: selectedasset.category,
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
    asset2DFile,
    asset3DFile,
    uploadUrlAudio,
    audioName,
    asset2DName,
    asset3DName,
    description,
    price,
    category,
  }) => {
    const missingFields = [];
    if (!asset2DFile && !asset3DFile && !uploadUrlAudio)
      missingFields.push("image");
    if (!audioName && !asset2DName && !asset3DName) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined) missingFields.push("price");
    if (!category) missingFields.push("category");
    return missingFields;
  };

  // Menampilkan modal
  const openModal = (asset) => {
    setselectedasset(asset);
    setModalIsOpen(true);
  };

  // Menutup modal
  const closeModal = () => {
    setModalIsOpen(false);
    setselectedasset(null);
  };

  // Filter berdasarkan pencarian
  const filteredAssetsData = AssetsData.filter((asset) => {
    const audioName =
      asset.name ||
      asset.audioName ||
      asset.asset2DName ||
      asset.asset3DName ||
      "";
    return (
      audioName && audioName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const [currentIndexModal, setCurrentIndexModal] = useState(0);

  const handlePrevious = () => {
    setCurrentIndexModal((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const handleNext = () => {
    setCurrentIndexModal((prevIndex) => {
      if (
        (selectedasset.asset2DThumbnail && prevIndex < selectedasset.asset2DThumbnail.length - 1) ||
        (selectedasset.asset3DThumbnail && prevIndex < selectedasset.asset3DThumbnail.length - 1) ||
        (selectedasset.audioThumbnail && prevIndex < selectedasset.audioThumbnail.length - 1)
      ) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };


  return (
    <div className="dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100 ">
      <div className="w-full bg-primary-100 dark:text-primary-100 relative z-40 ">
        <div className="-mt-10 pt-[2px] sm:pt-[60px] md:pt-[70px] lg:pt-[70px] xl:pt-[70px] 2xl:pt-[70px] w-full">
          <HeaderNav />
        </div>
        <div className="mt-0 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10 z-50">
          <NavbarSection />
        </div>
        <div className="pt-[0px] relative -z-40 ">
          <DropdownMenu
            onCategorySelect={(category, subCategory) => {
              setSelectedSubCategory(subCategory);
            }}
          />
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
            onClick={() => setValidationMessage("")}>
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path d="M14.348 14.849a1 1 0 01-1.415 0L10 11.414 6.707 14.707a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414L10 8.586l3.293-3.293a1 1 0 011.414 1.414L11.414 10l3.293 3.293a1 1 0 010 1.415z" />
            </svg>
          </button>
        </div>
      )}

      <div className="w-full p-6 mx-auto">
        {/* validasi like button */}
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 w-full max-w-md p-4 z-50">
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
        </div>

        <div className="relative mt-56 flex items-center justify-center">
          <div className="text-center">
            {searchResults.length === 0 && searchTerm && (
              <p className="text-black text-[20px]">No assets found</p>
            )}
          </div>
        </div>

      </div>
      <div className="pt-2  w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 min-h-screen -mt-20 lg:-mt-16 ">
        <div className="mb-4 mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 place-items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 ">
          {fetchMessage && <p>{fetchMessage}</p>}
          {filteredAssetsData.map((data) => {
            const likesAsset = data.likeAsset || 0;
            const likedByCurrentUser = likedAssets.has(data.id);
            const isPurchased = purchasedAssets.has(data.id);
            let collectionsToFetch = "";
            if (data.audioName) {
              collectionsToFetch = "assetAudios";
            } else if (data.asset2DName) {
              collectionsToFetch = "assetImage2D";
            } else if (data.asset3DName) {
              collectionsToFetch = "assetImage3D";
            }

            const thumbnails = data.thumbnails || [];

            return (
              <div
                key={data.id}
                className="w-[140px] h-[200px] ssm:w-[165px] ssm:h-[230px] sm:w-[180px] sm:h-[250px] md:w-[180px] md:h-[260px] lg:w-[210px] lg:h-[300px] rounded-[10px] shadow-md bg-primary-100 dark:bg-neutral-25 group flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <div
                  onClick={() => openModal(data)}
                  className="w-full h-[300px] relative overflow-hidden aspect-video cursor-pointer z-[10]">
                  <div className="w-full h-[150px] relative">
                    {Array.isArray(data.audioThumbnails) &&
                      data.audioThumbnails.length > 0 ? (
                      <div className="flex space-x-2 overflow-x-auto">
                        {data.audioThumbnails.map((thumbnailUrl, index) => (
                          <img
                            key={index}
                            src={thumbnailUrl}
                            alt={`Audio Thumbnail ${index + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = CustomImage;
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className="h-full w-auto object-cover rounded-t-[10px] border-none"
                          />

                        ))}
                      </div>
                    ) : (
                      <img
                        src={
                          data.audioThumbnail ||
                          data.uploadUrlAudio ||
                          data.asset2DImage ||
                          data.asset3DImage ||
                          (data.assetAudiosImage ? CustomImage : null) ||
                          data.asset2DThumbnail ||
                          data.asset3DThumbnail ||
                          CustomImage
                        }
                        alt="Asset Image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = CustomImage;
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="h-full w-full object-fill rounded-t-[10px] border-none"
                      />
                    )}
                    {isPurchased && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Sudah Dibeli
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between h-full p-2 sm:p-4">
                  <div className="px-2 py-2">
                    <p className="text-xs text-neutral-10 font-semibold dark:text-primary-100">
                      {(
                        data.audioName ||
                        data.asset2DName ||
                        data.asset3DName ||
                        "Nama Tidak Tersedia"
                      ).length > 14
                        ? (
                          data.audioName ||
                          data.asset2DName ||
                          data.asset3DName ||
                          "Nama Tidak Tersedia"
                        ).substring(0, 14) + "..."
                        : data.audioName ||
                        data.asset2DName ||
                        data.asset3DName ||
                        "Nama Tidak Tersedia"}
                    </p>

                    <h4 className="text-neutral-20 text-xs sm:text-sm lg:text-base dark:text-primary-100">
                      {data.description.length > 24
                        ? `${data.description.substring(0, 24)}......`
                        : data.description}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center mt-2 sm:mt-4">
                    <button
                      onClick={() => handleLikeClick(data.id, likesAsset)}
                      className="flex items-center">
                      {likedByCurrentUser ? (
                        <FaHeart className="text-red-600" />
                      ) : (
                        <FaRegHeart className="text-neutral-10 text-xs sm:text-sm" />
                      )}
                      <p className="ml-1 text-xs sm:text-sm">({likesAsset})</p>
                    </button>
                    <p className="text-xs sm:text-sm lg:text-base">
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

      {modalIsOpen && selectedasset && (
        <div className="fixed inset-0 flex items-center justify-center z-50  ">
          <div className="fixed inset-0 bg-neutral-10 bg-opacity-50"></div>
          <div className="bg-primary-100 dark:bg-neutral-20 p-6 rounded-lg z-50 w-[90%] sm:w-[400px] md:w-[500px] lg:w-[550px] xl:w-[600px] 2xl:w-[750px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[750px] max-w-3xl mx-auto flex flex-col relative">
            <button
              className="absolute top-1 right-4 z-50 text-gray-600 dark:text-gray-400 text-4xl"
              onClick={closeModal}>
              &times;
            </button>

            <div
              onClick={() => openModal(selectedasset)}
              className="flex flex-col items-center justify-center w-full">
              <div className="w-full h-auto max-h-[300px] relative overflow-hidden rounded-md flex items-center justify-center">
                {Array.isArray(selectedasset.asset2DThumbnail) && selectedasset.asset2DThumbnail.length > 0 ? (
                  <img
                    src={
                      selectedasset.asset2DThumbnail[currentIndexModal] ||
                      selectedasset.asset2DFile ||
                      CustomImage
                    }
                    alt={`Thumbnail ${currentIndexModal + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full max-h-[400px] w-full p-8 max-w-[400px object-fill rounded-t-[10px] border-none"
                  />
                ) : Array.isArray(selectedasset.asset3DThumbnail) && selectedasset.asset3DThumbnail.length > 0 ? (
                  <img
                    src={
                      selectedasset.asset3DThumbnail[currentIndexModal] ||
                      selectedasset.asset3DFile ||
                      CustomImage
                    }
                    alt={`Thumbnail ${currentIndexModal + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full max-h-[400px] w-full max-w-[400px object-fill rounded-t-[10px] border-none"
                  />
                ) : (
                  <img
                    src={
                      selectedasset.audioThumbnail ||
                      selectedasset.assetAudiosImage ||
                      selectedasset.asset2DImage ||
                      selectedasset.asset3DImage ||
                      CustomImage
                    }
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    alt="Asset Image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                    className="h-full w-full object-fill rounded-t-[10px] border-none"
                  />
                )}

                {(Array.isArray(selectedasset.asset2DThumbnail) && selectedasset.asset2DThumbnail.length > 1) ||
                  (Array.isArray(selectedasset.asset3DThumbnail) && selectedasset.asset3DThumbnail.length > 1) ? (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent text-secondary-40 text-[40px] sm:text-[50px] rounded-full p-4 sm:p-6">
                      &#8592;
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-secondary-40 text-[40px] sm:text-[50px] rounded-full p-4 sm:p-6">
                      &#8594;
                    </button>
                  </>

                ) : null}
              </div>

            </div>

            <div className="w-full mt-4 text-center sm:text-left max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <p className="text-md mb-2 dark:text-primary-100 mt-4 text-start font-semibold">
                {selectedasset.audioName ||
                  selectedasset.asset2DName ||
                  selectedasset.asset3DName ||
                  "Nama Tidak Tersedia"}
              </p>

              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Kategori: {selectedasset.category}
              </p>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">


                {selectedasset.price > 0
                  ? `Rp ${selectedasset.price.toLocaleString("id-ID")}`
                  : "Free"}
              </p>
              <div className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                <label className="flex-col mt-2">Deskripsi:</label>
                <div className="mt-2">{selectedasset.description}</div>
              </div>
              <div className="mt-4">
                {selectedasset.price > 0 ? (
                  <>
                    <button
                      onClick={() => handleAddToCart(selectedasset)}
                      className={`flex p-2 text-center items-center justify-center bg-neutral-60 w-full h-10 rounded-md ${purchasedAssets.has(selectedasset.id)
                        ? "bg-gray-400 pointer-events-none"
                        : "bg-neutral-60"
                        }`}
                      disabled={purchasedAssets.has(selectedasset.id)}>
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
                      disabled={purchasedAssets.has(selectedasset.id)}>
                      <img
                        src={IconDollar}
                        alt="Cart Icon"
                        className="w-6 h-6 mr-2 -ml-24"
                      />
                      <p>Beli Sekarang</p>
                    </button>
                  </>
                ) : (
                  <button className="flex p-2 text-center items-center justify-center bg-neutral-60 text-primary-100 w-48 sm:w-[250px] md:w-[250px] lg:w-[300px] xl:w-[300px] 2xl:w-[300px] h-10 mt-32 rounded-md">
                    <img
                      src={IconDownload}
                      alt="Download Icon"
                      className="w-6 h-6 mr-2"
                    />
                    <p>Download</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AssetGame;
