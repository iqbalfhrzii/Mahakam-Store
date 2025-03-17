import fetch from "node-fetch";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
process.removeAllListeners("warning");

export const downloadAndProcessFile = async (req, res) => {
  const { fileUrl, size } = req.query;

  console.log(`File URL yang diterima: ${fileUrl}`);

  if (!fileUrl) {
    return res.status(400).json({ error: "URL file tidak diberikan" });
  }

  const validSizes = [
    "Original (6000x4000)",
    "Large (1920x1280)",
    "Medium (1280x1280)",
    "Small (640x427)",
    "SD (360x640)",
    "SD (540x960)",
    "HD (720x1280)",
    "Full HD (1080x1920)",
    "Quad HD (1440x2560)",
    "4K UHD (2160x3840)",
  ];

  if (size && !validSizes.includes(size)) {
    return res.status(400).json({ error: "Ukuran tidak valid" });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Gagal mengambil file dari URL" });
    }

    const contentType = response.headers.get("content-type");
    const fileName = fileUrl.split("/").pop().split("?")[0];
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer); // Konversi ke Buffer

    if (contentType.startsWith("audio/")) {
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      return res.send(fileBuffer);
    }

    // Process .zip files 
    if (fileName.includes(".zip")) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      return res.send(fileBuffer);
    }

    let fileExtension = "";
    if (contentType.startsWith("image/")) {
      fileExtension = contentType.split("/")[1];
    } else if (contentType.startsWith("video/")) {
      fileExtension = "mp4";
    }

    if (contentType.startsWith("image/")) {
      let processedImage = fileBuffer;

      if (size && size !== "Original (6000x4000)") {
        const dimensions = {
          "Large (1920x1280)": { width: 1920, height: 1280 },
          "Medium (1280x1280)": { width: 1280, height: 1280 },
          "Small (640x427)": { width: 640, height: 427 },
        };

        const { width, height } = dimensions[size] || {};
        if (width && height) {
          processedImage = await sharp(fileBuffer)
            .resize(width, height)
            .toBuffer();
        }
      }

      res.setHeader("Content-Type", contentType || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}.${fileExtension}"`
      );
      return res.send(processedImage);
    } else if (contentType.startsWith("video/")) {
      const localPath = path.resolve("./localVideo.mp4");
      fs.writeFileSync(localPath, fileBuffer);

      const resolutionMapping = {
        "SD (360x640)": "640x360",
        "SD (540x960)": "960x540",
        "HD (720x1280)": "1280x720",
        "Full HD (1080x1920)": "1920x1080",
        "Quad HD (1440x2560)": "2560x1440",
        "4K UHD (2160x3840)": "3840x2160",
      };

      const resolution = resolutionMapping[size] || null;
      const localOutputPath = path.resolve("./localOutput.mp4");

      const ffmpegProcess = ffmpeg(localPath);
      if (resolution) {
        ffmpegProcess.outputOptions([
          `-vf scale=${resolution.split("x").join(":")}`,
          "-preset fast",
        ]);
      }

      ffmpegProcess
        .output(localOutputPath)
        .on("end", () => {
          res.setHeader(
            "Content-Type",
            contentType || "application/octet-stream"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}.${fileExtension}"`
          );

          res.sendFile(localOutputPath, {}, (err) => {
            if (err) console.error("Error sending file:", err);

            // Delay unlinking to ensure the file is no longer in use
            setTimeout(() => {
              try {
                if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
                if (fs.existsSync(localOutputPath)) fs.unlinkSync(localOutputPath);
              } catch (error) {
                console.error("Error deleting files:", error.message);
              }
            }, 500); // Adjust delay as necessary
          });
        })
        .on("error", (err) => {
          console.error("Error processing video with ffmpeg:", err);
          // Clean up input file even if processing fails
          setTimeout(() => {
            try {
              if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
            } catch (error) {
              console.error("Error deleting input file:", error.message);
            }
          }, 500);
          res.status(500).json({ error: "Video processing failed" });
        })
        .run();

    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      error: "Terjadi kesalahan saat memproses permintaan",
      message: error.message,
    });
  }
};
