const User = require("../models/User"); 

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Jangan tampilkan password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data user", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  res.json({ message: "User berhasil dihapus" });
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalLaporan = await Laporan.countDocuments();

    const laporanDiproses = await Laporan.countDocuments({ status: "diproses" });

    // Hitung semua user selain admin
    const totalUser = await User.countDocuments({ role: { $ne: "admin" } });

    res.json({
      totalLaporan,
      laporanDiproses,
      totalUser,
    });
  } catch (err) {
    console.error("Statistik error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
