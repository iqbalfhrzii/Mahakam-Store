/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  Timestamp,
  doc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, storage, auth } from "../../../firebase/firebaseConfig";
import Breadcrumb from "../../breadcrumbs/Breadcrumbs";
import IconField from "../../../assets/icon/iconField/icon.svg";
import HeaderNav from "../../HeaderNav/HeaderNav";

function AddNewAsset2D() {
  const [user, setUser] = useState(null);
  const [asset2D, setAsset2D] = useState({
    asset2DName: "",
    category: "",
    description: "",
    price: "",
    asset2DFile: null,
    asset2DThumbnail: [],
  });
  const navigate = useNavigate();
  //const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const categories = [
    { id: 1, name: "Characters" },
    { id: 2, name: "Environment" },
    { id: 3, name: "Fonts" },
    { id: 4, name: "GUI" },
    { id: 5, name: "Textures & Materials" },
  ];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the logged-in user
      } else {
        setUser(null); // No user is logged in
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "asset2DThumbnail" && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = [];

      newFiles.forEach((file) => {
        if (file.type.includes("image")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            if (newPreviews.length === newFiles.length) {
              setPreviewImages((prevImages) => [...prevImages, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        } else {
          setPreviewImages([]);
        }
      });

      setAsset2D({
        ...asset2D,
        asset2DThumbnail: Array.from(files),
      });
    } else {
      setAsset2D({
        ...asset2D,
        [name]: value,
      });
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setAsset2D((prevDataset) => ({
      ...prevDataset,
      asset2DThumbnail: Array.isArray(prevDataset.asset2DThumbnail)
        ? prevDataset.asset2DThumbnail.filter((_, i) => i !== index)
        : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Konversi asset2D.price menjadi number
      const priceAsNumber = parseInt(asset2D.price);

      if (isNaN(priceAsNumber)) {
        // Validasi jika harga yang diinput tidak valid
        throw new Error("Invalid price: must be a number.");
      }

      // Save asset2D details to Firestore
      const docRef = await addDoc(collection(db, "assetImage2D"), {
        category: asset2D.category,
        createdAt: Timestamp.now(),
        asset2DFile: "",
        asset2DThumbnail: [],
        asset2DName: asset2D.asset2DName,
        description: asset2D.description,
        price: priceAsNumber, // Simpan sebagai number
        uploadedByEmail: user.email,
        userId: user.uid,
      });

      const docId = docRef.id;

      // Upload ASSET2D image/file to Firebase Storage
      let asset2DFileUrl = "";
      if (asset2D.asset2DFile) {
        // Ref untuk upload file ke Storage dengan ekstensi asli
        const asset2DRef = ref(storage, `images-asset-2d/asset2D-${docId}.zip`);

        // Upload file ke Storage
        await uploadBytes(asset2DRef, asset2D.asset2DFile);
        asset2DFileUrl = await getDownloadURL(asset2DRef);
      }

      let asset2DThumbnailUrls = [];
      if (asset2D.asset2DThumbnail && asset2D.asset2DThumbnail.length > 0) {
        const thumbnailPromises = asset2D.asset2DThumbnail.map(
          async (thumbnailFile, index) => {
            const thumbnailRef = ref(
              storage,
              `images-asset-2d/asset2D-${docId}-thumbnail-${index}.jpg`
            );
            await uploadBytes(thumbnailRef, thumbnailFile);
            const downloadUrl = await getDownloadURL(thumbnailRef);
            return downloadUrl;
          }
        );
        asset2DThumbnailUrls = await Promise.all(thumbnailPromises);
      }

      // Update Firestore dengan URL gambar yang diupload
      await updateDoc(doc(db, "assetImage2D", docId), {
        asset2DFile: asset2DFileUrl,
        asset2DThumbnail: asset2DThumbnailUrls,
      });

      // Reset the form
      setAsset2D({
        asset2DName: "",
        category: "",
        description: "",
        price: "",
        asset2DFile: null,
        asset2DThumbnail: [],
      });
      setPreviewImages([]); // clear previews

      // Navigasi kemnali ke  /manage-asset-asset2D
      setAlertSuccess(true);
      setTimeout(() => {
        navigate("/manage-asset-2D");
      }, 2000);
    } catch (error) {
      console.error("Error menambahkan asset2D: ", error);
      setAlertError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage-asset-2D");
  };

  const closeAlert = () => {
    setAlertError(false);
  };

  const [fileSize, setFileSize] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const { name, value, files } = event.target;
    const file = event.target.files[0];

    if (name === "asset2DFile" && files[0]) {
      setAsset2D({
        ...asset2D,
        asset2DFile: files[0],
      });
    } else {
      setAsset2D({
        ...asset2D,
        [name]: value,
      });
    }

    if (file) {
      if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
        setError("File yang diunggah harus berformat .zip");
        setFileSize(null);
        event.target.value = null;
        return;
      } else {
        setError(null); // Reset error jika file sesuai
      }

      let size = file.size; // Ukuran file dalam bytes
      let unit = "Bytes";

      if (size >= 1073741824) {
        // Lebih besar atau sama dengan 1 GB
        size = (size / 1073741824).toFixed(2);
        unit = "GB";
      } else if (size >= 1048576) {
        // Lebih besar atau sama dengan 1 MB
        size = (size / 1048576).toFixed(2);
        unit = "MB";
      } else if (size >= 1024) {
        // Lebih besar atau sama dengan 1 KB
        size = (size / 1024).toFixed(2);
        unit = "KB";
      }

      setFileSize(`${size} ${unit}`);
    } else {
      setFileSize(null);
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
              onClick={closeAlert}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Asset 2D baru berhasil ditambahkan dan tersimpan.</span>
              </div>
            </div>
          )}

          {/* Alert Error */}
          {alertError && (
            <div
              role="alert"
              className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[340px] sm:w-[300px] md:w-[400px] lg:w-[400px] xl:w-[400px] 2xl:w-[400px] text-[8px] sm:text-[10px] md:text-[10px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] -translate-y-1/2 z-50 p-4  bg-primary-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
              onClick={closeAlert}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Gagal menambahkan Asset 2D baru silahkan coba lagi</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mx-0 sm:mx-0 md:mx-0 lg:mx-0 xl:mx-28 2xl:mx-24   h-[1434px] gap-[50px]  overflow-hidden  mt-4 sm:mt-0 md:mt-0 lg:-mt-0 xl:mt-0 2xl:-mt-0"
          >
            <h1 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-10 dark:text-primary-100 p-4">
              Add New Asset 2D
            </h1>
            <div className="p-8 -mt-4  bg-primary-100  dark:bg-neutral-20 rounded-sm shadow-lg">
              <h2 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                Asset 2D Information
              </h2>

              <div className="flex flex-col md:flex-row md:gap-[140px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-[150px] md:w-[170px] lg:w-[200px] xl:w-[220px] 2xl:w-[170px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Upload File
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px]  xl:text-[12px] mb-2">
                    Format file harus .zip
                  </p>
                </div>

                <div>
                  <input
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="file_input"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    name="asset2DFile"
                  />
                  {error && (
                    <p className="text-red-500 mt-1 text-sm">{error}</p>
                  )}
                  {fileSize && (
                    <p className="mt-1 text-sm">Ukuran file: {fileSize}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:gap-[140px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-[150px] md:w-[170px] lg:w-[200px] xl:w-[220px] 2xl:w-[170px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]  xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Upload Thumbnail Asset 2D
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px]  xl:text-[12px] mb-2">
                    Format thumbnail harus .jpg, .jpeg, .png dan ukuran minimal
                    300 x 300 px.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="p-0 flex flex-col items-center">
                    <div className="mt-2 relative flex flex-row items-center gap-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-40 h-40 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded"
                          >
                            X
                          </button>
                        </div>
                      ))}

                      <div className="flex flex-col justify-center items-center text-center border border-dashed border-neutral-60 w-[100px] h-[100px] sm:w-[100px] md:w-[120px] lg:w-[150px] sm:h-[100px] md:h-[120px] lg:h-[150px]">
                        <label
                          htmlFor="fileUpload"
                          className="cursor-pointer flex flex-col justify-center items-center"
                        >
                          <img
                            alt=""
                            className="w-6 h-6"
                            src="path_to_your_icon"
                          />
                          <span className="text-primary-0 text-xs font-light mt-2 dark:text-primary-100">
                            Upload Thumbnails
                          </span>
                          <input
                            type="file"
                            id="fileUpload"
                            name="asset2DThumbnail"
                            onChange={handleChange}
                            //value={asset2D.asset2DThumbnail}
                            accept=".jpg,.jpeg,.png"
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* asset2D Name */}
              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Asset 2D Name
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-full text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Masukkan Nama Untuk Asset 2D Maximal 40 Huruf
                  </p>
                </div>

                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="text"
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]"
                      name="asset2DName"
                      value={asset2D.asset2DName}
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
                    Silahkan Pilih Kategori Yang Sesuai Dengan Asset 2D Anda.
                  </p>
                </div>

                <div className="flex justify-start items-center w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <select
                      name="category"
                      value={asset2D.category}
                      onChange={(e) =>
                        setAsset2D((prevState) => ({
                          ...prevState,
                          category: e.target.value,
                        }))
                      }
                      className="w-full border-none focus:outline-none focus:ring-0 text-neutral-20 text-[12px] bg-transparent h-[40px] -ml-2 rounded-md"
                    >
                      <option value="" disabled>
                        Pick an option
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {/* 
                  <div className="h-[48px] w-[48px] bg-blue-700 text-white flex items-center justify-center rounded-md shadow-md hover:bg-secondary-50 transition-colors duration-300 cursor-pointer ml-2 text-4xl">
                    +
                  </div> */}
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
                    Berikan Deskripsi Pada Asset 2D Anda Maximal 200 Huruf
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <textarea
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px] h-[48px] sm:h-[60px] md:h-[80px] lg:h-[80px] xl:h-[100px] bg-transparent"
                      name="description"
                      value={asset2D.description}
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
                    Silahkan Masukkan Harga Untuk Asset 2D jika asset gratis
                    silahkan dikosongkan.
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="number"
                      className="input border-0 focus:outline-none focus:ring-0  w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px]  xl:text-[14px]"
                      name="price"
                      value={asset2D.price}
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
                className="btn bg-neutral-60 border-neutral-60 hover:bg-neutral-60 hover:border-neutral-60 rounded-lg  font-semibold   text-primary-100 text-center text-[10px]  sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px],  w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] ,  h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn ${
                  loading ? "bg-gray-400" : "bg-secondary-40"
                } border-secondary-40 hover:bg-secondary-40 hover:border-secondary-40 rounded-lg font-semibold leading-[24px] text-primary-100 text-center text-[10px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px] w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddNewAsset2D;
