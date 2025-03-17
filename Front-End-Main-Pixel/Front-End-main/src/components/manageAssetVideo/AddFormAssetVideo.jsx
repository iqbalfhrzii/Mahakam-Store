/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, storage, auth } from "../../firebase/firebaseConfig";
import Breadcrumb from "../breadcrumbs/Breadcrumbs";
import IconField from "../../assets/icon/iconField/icon.svg";
import HeaderNav from "../HeaderNav/HeaderNav";

function AddNewVideo() {
  const [user, setUser] = useState(null);
  const [video, setVideo] = useState({
    videoName: "",
    category: "",
    description: "",
    price: "",
    uploadUrlVideo: null,
  });
  const navigate = useNavigate();
  const [previewVideo, setPreviewVideo] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (user) {
        const q = query(
          collection(db, "categoryVideos"),
          where("userId", "==", user.uid)
        );
        try {
          const querySnapshot = await getDocs(q);
          const categoriesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setCategories(categoriesData);
          // console.log("Fetched categories:", categoriesData); // Log untuk memastikan data yang diambil
        } catch (error) {
          // console.error("Error fetching categories: ", error);
        }
      }
    };

    fetchCategories();
  }, [user]); // Pastikan memanggil ulang saat user berubah

  // Menambahkan dan menghapus kelas overflow-hidden pada body
  useEffect(() => {
    if (showPopup) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showPopup]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "uploadUrlVideo" && files[0]) {
      setVideo({
        ...video,
        uploadUrlVideo: files[0],
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewVideo(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setVideo({
        ...video,
        [name]: name === "price" ? parseFloat(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "assetVideos"), {
        category: video.category,
        createdAt: Timestamp.now(),
        uploadUrlVideo: "",
        videoName: video.videoName,
        description: video.description,
        price: video.price,
        uploadedByEmail: user.email,
        userId: user.uid,
      });

      const docId = docRef.id;
      let uploadUrlVideoUrl = "";
      if (video.uploadUrlVideo) {
        const videoRef = ref(
          storage,
          `images-assetvideo/uploadUrlVideo-${docId}.mp4`
        );
        await uploadBytes(videoRef, video.uploadUrlVideo);
        uploadUrlVideoUrl = await getDownloadURL(videoRef);
      }

      await updateDoc(doc(db, "assetVideos", docId), {
        uploadUrlVideo: uploadUrlVideoUrl,
      });

      setVideo({
        videoName: "",
        category: "",
        description: "",
        price: "",
        uploadUrlVideo: null,
      });
      setPreviewVideo(null);
      setAlertSuccess(true);
      setTimeout(() => {
        navigate("/manage-asset-video");
      }, 2000);
    } catch (error) {
      // console.error("Error menambahkan video: ", error);
      setAlertError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage-asset-video");
  };

  const closeAlert = () => {
    setAlertError(false);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() !== "" && user) {
      try {
        const categoryDocRef = await addDoc(collection(db, "categoryVideos"), {
          name: newCategory,
          createdAt: Timestamp.now(),
          userId: user.uid, // Simpan userId yang menambah kategori
        });

        // Update state lokal dengan kategori yang baru ditambahkan
        setCategories([
          ...categories,
          { id: categoryDocRef.id, name: newCategory },
        ]);
        setNewCategory(""); // Reset input field
        setShowPopup(false); // Close the popup
      } catch (error) {
        // console.error("Error menambahkan kategori: ", error);
        setAlertError(true);
      }
    }
  };

  return (
    <>
      <div className="bg-primary-100 dark:bg-neutral-20 font-poppins h-full min-h-screen">
        <div className="bg-primary-100 p-4 mt-14">
          <HeaderNav />
        </div>

        <div className="overflow-scroll ">
          <div className="bg-primary-100 dark:bg-neutral-20 dark:text-primary-100 flex flex-col">
            <div className="text-2xl dark:text-primary-100 p-4">
              <Breadcrumb />
            </div>
          </div>

          {/* Alert Success */}
          {alertSuccess && (
            <div
              role="alert"
              className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[300px] md:w-[400px] lg:w-[400px] xl:w-[400px] 2xl:w-[400px] text-[10px] sm:text-[10px] md:text-[10px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] -translate-y-1/2 z-50 p-4  bg-success-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
              onClick={closeAlert}>
              <div className="flex items-center justify-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Video baru berhasil ditambahkan dan tersimpan.</span>
              </div>
            </div>
          )}

          {/* Alert Error */}
          {alertError && (
            <div
              role="alert"
              className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[340px] sm:w-[300px] md:w-[400px] lg:w-[400px] xl:w-[400px] 2xl:w-[400px] text-[8px] sm:text-[10px] md:text-[10px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] -translate-y-1/2 z-50 p-4  bg-primary-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
              onClick={closeAlert}>
              <div className="flex items-center justify-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Gagal menambahkan Video baru silahkan coba lagi</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mx-0 sm:mx-0 md:mx-0 lg:mx-0 xl:mx-28 2xl:mx-24   h-[1434px] gap-[50px]  overflow-hidden  mt-4 sm:mt-0 md:mt-0 lg:-mt-0 xl:mt-0 2xl:-mt-0">
            <h1 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-10 dark:text-primary-100 p-4">
              Add New Video
            </h1>
            <div className="p-8 -mt-4  bg-primary-100  dark:bg-neutral-20 rounded-sm shadow-lg">
              <h2 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                Video Information
              </h2>

              <div className="flex flex-col md:flex-row md:gap-[140px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-[150px] md:w-[170px] lg:w-[200px] xl:w-[220px] 2xl:w-[170px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Upload File
                    </h3>
                    <video
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px]  xl:text-[12px] mb-2">
                    Format video harus mp4
                  </p>
                </div>
                <div className="p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-2 md:gap-2 lg:gap-6 xl:gap-6 2xl:gap-10">
                    <div className="mt-2 md:ml-2 lg:ml-4 xl:ml-6 2xl:ml-4 flex justify-center items-center border border-dashed border-neutral-60 w-[100px] h-[100px] sm:w-[100px] md:w-[120px] lg:w-[150px] sm:h-[100px] md:h-[120px] lg:h-[150px] xl:h-[150px] 2xl:h-[160px]">
                      <label
                        htmlFor="fileUpload"
                        className="flex flex-col justify-center items-center cursor-pointer text-center">
                        {!previewVideo && (
                          <>
                            <img
                              alt=""
                              className="w-6 h-6"
                              src="path_to_your_icon"
                            />
                            <span className="text-primary-0 text-xs font-light mt-2 dark:text-primary-100">
                              Upload Video
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          id="fileUpload"
                          name="uploadUrlVideo"
                          onChange={handleChange}
                          multiple
                          accept="video/mp4"
                          className="hidden"
                        />

                        {previewVideo && (
                          <div className="mt-2 relative">
                            <video
                              src={previewVideo}
                              controls
                              alt="Preview"
                              className="w-40 sm:w-40 md:w-40 lg:w-[150px] xl:w-[150px] 2xl:w-[150px] h-40 sm:h-40 md:h-40 lg:h-[156px] xl:h-[156px] 2xl:h-[157px] -mt-2.5 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewVideo(null);
                                setVideo({ ...video, uploadUrlVideo: null });
                              }}
                              className="absolute top-0 right-0 m-0 -mt-3 bg-primary-50 text-white px-2 py-1 text-xs rounded">
                              x
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* video Name */}
              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Video Name
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-full text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Masukkan Nama Untuk Video Maximal 40 Huruf
                  </p>
                </div>

                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="text"
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]"
                      name="videoName"
                      value={video.videoName}
                      onChange={handleChange}
                      placeholder="Enter name...."
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Category
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-full text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Silahkan Pilih Kategori Yang Sesuai Dengan Video Anda.
                  </p>
                </div>

                <div className="flex justify-start items-center w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <select
                      name="category"
                      value={video.category}
                      onChange={(e) =>
                        setVideo((prevState) => ({
                          ...prevState,
                          category: e.target.value, // Update category inside video state
                        }))
                      }
                      className="w-full border-none focus:outline-none focus:ring-0 text-neutral-20 text-[12px] bg-transparent h-[40px] -ml-2 rounded-md">
                      <option value="" disabled>
                        Pick an option
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div
                    className="h-[48px] w-[48px] bg-blue-700 text-white flex items-center justify-center rounded-md shadow-md hover:bg-secondary-50 transition-colors duration-300 cursor-pointer ml-2 text-4xl"
                    onClick={() => setShowPopup(true)}>
                    +
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px]  font-bold text-neutral-20 dark:text-primary-100">
                      Deskripsi
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 mb-2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px]  xl:text-[12px]">
                    Berikan Deskripsi Pada video Anda Maximal 200 Huruf
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <textarea
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px] h-[48px] sm:h-[60px] md:h-[80px] lg:h-[80px] xl:h-[100px] bg-transparent"
                      name="description"
                      value={video.description}
                      onChange={handleChange}
                      placeholder="Deskripsi"
                      rows="4"
                    />
                  </label>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Price
                    </h3>
                  </div>
                  <p className="w-2/2 mb-2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Silahkan Masukkan Harga Untuk video jika asset gratis
                    silahkan dikosongkan.
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="number"
                      className="input border-0 focus:outline-none focus:ring-0  w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px]  xl:text-[14px]"
                      name="price"
                      value={video.price}
                      onChange={handleChange}
                      placeholder="Rp"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full inline-flex sm:gap-6 xl:gap-[21px] justify-center sm:justify-center md:justify-end  gap-6 mt-12 sm:mt-12 md:mt-14 lg:mt-14 xl:mt-12  ">
              <button
                onClick={handleCancel}
                className="btn bg-neutral-60 border-neutral-60 hover:bg-neutral-60 hover:border-neutral-60 rounded-lg  font-semibold   text-primary-100 text-center text-[10px]  sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px],  w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] ,  h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]">
                Cancel
              </button>
              <button
                type="submit"
                className="btn  bg-secondary-40 border-secondary-40 hover:bg-secondary-40 hover:border-secondary-40 rounded-lg  font-semibold leading-[24px]  text-primary-100 text-center  text-[10px]  sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px],  w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] ,  h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]">
                Save
              </button>
            </div>
          </form>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center  bg-gray-800 bg-opacity-50">
              <div className="bg-white dark:bg-neutral-20 p-6 rounded-2xl w-[510px] h-[250px] font-poppins text-black dark:text-white">
                <h1 className="h-7 font-semibold">Category</h1>
                <h2 className="h-14 flex items-center ">Add Category</h2>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="type here"
                  className="border border-[#ECECEC] w-full h-12 mb-1 rounded-lg text-sm text-black placeholder:font-semibold placeholder:opacity-40"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleCancel}
                    className="bg-[#9B9B9B] text-white h-12 px-4 py-2  rounded-lg">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn ${loading ? 'bg-gray-400' : 'bg-secondary-40'} border-secondary-40 hover:bg-secondary-40 hover:border-secondary-40 rounded-lg font-semibold leading-[24px] text-primary-100 text-center text-[10px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px] w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]`}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AddNewVideo;
