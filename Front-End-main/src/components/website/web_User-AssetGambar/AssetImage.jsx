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

export function AssetImage() {
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
  const [selectedSize, setSelectedSize] = useState("Original");

  // Mengambil ID pengguna saat ini
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

  // Mengambil data aset dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "assetImages"),
      async (snapshot) => {
        const Assets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter aset dengan harga tidak terdefinisi atau nol
        const filteredAssets = Assets.filter(
          (asset) => asset.price !== undefined && asset.price > 0
        );
        setAssetsData(filteredAssets);
      }
    );

    return () => unsubscribe();
  }, []);

  // Menangani pengambilan aset yang telah dibeli
  useEffect(() => {
    // Fetch purchased assets for the current user
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
          purchasedIds.add(doc.data().assetId);
        });
        setPurchasedAssets(purchasedIds);
      } catch (error) {
        console.error("Error fetching purchased assets: ", error);
      }
    };

    fetchUserPurchasedAssets();
  }, [currentUserId]);

  // Mengambil data aset yang disukai pengguna
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
          userLikes.add(doc.data().assetId);
        });

        setLikedAssets(userLikes);
      } catch (error) {
        // console.error("Error fetching likes: ", error);
      }
    };

    fetchUserLikes();
  }, [currentUserId]);

  // Menyaring hasil pencarian berdasarkan input pengguna
  useEffect(() => {
    const results = AssetsData.filter((asset) =>
      asset.imageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, AssetsData]);

  // Fungsi untuk menangani klik tombol like pada aset
  const handleLikeClick = async (assetId, currentLikes) => {
    if (isProcessingLike) return;

    if (!currentUserId) {
      setAlertLikes("Login untuk menyukai Asset ini");
      setTimeout(() => {
        setAlertLikes(false);
      }, 3000);
      return;
    }

    setIsProcessingLike(true);

    const assetRef = doc(db, "assetImages", assetId);
    const likeRef = doc(db, "likes", `${currentUserId}_${assetId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const newLikedAssets = new Set(likedAssets);
        let newLikesAsset;

        if (newLikedAssets.has(assetId)) {
          // Menghapus like
          transaction.delete(likeRef);
          newLikesAsset = Math.max(0, currentLikes - 1);
          transaction.update(assetRef, { likeAsset: newLikesAsset });
          newLikedAssets.delete(assetId);
        } else {
          // Menambah like
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

  const sizeDimensions = {
    Original: "6000x4000",
    Large: "1920x1280",
    Medium: "1280x1280",
    Small: "640x427",
  };

  const handleAddToCart = async (selectedAsset) => {
    if (!validateAddToCart(selectedAsset.id)) return;

    if (selectedAsset.userId === currentUserId) {
      alert("Anda tidak dapat membeli aset yang Anda jual sendiri.");
      return;
    }

    const dimensions = sizeDimensions[selectedSize] || "Unknown Size";
    const sizeWithDimensions = `${selectedSize} (${dimensions})`;

    const cartRef = doc(db, "cartAssets", `${selectedAsset.id}`);
    try {
      const cartSnapshot = await getDoc(cartRef);
      if (cartSnapshot.exists()) {
        setValidationMessage("Anda sudah menambahkan asset ini ke keranjang.");
        return;
      }

      await setDoc(cartRef, {
        userId: currentUserId,
        assetId: selectedAsset.id,
        Image_umum: selectedAsset.uploadUrlImage,
        name: selectedAsset.imageName,
        description: selectedAsset.description,
        price: selectedAsset.price,
        category: selectedAsset.category,
        assetOwnerID: selectedAsset.userId,
        size: sizeWithDimensions,
      });
      alert("Asset berhasil ditambahkan ke keranjang!");
    } catch (error) {
      console.error("Error adding to cart: ", error);
      alert("Terjadi kesalahan saat menambahkan aset ke keranjang.");
    }
  };

  // Fungsi untuk menangani pembelian aset
  const handleBuyNow = async (selectedasset) => {
    // Cek apakah pengguna sudah login
    if (!currentUserId) {
      alert("Anda perlu login untuk membeli aset");
      navigate("/login");
      return;
    }

    // Cek apakah userId penjual sama dengan currentUserId
    if (selectedasset.userId === currentUserId) {
      alert("Anda tidak dapat membeli aset yang Anda jual sendiri.");
      return;
    }

    // Cek apakah aset sudah dibeli
    if (purchasedAssets.has(selectedasset.id)) {
      alert("Anda sudah membeli aset ini.");
      return;
    }

    // Mengambil referensi ke dokumen pembelian
    const cartRef = doc(db, "buyNow", selectedasset.id);
    const cartSnapshot = await getDoc(cartRef);
    if (cartSnapshot.exists()) {
      alert("Anda sudah membeli asset ini.");
      return;
    }

    const sizeDimensions = {
      Original: { dimensions: "6000x4000", width: 6000, height: 4000 },
      Large: { dimensions: "1920x1280", width: 1920, height: 1280 },
      Medium: { dimensions: "1280x1280", width: 1280, height: 1280 },
      Small: { dimensions: "640x427", width: 640, height: 427 },
    };

    const selectedSizeDetails = sizeDimensions[selectedSize] || {
      dimensions: "Unknown Size",
    };
    const sizeWithDimensions = `${selectedSize} (${selectedSizeDetails.dimensions})`;

    const { id, imageName, description, price, uploadUrlImage, category } =
      selectedasset;

    // Validasi atribut yang diperlukan
    const missingFields = validateAssetFields({
      imageName,
      description,
      price,
      uploadUrlImage,
      category,
      size: selectedSize, // Sertakan ukuran dalam validasi
    });

    if (missingFields.length > 0) {
      alert(
        `Field yang hilang: ${missingFields.join(", ")}. Silakan coba lagi.`
      );
      return;
    }

    try {
      await setDoc(cartRef, {
        userId: currentUserId,
        assetId: id,
        name: imageName,
        description: description,
        price: price,
        Image_umum: uploadUrlImage,
        category: category,
        size: sizeWithDimensions,
        assetOwnerID: selectedasset.userId,
        // sizeWidth: selectedSizeDetails.width, // Menyimpan lebar ukuran
        // sizeHeight: selectedSizeDetails.height, // Menyimpan tinggi ukuran
      });

      navigate("/buy-now-asset");
    } catch (error) {
      console.error("Error adding to cart: ", error);
      alert(
        "Terjadi kesalahan saat menambahkan aset ke keranjang. Silakan coba lagi."
      );
    }
  };

  // Fungsi untuk memvalidasi atribut aset
  const validateAssetFields = ({
    imageName,
    description,
    price,
    uploadUrlImage,
    category,
    size,
  }) => {
    const missingFields = [];
    if (!imageName) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined) missingFields.push("price");
    if (!uploadUrlImage) missingFields.push("Image_umum");
    if (!category) missingFields.push("category");
    if (!size) missingFields.push("size");
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
    setSelectedSize("Original");
  };

  // Filter berdasarkan pencarian
  const filteredAssetsData = AssetsData.filter((asset) =>
    asset.imageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="w-full p-12 mx-auto">
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
        {/* <h1 className="text-2xl -ml-10 font-semibold text-neutral-10 dark:text-primary-100  pt-[100px] ">
          All Category
        </h1> */}
      </div>

      <div className="relative mt-40 lg:mt-96 flex items-center justify-center">
        <div className="text-center">
          {searchResults.length === 0 && searchTerm && (
            <p className="text-black text-[20px]">No assets found</p>
          )}
        </div>
      </div>

      {/* Bagian untuk menampilkan aset */}
      <div className="pt-2 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 min-h-screen -mt-28 lg:-mt-80">
        <div className="mb-4 mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 place-items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 ">
          {filteredAssetsData.map((data) => {
            const likesAsset = data.likeAsset || 0;
            const likedByCurrentUser = likedAssets.has(data.id);
            const isPurchased = purchasedAssets.has(data.id);

            return (
              <div
                key={data.id}
                className="w-[140px] h-[200px] ssm:w-[165px] ssm:h-[230px] sm:w-[180px] sm:h-[250px] md:w-[180px] md:h-[260px] lg:w-[210px] lg:h-[300px] rounded-[10px] shadow-md bg-primary-100 dark:bg-neutral-25 group flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <div className="w-full h-[300px] relative overflow-hidden aspect-video cursor-pointer z-[10]">
                  <img
                    src={data.uploadUrlImage || CustomImage}
                    alt="Image"
                    className="h-full w-full object-fill rounded-t-[10px] border-none"
                    onClick={() => openModal(data)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = CustomImage;
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                  {isPurchased && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Sudah Dibeli
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between h-full p-2 sm:p-4">
                  <div onClick={() => openModal(data)}>
                    <p className="text-xs text-neutral-10 font-semibold dark:text-primary-100">
                      {data.imageName.length > 14
                        ? `${data.imageName.substring(0, 14)}...`
                        : data.imageName}
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

      {/* Modal untuk detail aset */}
      {modalIsOpen && selectedasset && (
        <div className="fixed inset-0 flex items-center justify-center z-50  ">
          <div className="fixed inset-0 bg-neutral-10 bg-opacity-50"></div>
          <div className="bg-primary-100 dark:bg-neutral-20 p-6 rounded-lg z-50 w-[90%] sm:w-[400px] md:w-[500px] lg:w-[550px] xl:w-[600px] 2xl:w-[750px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[750px] max-w-3xl mx-auto flex flex-col relative">
            <button
              className="absolute top-1 right-4 text-gray-600 dark:text-gray-400 text-4xl"
              onClick={closeModal}>
              &times;
            </button>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full h-[200px] sm:h-[200px] md:h-[200px] lg:h-[250px] xl:h-[300px] 2xl:h-[350px] aspect-[16/9] sm:aspect-[4/3] relative mt-4">
                <img
                  src={selectedasset.uploadUrlImage || CustomImage}
                  alt="asset Image"
                  className="w-full h-full object-fill"
                  onClick={() => openModal()}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = CustomImage;
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
            <div className="w-full mt-4 text-center sm:text-left max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <h2 className="text-md mb-2 dark:text-primary-100 mt-4 text-start font-semibold">
                {selectedasset.imageName}
              </h2>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Kategori: {selectedasset.category}
              </p>
              <p className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                Rp. {selectedasset.price.toLocaleString("id-ID")}
              </p>
              <div className="text-sm mb-2 dark:text-primary-100 mt-4 text-start">
                <label className="flex-col mt-2 ">Deskripsi gambar:</label>
                <div className="mt-2 text-justify">
                  {selectedasset.description}
                </div>
              </div>

              <div className="mt-10">
                <div className="mb-4 text-start">
                  <label className="flex-col mt-2 ">Pilih Ukuran:</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="mt-2 p-2 border rounded-md w-full">
                    <option value="Original">Original (6000x4000)</option>
                    <option value="Large">Large (1920x1280)</option>
                    <option value="Medium">Medium (1280x1280)</option>
                    <option value="Small">Small (640x427)</option>
                  </select>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
