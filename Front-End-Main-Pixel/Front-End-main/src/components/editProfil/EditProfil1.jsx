import { useState, useEffect } from "react";
import Headerprofil from "../editProfil/HeaderWebProfile";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  updateDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Logoprofil from "../../assets/icon/iconWebUser/profil.svg";
import Logoprofilwhite from "../../assets/icon/iconWebUser/Profilwhite.svg";
import Footer from "../../components/website/Footer/Footer"

function EditProfil() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const [error,] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (currentUserId) {
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("uid", "==", currentUserId));

      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUserProfile(userData);
        } else {
            console.log("Profil pengguna tidak ditemukan di 'users', cek di 'admins'.");
  
            const adminsCollectionRef = collection(db, "admins");
            const adminsQuery = query(adminsCollectionRef, where("uid", "==", currentUserId));
  
            const unsubscribeAdmins = onSnapshot(adminsQuery, (snapshot) => {
              if (!snapshot.empty) {
                const userData = snapshot.docs[0].data(); 
                console.log("Data pengguna ditemukan:", userData);
                setUserProfile(userData);
          }else{
            console.log("Data pengguna tidak ditemukan");
          }
        })
        unsubscribeList.push(unsubscribeAdmins);
      }});
      const unsubscribeList = [unsubscribeUsers];

      
        return () => unsubscribeList.forEach(unsub=>unsub());
      }
    }, [currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const handleSave = async () => {
    if (!currentUserId) {
      setAlertMessage("User ID tidak ditemukan.");
      setShowAlert(true);
      return;
    }

    try {
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("uid", "==", currentUserId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = userDoc.ref;

        await updateDoc(userDocRef, {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phone: userProfile.phone,
          bio: userProfile.bio,
        });

        setAlertMessage("Profil berhasil diperbarui!");
        setShowAlert(true);

      } else {
        
        const adminsCollectionRef = collection(db, "admins");
        const adminsQuery = query(adminsCollectionRef, where("uid", "==", currentUserId));

        const querySnapshot = await getDocs(adminsQuery);
  
        if (!querySnapshot.empty) {
        
          const adminDoc = querySnapshot.docs[0];
          const adminDocRef = adminDoc.ref;
  
         
          const updatedData = {
            firstName: userProfile.firstName || adminDoc.data().firstName || '',
            lastName: userProfile.lastName || adminDoc.data().lastName || '',
            email: userProfile.email || adminDoc.data().email || '',
          };
  
          
          if (userProfile.phone !== "") {
            updatedData.phone = userProfile.phone;
          }
  
          if (userProfile.bio !== "") {
            updatedData.bio = userProfile.bio;
          }
  
          
          await updateDoc(adminDocRef, updatedData);
          setAlertMessage('Profil berhasil diperbarui!');
          setShowAlert(true);
        } else {
          console.log("Data tidak ditemukan");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlertMessage('Gagal menyimpan profil. Silakan coba lagi.');
      setShowAlert(true);
    }
  };


  return (
    <div className="min-h-screen font-poppins bg-primary-100 dark:bg-neutral-20 text-neutral-10 dark:text-neutral-90">
      <Headerprofil />

      <div className="flex flex-col items-center lg:mr-0 lg:items-stretch lg:flex-row mb-5 lg:mb-10 lg:p-20">
        <aside className=" self-stretch mr-4 ml-4 lg:mr-auto lg:ml-auto bg-white dark:bg-neutral-800 drop-shadow-lg p-6 mt:4 lg:mt-16 rounded-lg">
          <div className="flex justify-center mb-4">
            <img
              src={Logoprofil}
              alt="User Profile"
              className="block dark:hidden w-16 h-16 rounded-full border-2 border-blue-600"
            />
            <img
              src={Logoprofilwhite}
              alt="User Profile"
              className="hidden dark:block w-16 h-16 rounded-full border-2 border-white"
            />
          </div>
          <h2 className="text-xl font-bold text-center mb-4">{userProfile?.username}</h2>
          
          <ul className="space-y-4 w-full">
            <li>
              <button
                onClick={() => navigate("/Profil")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-left">
                <span className="flex  items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 mr-2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2.25-2.25M21 12l-2.25 2.25M12 3l2.25 2.25M12 21l-2.25-2.25M3.5 3.5L20.5 20.5M3.5 20.5L20.5 3.5"
                    />
                  </svg>
                  <p className="text-center ml-6">Kembali</p>
                </span>
              </button>
            </li>
          </ul>
        </aside>

        <main className="bg-white dark:bg-neutral-900 w-[90%] lg:w-full p-4 lg:p-6 rounded-lg mt-8 lg:mt-16 shadow-lg ml-auto mr-auto lg:mr-auto lg:ml-6">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block mb-2 font-bold">Nama Depan</label>
              <input
                type="text"
                name="firstName"
                value={userProfile.firstName}
                onChange={handleChange}
                className="dark:text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan Nama Depan"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Nama Belakang</label>
              <input
                type="text"
                name="lastName"
                value={userProfile.lastName}
                onChange={handleChange}
                className="dark:text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan Nama Belakang"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Email</label>
                <input
                type="email"
                name="email"
                value={userProfile.email}
                readOnly
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                placeholder="Masukkan Email"
              />
            </div>

            <div className="mb-4">
              <label className="dark:text-white block mb-2 font-bold">Telepon</label>
              <input
                type="text"
                name="phone"
                value={userProfile.phone}
                onChange={handleChange}
                className="dark:text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan Telepon"
              />
            </div>

            <div className="mb-4 col-span-full">
              <label className="block mb-2 font-bold">Bio</label>
              <textarea
                name="bio"
                value={userProfile.bio}
                onChange={handleChange}
                className="dark:text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Deskripsikan tentang diri Anda"
              />
            </div>
          </div>

          <div className="text-right mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300">
              Simpan Perubahan
            </button>
          </div>
          {showAlert && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-11/12 sm:w-96">
                <p className="text-gray-800 text-center">{alertMessage}</p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="mt-[200px]">
        <Footer />
      </div>
    </div>
  );
}

export default EditProfil;