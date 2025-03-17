import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../contexts/ThemeContext";
import ProtectedRoute from "../private/ProtectedRoute";
import AutoLogout from "../components/auto/autoLogout";
import ErrorPage from "../pages/errorPage";
import Register from "../pages/register";
import Login from "../pages/login";
import LupaPassword from "../pages/lupaPassword";
import Profil from "../components/editProfil/Profil";
import EditProfil1 from "../components/editProfil/EditProfil1";
import EditProfil2 from "../components/editProfil/EditProfil2";
// Import Halaman Dashboard start
import AdminDashboard from "../components/myAdmin/AdminDashboard";
import ManageAssetVideo from "../components/manageAssetVideo/ManageAssetVideo";
import AddFormAssetVideo from "../components/manageAssetVideo/AddFormAssetVideo";
import EditFormAssetVideo from "../components/manageAssetVideo/EditFormAssetVideo";
import ManageAssetImage from "../components/manageAssetImage/ManageAssetImage";
import AddFormAssetImage from "../components/manageAssetImage/AddAssetImage";
import EditFormAssetImage from "../components/manageAssetImage/EditAssetImage";
import ManageAssetDataset from "../components/manageAssetDataset/ManageAssetDataset";
import AddFormAssetDataset from "../components/manageAssetDataset/AddAssetDataset";
import EditFormAssetDataset from "../components/manageAssetDataset/EditAssetDataset";
import ManageAsset2D from "../components/manageAssetGame/ManageAsset2D";
import AddNewAsset2D from "../components/manageAssetGame/addAsset2D/AddAsset2D";
import EditNewAsset2D from "../components/manageAssetGame/addAsset2D/EditAsset2D";
import ManageAsset3D from "../components/manageAssetGame/ManageAsset3D";
import AddNewAsset3D from "../components/manageAssetGame/addAsset3D/AddASset3D";
import EditNewAsset3D from "../components/manageAssetGame/addAsset3D/EditASset3D";
import ManageAssetAudio from "../components/manageAssetGame/ManageAssetAudio";
import AddAssetAudio from "../components/manageAssetGame/addAssetAudio/AddAssetAudio";
import EditAssetAudio from "../components/manageAssetGame/addAssetAudio/EditAssetAudio";
import ManageAdmin from "../components/mySuperAdmin/ManageAdmin";
import AddFormAdmin from "../components/mySuperAdmin/AddAdmin";
import EditFormAdmin from "../components/mySuperAdmin/EditAdmin";
import ManageUsers from "../components/myAdmin/ManageUsers";
import AddUsers from "../components/myAdmin/AddUser";
import EditUsers from "../components/myAdmin/EditUser";
import SaleAssets from "../components/myUserDashboard/SaleAssets";
import Revenue from "../components/myUserDashboard/Revenue";
// Import Halaman Dashboard End

// Penarikan dana start
import AdminUserRevenue from "../components/myAdmin/AdminUserRevenue";
import PaymentSetting from "../components/myUserDashboard/PaymentSettings";
// Penarikan dana End

//import Halaman Panduan start
import Panduan from "../components/panduan/pandauns"
import PanduanRegistrasi from "../components/panduan/PanduanRegistrasi";
import PanduanLogin from "../components/panduan/PanduanLogin";
import PanduanLupaPassword from "../components/panduan/PanduanLupaPassword";
import JualAsset from "../components/panduan/PanduanJualAsset";
import EditAsset from "../components/panduan/PanduanEditAsset";
//import Halaman Panduan End

// Import Halaman Website start
import Cart from "../components/payment/Cart";
import CartBuyNow from "../components/payment/CartBuyNow";
import Payment from "../components/payment/Cart";
import HomePage from "../components/website/web_User-LandingPage/HomePage";
import { AssetGratis } from "../components/website/Web_User-Gratis/AssetGratis";
import { AssetVideo } from "../components/website/web_user-AssetVideo/AssetVideo";
import { AssetImage } from "../components/website/web_User-AssetGambar/AssetImage";
import { AssetDataset } from "../components/website/web_User-AssetDataset/AssetDataset";
import { AssetGame } from "../components/website/web_user-AssetGame/AssetGame";
import { MyAsset } from "../components/website/web_User-MyAsset/MyAsset";
import EditProfil from "../components/editProfil/Profil";
import RiwayatTransaksi from "../components/riwayat/RiwayatTransaksi";
import DetailTransaksi from "../components/riwayat/detail_transaksi";

// Import Halaman Website End

// eslint-disable-next-line react/prop-types
const AppRoutes = ({ handleLogout }) => {
  return (
    <>
      <ThemeProvider>
        <AutoLogout />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lupa-password" element={<LupaPassword />} />

          {/* Route halaman web start */}
          <Route path="/" element={<HomePage />} />
          <Route path="/asset-gratis" element={<AssetGratis />} />
          <Route path="/asset-video" element={<AssetVideo />} />
          <Route path="/asset-image" element={<AssetImage />} />
          <Route path="/asset-dataset" element={<AssetDataset />} />
          <Route path="/asset-game" element={<AssetGame />} />
          <Route path="/my-asset" element={<MyAsset />} />
          <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
          <Route
            path="/transaction-detail/:orderId"
            element={<DetailTransaksi />}
          />
          
           {/* Route Halaman Panduan Start */}
           <Route path="/panduan-registrasi" element={<PanduanRegistrasi/>} />
          <Route path="/panduan-login" element={<PanduanLogin/>} />
          <Route path="/panduan-lupa-password" element={<PanduanLupaPassword/>} />
          <Route path="/panduan-jual-asset" element={<JualAsset/>} />
          <Route path="/panduan-edit-asset" element={<EditAsset/>} />
          <Route path= "/panduan" element={<Panduan/>} />
          {/* Route Halaman Panduan End */}
        
          {/* Route halaman web End */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditProfil onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <Cart onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buy-now-asset"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <CartBuyNow onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <Payment onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-video"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAssetVideo onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-video/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddFormAssetVideo onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-video/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditFormAssetVideo onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-image"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAssetImage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-image/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddFormAssetImage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-image/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditFormAssetImage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-dataset"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAssetDataset onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-dataset/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddFormAssetDataset onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-dataset/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditFormAssetDataset onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-2D"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAsset2D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-2D/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddNewAsset2D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-2D/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditNewAsset2D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-3D"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAsset3D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-3D/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddNewAsset3D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-3D/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditNewAsset3D onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-audio"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ManageAssetAudio onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-audio/add"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AddAssetAudio onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-asset-audio/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditAssetAudio onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/paymentSetting"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <PaymentSetting onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sale"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <SaleAssets onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <Revenue onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/user-revenue"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <AdminUserRevenue onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          

          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <ManageUsers onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AddUsers onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <EditUsers onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-admin"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <ManageAdmin onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-admin/add"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <AddFormAdmin onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-admin/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditFormAdmin onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Profil"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <Profil onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editProfil1"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditProfil1 onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editProfil2"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <EditProfil2 onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </ThemeProvider>
    </>
  );
};

export default AppRoutes;
