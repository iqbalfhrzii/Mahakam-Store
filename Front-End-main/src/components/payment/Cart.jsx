import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";
import axios from "axios";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import Header from "../headerNavBreadcrumbs/HeaderWebUser";
import NavbarSection from "../website/web_User-LandingPage/NavbarSection";
// import CustomImage from "../../assets/assetmanage/Iconrarzip.svg";
import Footer from "../website/Footer/Footer";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (searchTerm) {
      const results = cartItems.filter(
        (asset) =>
          asset.datasetName &&
          asset.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(cartItems);
    }
  }, [searchTerm, cartItems]);

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const cartCollectionRef = collection(db, "cartAssets");
      const queryRef = query(cartCollectionRef, where("userId", "==", userId));

      const unsubscribe = onSnapshot(queryRef, async (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const boughtAssetsQuery = query(
          collection(db, "buyAssets"),
          where("boughtBy", "==", userId)
        );

        const boughtAssetsSnapshot = await getDocs(boughtAssetsQuery);
        const boughtAssetIds = new Set(
          boughtAssetsSnapshot.docs.map((doc) => doc.id)
        );

        const filteredItems = items.filter(
          (item) => !boughtAssetIds.has(item.assetId)
        );

        setCartItems(
          filteredItems.map((item) => ({
            ...item,
            selected: false,
            userId: item.userId,
          }))
        );
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "SB-Mid-client-QM4rGhnfcyjCT3LL");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (total, item) => total + Number(item.price),
    0
  );

  const handlePayment = async () => {
    if (selectedItems.length === 0) {
      setErrorMessage("Silakan pilih setidaknya satu item untuk melanjutkan.");
      return;
    }

    if (
      !customerInfo.fullName ||
      !customerInfo.email ||
      !customerInfo.phoneNumber
    ) {
      setErrorMessage("Silakan lengkapi semua informasi pelanggan.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const orderId = `order_${Date.now()}`;
      const assetDetails = selectedItems.map((item) => ({
        assetId: item.assetId,
        price: item.price,
        name: item.name || "Nama Item Tidak Tersedia",
        image:
          item.image ||
          item.Image_umum ||
          item.video ||
          item.assetImageGame || item.audioThumbnail || item.datasetThumbnail
          || item.asset2DThumbnail
          || item.asset3DThumbnail || "url tidak ada",
        datasetFile: item.datasetFile || item.asset3DFile || item.asset2DFile || item.uploadUrlAudio || "tidak ada",
        docId: item.docId,
        userId: item.userId,
        description: item.description || "Tidak Ada Deskripsi",
        category: item.category || "Tanpa Kategori",
        assetOwnerID: item.assetOwnerID || "ID Pemilik Aset Tidak Tersedia",
        size: item.size || item.resolution || "size & Resolution tidak ada",
      }));

      const response = await axios.post(
        "http://localhost:3000/api/transactions/create-transaction",
        {
          orderId,
          grossAmount: subtotal,
          uid: user.uid,
          assets: assetDetails,
          customerDetails: {
            fullName: customerInfo.fullName,
            email: customerInfo.email,
            phoneNumber: customerInfo.phoneNumber,
          },
        }
      );

      const transactionData = response.data;

      window.snap.pay(transactionData.token, {
        onSuccess: async (result) => {
          try {
            await saveToBuyAssets(assetDetails);
            await saveTransaction(orderId, subtotal, assetDetails);
            resetCustomerInfoAndCart();
            setSuccessMessage("Transaksi berhasil.");
          } catch (saveError) {
            setErrorMessage("Transaksi berhasil, tetapi gagal menyimpan aset.");

          }
        },
        onPending: async (result) => { },
        onError: function (result) {
          setErrorMessage("Terjadi kesalahan pembayaran.");
        },
      });
    } catch (error) {
      setErrorMessage("Gagal memproses pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToBuyAssets = async (assetDetails) => {
    const buyAssetPromises = assetDetails.map(async (asset) => {
      const buyAssetDocRef = doc(collection(db, "buyAssets"));
      try {
        await setDoc(buyAssetDocRef, {
          assetId: asset.assetId,
          price: asset.price,
          name: asset.name,
          image: asset.image || asset.audioThumbnail || asset.datasetThumbnail
            || asset.asset2DThumbnail
            || asset.asset3DThumbnail || "File Tidak Tersedia",
          datasetFile: asset.datasetFile || asset.asset3DFile || asset.asset2DFile || asset.uploadUrlAudio || "tidak ada",
          description: asset.description || "Tidak Ada Deskripsi",
          category: asset.category || "Tanpa Kategori",
          assetOwnerID: asset.assetOwnerID || "ID Pemilik Aset Tidak Tersedia",
          size: asset.size || asset.resolution || "size & Resolution tidak ada",
          createdAt: new Date(),
          userId: asset.userId,
        });
        console.log(`Berhasil menyimpan aset ke buyAssets: ${asset.assetId}`);
      } catch (error) {
        console.error(`Kesalahan saat menyimpan aset ke buyAssets: ${asset.assetId}`, error);
        throw error;
      }
    });

    await Promise.all(buyAssetPromises);
    alert("Transaksi berhasil!");
  };

  const saveTransaction = async (orderId, subtotal, assetDetails) => {
    const transactionDocRef = doc(collection(db, "transactions"), orderId);
    try {
      await setDoc(transactionDocRef, {
        createdAt: new Date(),
        orderId: orderId,
        grossAmount: subtotal,
        assets: assetDetails,
        uid: user.uid,
        status: "success",
      });
      console.log(`Transaksi berhasil disimpan: ${orderId}`);
    } catch (error) {
      console.error(`Kesalahan saat menyimpan transaksi: ${orderId}`, error);
      throw error;
    }
  };

  const resetCustomerInfoAndCart = () => {
    setCustomerInfo({ fullName: "", email: "", phoneNumber: "" });
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
  };

  const handleCheckboxChange = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        selected: item.id === id,
      }))
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleDeleteItem = async (id) => {
    try {
      const itemDoc = doc(db, "cartAssets", id);
      await deleteDoc(itemDoc);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Kesalahan saat menghapus item:", error);
    }
  };

  const filteredAssetsData = cartItems.filter((asset) => {
    const datasetName =
      asset.name ||
      asset.audioName ||
      asset.asset2DName ||
      asset.asset3DName ||
      "";
    return (
      datasetName &&
      datasetName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100 ">
      <div className="w-full shadow-lg bg-primary-100 dark:text-primary-100 relative z-40 ">
        <div className="-mt-10 pt-[2px] sm:pt-[60px] md:pt-[70px] lg:pt-[70px] xl:pt-[70px] 2xl:pt-[70px] w-full">
          <Header />
        </div>
        <div className="mt-0 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
          <NavbarSection />
        </div>
      </div>

      <div className="container mx-auto py-20">
        <h2 className="text-2xl font-semibold mb-4 mt-16">Keranjang Belanja</h2>
        <p className="mb-4">
          Anda mempunyai {cartItems.length} item dalam keranjang
        </p>
        <div className="flex flex-col md:flex-row md:justify-center p-4 max-w-screen mx-auto">
          <div className="md:w-2/3 space-y-4">
            {filteredAssetsData.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center sm:items-start justify-between bg-gray-100 dark:bg-neutral-20 text-neutral-10 dark:text-neutral-20 p-3 rounded-lg shadow-md mb-4">
                <div className="flex flex-row items-center sm:w-full">
                  <input
                    type="checkbox"
                    className="mr-2 sm:mr-4"
                    checked={item.selected}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                  <div>
                    {item.video ? (
                      <video
                        src={item.video}
                        className="h-20 w-20 sm:h-24 sm:w-24 lg:h-20 lg:w-20 rounded overflow-hidden border-none cursor-pointer"
                        controls
                      />
                    ) : (
                      <div>

                        {[
                          item.thumbnailGame,
                          item.Image,
                          item.Image_umum,
                          item.uploadUrlImage,
                          item.datasetImage,
                          item.assetAudiosImage,
                          item.asset2DImage,
                          item.asset3DImage,
                          item.datasetThumbnail,
                          item.datasetFile,
                        ].find((src) => src) ? (
                          <img
                            src={
                              [
                                item.Image,
                                item.thumbnailGame,
                                item.Image_umum,
                                item.uploadUrlImage,
                                item.datasetImage,
                                item.assetAudiosImage,
                                item.asset2DImage,
                                item.asset3DImage,
                                item.datasetThumbnail,
                                item.datasetFile,
                              ].find((src) => src)
                            }
                            alt="Asset"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                            }}
                            className="h-20 w-20 sm:h-24 sm:w-24 lg:h-20 lg:w-20 rounded overflow-hidden"
                          />
                        ) : (
                          <p>No image available</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-2 sm:ml-4 w-full">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {item.name ||
                        item.datasetName ||
                        item.videoName ||
                        item.assetNameGame ||
                        item.imageName ||
                        item.asset2DName ||
                        item.asset3DName ||
                        "Tidak ada nama"}
                    </h3>
                    <p className="text-sm sm:text-base">
                      Kategori: {item.category || "Kategori Tidak Dikenal"}
                    </p>
                    <p className="text-gray-700 mt-1 text-sm sm:text-base">
                      Rp. {(item.price || 0).toLocaleString("id-ID")}
                    </p>
                    {(item.size || item.resolution) && (
                      <p className="text-sm sm:text-base">
                        Ukuran: {item.size || item.resolution || "Tidak ada ukuran"}
                      </p>
                    )}

                  </div>
                </div>
                <div className="flex justify-center p-10 items-center">
                  <button
                    className="text-red-500 mt-2 sm:mt-0 sm:ml-auto"
                    onClick={() => handleDeleteItem(item.id)}>
                    <FaTrashAlt />
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="bg-gray-200 p-5 rounded-lg shadow-md w-full md:w-[320px] text-primary-100 bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 mt-4 md:mt-0 mx-auto">
            <h4 className="text-gray-950 font-semibold mb-2 text-sm md:text-base bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100">
              Detail Pembayaran
            </h4>
            <p className="text-gray-700 bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100">
              Harga ({selectedItems.length} item): Rp.{" "}
              {subtotal.toLocaleString("id-ID")}
            </p>
            <div className="mt-4">
              <input
                type="text"
                name="fullName"
                placeholder="Nama Lengkap"
                value={customerInfo.fullName}
                onChange={handleInputChange}
                className="block w-full mb-2 p-2 border rounded text-sm md:text-base bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className="block w-full mb-2 p-2 border rounded text-sm md:text-base bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100"
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Nomor Telepon"
                value={customerInfo.phoneNumber}
                onChange={handleInputChange}
                className="block w-full mb-4 p-2 border rounded text-sm md:text-base bg-neutral-100 dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100"
                required
              />
            </div>
            {isLoading && (
              <p className="text-blue-600 text-sm md:text-base">
                Memproses pembayaran, harap tunggu...
              </p>
            )}
            {errorMessage && (
              <p className="text-red-500 text-sm md:text-base">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm md:text-base">
                {successMessage}
              </p>
            )}
            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md text-sm md:text-base"
              onClick={handlePayment}>
              Proses Ke Pembayaran
            </button>
          </div>
        </div>
      </div>

      <div className="mt-96">
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
