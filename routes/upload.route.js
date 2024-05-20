const express = require("express");

const multer = require("multer");

const os = require("os");

const router = express.Router();

const { uploadFile, getFiles } = require("../controller/upload.controller.js");

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, callback) => callback(null, `${file.originalname}`),
});

const upload = multer({ storage: storage });

router.get("/getFromDrive", getFiles);
router.post("/uploadToDrive", upload.single("drive_file"), uploadFile);

module.exports = router;
