/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addDoc,
  doc,
  Timestamp,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, storage, auth } from "../../../firebase/firebaseConfig";
import Breadcrumb from "../../breadcrumbs/Breadcrumbs";
import IconField from "../../../assets/icon/iconField/icon.svg";
import HeaderNav from "../../HeaderNav/HeaderNav";

function EditNewAudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const [imagePreview, setImagePreview] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const categories = [
    { id: 1, name: "Audio Effects" },
    { id: 2, name: "Background Music" },
    { id: 3, name: "Voice Overs" },
    { id: 4, name: "Sound Design" },
  ];
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  const [audio, setAudio] = useState({
    audioName: "",
    category: "",
    description: "",
    price: "",
    uploadUrlAudio: null,
    audioThumbnail: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const adminQuery = query(
          collection(db, "admins"),
          where("uid", "==", currentUser.uid)
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          setRole(adminData.role);
        } else {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", currentUser.uid)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            setRole("user");
          }
        }
      } else {
        setUser(null);
        setRole("");
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const docRef = doc(db, "assetAudios", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAudio(data);
          if (data.audioThumbnail) {
            setPreviewImages(data.audioThumbnail);
          }
        } else {
          navigate("/manage-asset-audio");
        }
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    };

    fetchAudio();
  }, [id, navigate]);

  const [error, setError] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files[0]; // Mengambil file pertama yang diunggah

    if (name === "audioFile" && file) {
      // Cek apakah file adalah file ZIP berdasarkan tipe dan nama file
      if (file.type !== "mp3" && !file.name.endsWith(".mp3")) {
        setError("File yang diunggah harus berformat .mp3");
        setAudio({
          ...audio,
          uploadUrlAudio: null,
        });
        setFileSize(null);
        event.target.value = null; // Reset input file
        return;
      } else {
        setError(null); // Reset error jika file sesuai
        setAudio({
          ...audio,
          uploadUrlAudio: file,
        });
      }

      // Konversi ukuran file ke dalam format yang lebih mudah dibaca
      let size = file.size; // Ukuran file dalam bytes
      let unit = "Bytes";

      if (size >= 1073741824) {
        size = (size / 1073741824).toFixed(2); // Konversi ke GB
        unit = "GB";
      } else if (size >= 1048576) {
        size = (size / 1048576).toFixed(2); // Konversi ke MB
        unit = "MB";
      } else if (size >= 1024) {
        size = (size / 1024).toFixed(2); // Konversi ke KB
        unit = "KB";
      }

      setFileSize(`${size} ${unit}`);
    } else {
      setAudio({
        ...audio,
        [name]: event.target.value,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "audioThumbnail" && files.length > 0) {
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

      setAudio({
        ...audio,
        audioThumbnail: Array.from(files),
      });
    } else {
      setAudio({
        ...audio,
        [name]: value,
      });
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setAudio((prevAudio) => ({
      ...prevAudio,
      audioThumbnail: Array.isArray(prevAudio.audioThumbnail)
        ? prevAudio.audioThumbnail.filter((_, i) => i !== index)
        : [],
    }));
  };

  // Fungsi untuk upload file dan mendapatkan URL download
  const uploadFile = async (file, path) => {
    try {
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      console.log("File uploaded successfully, URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error.message || error);
      throw new Error("Gagal mengunggah file. Silakan coba lagi.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceAsNumber = parseInt(audio.price);
      if (isNaN(priceAsNumber)) {
        throw new Error("Harga tidak valid: harus berupa angka.");
      }

      const updatedData = {
        category: audio.category,
        createdAt: Timestamp.now(),
        audioFile: "",
        audioThumbnail: [],
        audioName: audio.audioName,
        description: audio.description,
        price: priceAsNumber,
        uploadedByEmail: user.email,
        userId: user.uid,
      };

      // Upload file ZIP ke folder /images-audio jika ada
      if (audio.uploadUrlAudio) {
        const filePath = `images-audio/audio-${id}.mp3`; // Path folder baru
        const uploadUrlAudioUrl = await uploadFile(
          audio.uploadUrlAudio,
          filePath
        );
        updatedData.uploadUrlAudio = uploadUrlAudioUrl;
      }

      // Upload thumbnails jika ada
      if (audio.audioThumbnail && audio.audioThumbnail.length > 0) {
        const thumbnailUrls = await Promise.all(
          audio.audioThumbnail.map((thumbnail, index) => {
            const thumbnailPath = `images-audio/audio-${id}-${index}.jpg`;
            return uploadFile(thumbnail, thumbnailPath);
          })
        );
        updatedData.audioThumbnail = thumbnailUrls; // Menyimpan semua URL thumbnail
      }

      const audioRef = doc(db, "assetAudios", id);
      await updateDoc(audioRef, updatedData);

      setAlertSuccess(true);
      setTimeout(() => {
        navigate("/manage-asset-audio");
      }, 2000);
    } catch (error) {
      console.error("Error updating audio:", error.message || error);
      setAlertError(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (path) => {
    const fileRef = ref(storage, path);
    try {
      await deleteObject(fileRef);
      console.log("File deleted successfully:", path);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const closeAlert = () => {
    setAlertError(false);
  };

  return (
    <>
      <div className="bg-primary-100 dark:bg-neutral-20 font-poppins h-full min-h-screen">
        <div className="bg-primary-100 p-4 mt-14">
          <HeaderNav />
        </div>

        <div className="overflow-scroll">
          <div className="bg-primary-100 dark:bg-neutral-20 dark:text-primary-100 flex flex-col">
            <div className="text-2xl dark:text-primary-100 p-4">
              <Breadcrumb />
            </div>
          </div>

          {alertSuccess && (
            <div
              role="alert"
              className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[300px] md:w-[400px] lg:w-[400px] xl:w-[400px] 2xl:w-[400px] text-[10px] sm:text-[10px] md:text-[10px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] -translate-y-1/2 z-50 p-4 bg-success-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
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
                <span>Audio berhasil diperbarui.</span>
              </div>
            </div>
          )}

          {alertError && (
            <div
              role="alert"
              className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[340px] sm:w-[300px] md:w-[400px] lg:w-[400px] xl:w-[400px] 2xl:w-[400px] text-[8px] sm:text-[10px] md:text-[10px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] -translate-y-1/2 z-50 p-4 bg-primary-60 text-white text-center shadow-lg cursor-pointer transition-transform duration-500 ease-out rounded-lg"
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
                <span>Gagal memperbarui audio silahkan coba lagi</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mx-0 sm:mx-0 md:mx-0 lg:mx-0 xl:mx-28 2xl:mx-24 h-[1434px] gap-[50px] overflow-hidden mt-4 sm:mt-0 md:mt-0 lg:-mt-0 xl:mt-0 2xl:-mt-0"
          >
            <h1 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-10 dark:text-primary-100 p-4">
              Edit Audio
            </h1>
            <div className="p-8 -mt-4 bg-primary-100 dark:bg-neutral-20 rounded-sm shadow-lg">
              <h2 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                Audio Information
              </h2>

              <div className="flex flex-col md:flex-row md:gap-[140px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-[150px] md:w-[170px] lg:w-[200px] xl:w-[220px] 2xl:w-[170px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Upload File
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px] mb-2">
                    Format file harus .mp3
                  </p>
                </div>

                <div>
                  <input
                    className="block min-w-full sm:w-[150px] md:w-[450px] lg:w-[670px] xl:w-[850px] 2xl:w-[1200px] text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="file_input"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    name="uploadUrlAudio"
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
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Edit Thumbnail Audio
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px] mb-2">
                    Format thumbnail harus .jpg, jpeg, png dan ukuran minimal
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
                            name="audioThumbnail"
                            onChange={handleChange}
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

              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Audio Name
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 2xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:h-3 -mt-5"
                    />
                  </div>
                  <p className="w-full text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Masukkan Nama Untuk Audio Maximal 40 Huruf
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="text"
                      name="audioName"
                      value={audio.audioName}
                      onChange={handleChange}
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]"
                      placeholder="Enter name...."
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Category
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3  h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:w-3 -mt-5"
                    />
                  </div>
                  <p className="w-full text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Silahkan Pilih Kategori Yang Sesuai Dengan Audio Anda.
                  </p>
                </div>

                <div className="flex justify-start items-center w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <select
                      name="category"
                      value={audio.category}
                      onChange={(e) =>
                        setAudio((prevState) => ({
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
                </div>
              </div>

              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Deskripsi
                    </h3>
                    <img
                      src={IconField}
                      alt=""
                      className="w-2 sm:w-2 md:w-3 lg:w-3 xl:w-3 h-2 sm:h-2 md:h-3 lg:h-3 xl:h-3 2xl:w-3 -mt-5"
                    />
                  </div>
                  <p className="w-2/2 mb-2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Berikan Deskripsi Pada Audio Anda Maximal 200 Huruf
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <textarea
                      name="description"
                      value={audio.description}
                      onChange={handleChange}
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px] h-[48px] sm:h-[60px] md:h-[80px] lg:h-[80px] xl:h-[100px] bg-transparent"
                      placeholder="Deskripsi"
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row sm:gap-[140px] md:gap-[149px] lg:gap-[150px] mt-4 sm:mt-10 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10">
                <div className="w-full sm:w-full md:w-[280px] lg:w-[290px] xl:w-[350px] 2xl:w-[220px]">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[14px] font-bold text-neutral-20 dark:text-primary-100">
                      Price
                    </h3>
                  </div>
                  <p className="w-2/2 mb-2 text-neutral-60 dark:text-primary-100 mt-4 text-justify text-[10px] sm:text-[10px] md:text-[12px] lg:text-[14px] xl:text-[12px]">
                    Silahkan Masukkan Harga Untuk Audio jika asset gratis
                    silahkan dikosongkan.
                  </p>
                </div>
                <div className="flex justify-start items-start w-full sm:-mt-40 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0">
                  <label className="input input-bordered flex items-center gap-2 w-full h-auto border border-neutral-60 rounded-md p-2 bg-primary-100 dark:bg-neutral-20 dark:text-primary-100">
                    <input
                      type="number"
                      name="price"
                      value={audio.price}
                      onChange={handleChange}
                      className="input border-0 focus:outline-none focus:ring-0 w-full text-neutral-20 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]"
                      placeholder="Rp"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="w-full inline-flex sm:gap-6 xl:gap-[21px] justify-center sm:justify-center md:justify-end gap-6 mt-12 sm:mt-12 md:mt-14 lg:mt-14 xl:mt-12">
              <button
                type="button"
                onClick={handleCancel}
                className="btn bg-neutral-60 border-neutral-60 hover:bg-neutral-60 hover:border-neutral-60 rounded-lg font-semibold text-primary-100 text-center text-[10px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[14px] 2xl:text-[14px] w-[90px] sm:w-[150px] md:w-[200px] xl:w-[200px] 2xl:w-[200px] h-[30px] sm:h-[50px] md:h-[60px] lg:w-[200px] lg:h-[60px] xl:h-[60px] 2xl:h-[60px]"
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

export default EditNewAudio;
