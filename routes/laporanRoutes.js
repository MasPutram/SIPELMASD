const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isPetugasOrAdmin } = require("../middleware/isPetugasOrAdmin");
const {
  buatLaporan,
  getSemuaLaporan,
  updateStatusLaporan,
  updateLaporanSaya,
  deleteLaporanSaya,
  getLaporanSaya,
  getChartLaporan,
  deleteLaporanById
} = require("../controllers/laporanController");
const upload = require("../middleware/uploadMiddleware");



const router = express.Router();

router.post("/buat", protect, upload.single("gambar"), buatLaporan);
router.get("/semua", protect, isPetugasOrAdmin, getSemuaLaporan);
router.patch("/update-status/:id", protect, isPetugasOrAdmin, updateStatusLaporan);
router.get("/semua", protect, isPetugasOrAdmin, getSemuaLaporan);
router.get("/chart-laporan", protect, isPetugasOrAdmin, getChartLaporan);
router.delete("/delete/:id", protect, isPetugasOrAdmin, deleteLaporanById);


//masyarakat
router.get("/saya", protect, getLaporanSaya);
router.patch("/update-saya/:id", protect, updateLaporanSaya);
router.delete("/delete-saya/:id", protect, deleteLaporanSaya);







module.exports = router;
