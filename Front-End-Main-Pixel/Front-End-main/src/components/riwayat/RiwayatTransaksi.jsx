import { db } from "../../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import HeaderNav from "../headerNavBreadcrumbs/HeaderWebUser";
import NavbarSection from "../../components/website/web_User-LandingPage/NavbarSection";
import { useNavigate } from "react-router-dom";

const buyAssetsCollectionRef = collection(db, "buyAssets");

export function RiwayatTransaksi() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchAssets = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const assetsQuery = query(
        buyAssetsCollectionRef,
        where("userId", "==", user.uid)
      );

      try {
        const assetsSnapshot = await getDocs(assetsQuery);
        if (assetsSnapshot.empty) {
          setErrorMessage("Tidak ada aset yang ditemukan.");
          setLoading(false);
          return;
        }

        const assetsList = assetsSnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });

        setAssets(assetsList);
      } catch (error) {
        setErrorMessage("Terjadi kesalahan dalam memuat aset.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [auth, navigate]);

  const viewAssetDetails = (assetId) => {
    navigate(`/transaction-detail/${assetId}`);
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
      <div className="w-full p-4 md:p-12 mt-20 top-24 min-h-screen">
        <h2 className="text-2xl font-semibold mb-4 mt-4 lg:mt-24 text-center -z-40">
          Riwayat Transaksi
        </h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="overflow-x-auto min-h-screen">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr className="text-left text-sm text-gray-600 uppercase tracking-wider">
                  <th className="px-2 py-2 md:px-4 md:py-2 sticky top-0 bg-gray-200 z-10">
                    Nama Aset
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-2 sticky top-0 bg-gray-200 z-10">
                    Jumlah Pembayaran
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-2 sticky top-0 bg-gray-200 z-10">
                    Tanggal Pembelian
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-2 sticky top-0 bg-gray-200 z-10">
                    Status
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-2 sticky top-0 bg-gray-200 z-10">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id} className="border-b">
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        {asset.name || "Nama tidak diketahui"}
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        Rp.{" "}
                        {asset.price?.toLocaleString("id-ID") ||
                          "Data tidak ada"}
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        {asset.createdAt
                          ? new Date(
                            asset.createdAt.seconds * 1000
                          ).toLocaleString("id-ID")
                          : "Tanggal tidak diketahui"}
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        <span className="text-green-500 font-semibold">
                          Sukses
                        </span>
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        <button
                          onClick={() => viewAssetDetails(asset.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Tidak ada aset yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiwayatTransaksi;