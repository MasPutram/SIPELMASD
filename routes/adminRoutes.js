const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");
const { isPetugasOrAdmin } = require("../middleware/isPetugasOrAdmin");
const upload = require("../middleware/uploadMiddleware");

const User = require("../models/User");
const Laporan = require("../models/Laporan");

// =====================================
// ✅ [USER MANAGEMENT]
// =====================================

// Admin bisa ambil semua user
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data pengguna", error: err.message });
  }
});

// Petugas hanya bisa lihat masyarakat
router.get("/masyarakat-only", protect, isPetugasOrAdmin, async (req, res) => {
  try {
    const masyarakat = await User.find({ role: "masyarakat" }).select(
      "-password"
    );
    res.json(masyarakat);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data masyarakat", error: err.message });
  }
});

// Hapus user (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menghapus user", error: err.message });
  }
});

// =====================================
// ✅ [REGISTER PETUGAS] - Only ADMIN
// =====================================
router.post(
  "/register-petugas",
  protect,
  isAdmin,
  upload.single("profileImage"),
  async (req, res) => {
    const { fullName, email, password } = req.body;
    const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      const user = await User.create({
        fullName,
        email,
        password,
        profileImageUrl,
        role: "petugas",
      });

      res.status(201).json({
        message: "Petugas berhasil dibuat",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Gagal membuat petugas", error: err.message });
    }
  }
);

// =====================================
// ✅ [DASHBOARD STATS] - ADMIN / PETUGAS
// =====================================
router.get("/dashboard-stats", protect, isPetugasOrAdmin, async (req, res) => {
  try {
    const totalLaporan = await Laporan.countDocuments();
    const laporanPerluDiproses = await Laporan.countDocuments({
      status: "terkirim",
    });
    const totalUser = await User.countDocuments({ role: { $ne: "admin" } });

    res.json({
      totalLaporan,
      laporanPerluDiproses,
      totalUser,
    });
  } catch (err) {
    console.error("Statistik error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
