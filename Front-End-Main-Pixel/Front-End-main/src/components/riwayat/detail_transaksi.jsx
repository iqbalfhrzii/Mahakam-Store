import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Iconcheck from "../../assets/icon/iconPayment/check.png";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const PaymentSuccess = () => {
  const { orderId } = useParams(); // Mengambil orderId dari URL
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  // Log untuk memeriksa nilai orderId
  console.log("Order ID from URL:", orderId);

  // Fungsi untuk memformat waktu
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return "Tanggal Tidak Diketahui";
    }

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Mengambil data aset dari Firebase
  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!orderId) {
        console.error("orderId is undefined");
        setLoading(false);
        return;
      }

      try {
        const assetRef = doc(db, "buyAssets", orderId); // Mengambil dari koleksi buyAssets
        const assetDoc = await getDoc(assetRef);

        if (assetDoc.exists()) {
          setAsset(assetDoc.data());
        } else {
          console.error("Aset tidak ditemukan");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching asset details:", error);
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [orderId]);

  // Navigasi ke halaman utama saat tombol ditekan
  const handleGoToHome = () => {
    navigate("/");
  };

  const handleGoToRiwayat = () => {
    navigate("/riwayat-transaksi");
  };

  return (
    <div className="dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 min-h-screen font-poppins bg-primary-100 flex items-center justify-center p-4">
      <div className="bg-white mt-10 rounded-md shadow-xl max-w-lg mx-auto w-full">

        <div className="dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90 p-6 md:p-10 bg-primary-100">
          <div className="text-center">
            <div className="text-center font-bold text-4xl leading-loose ">
              <p className="text-success-30">Terima Kasih</p>
            </div>

            <img
              src={Iconcheck}
              alt="icon-check"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-neutral-90 mb-4">
              {asset
                ? `Rp.${asset.price.toLocaleString("id-ID")}`
                : "Detail Aset"}
            </h2>
          </div>

          {loading ? (
            <p>Loading asset details...</p>
          ) : asset ? (
            <div className="text-left text-gray-700 dark:text-neutral-90">
              <div className="mb-4">
                <p>
                  <strong>Nama Aset:</strong>{" "}
                  {asset.name || "Nama tidak diketahui"}
                </p>
                <p>
                  <strong>Harga:</strong> Rp.{" "}
                  {asset.price?.toLocaleString("id-ID") || "Data tidak ada"}
                </p>
                <p>
                  <strong>Kategori:</strong>{" "}
                  {asset.category || "Kategori tidak diketahui"}
                </p>
                <p>
                  <strong>Tanggal :</strong>{" "}
                  {formatDate(asset.createdAt) || "Tanggal tidak diketahui"}
                </p>
                <p>
                  <strong>Status :</strong> Sukses
                </p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Aset tidak ditemukan.</p>
          )}

          <div className="text-center flex flex-col gap-2 mt-6">
            <button
              onClick={handleGoToHome}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition duration-200"
            >
              Kembali Ke Halaman Utama
            </button>

            <button
              onClick={handleGoToRiwayat}
              className="bg-green-600 text-white py-2 px-4 rounded-lg w-full hover:bg-green-700 transition duration-200"
            >
              Kembali ke Riwayat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
