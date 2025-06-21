const Laporan = require("../models/Laporan");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Masyarakat kirim laporan
exports.buatLaporan = async (req, res) => {
  try {
    let { judul, kategori, isi, lokasi } = req.body;
    judul = DOMPurify.sanitize(judul);
    isi = DOMPurify.sanitize(isi);
    lokasi = DOMPurify.sanitize(lokasi);
    kategori = DOMPurify.sanitize(kategori);

    const gambar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const laporan = await Laporan.create({
      userId: req.user._id,
      judul,
      kategori,
      isi,
      lokasi,
      gambar,
    });

    res.status(201).json(laporan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin/Petugas ambil semua laporan
exports.getSemuaLaporan = async (req, res) => {
  const laporan = await Laporan.find().populate("userId", "fullName email");
  res.json(laporan);
};

// Update status laporan
exports.updateStatusLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    res.json({
      message: `Status laporan berhasil diupdate menjadi '${laporan.status}'`,
      laporan,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Gagal mengupdate status", error: err.message });
  }
};

// update laporan role masyarakat
exports.updateLaporanSaya = async (req, res) => {
  try {
    const laporan = await Laporan.findById(req.params.id);

    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    if (laporan.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Kamu tidak boleh edit laporan orang lain!" });
    }

    // Sanitize jika ada input teks
    if (req.body.judul) laporan.judul = DOMPurify.sanitize(req.body.judul);
    if (req.body.kategori)
      laporan.kategori = DOMPurify.sanitize(req.body.kategori);
    if (req.body.isi) laporan.isi = DOMPurify.sanitize(req.body.isi);
    if (req.body.lokasi) laporan.lokasi = DOMPurify.sanitize(req.body.lokasi);

    // Update gambar jika ada file baru diupload
    if (req.file) {
      laporan.gambar = `/uploads/${req.file.filename}`;
    }

    await laporan.save();

    res.json({ message: "Laporan berhasil diupdate", laporan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete laporan role masyarakat
exports.deleteLaporanSaya = async (req, res) => {
  try {
    const laporan = await Laporan.findById(req.params.id);

    if (!laporan)
      return res.status(404).json({ message: "Laporan tidak ditemukan" });

    if (laporan.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Kamu tidak boleh hapus laporan orang lain!" });
    }

    await laporan.deleteOne();

    res.json({ message: "Laporan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//info laporan sendiri
exports.getLaporanSaya = async (req, res) => {
  try {
    const laporanSaya = await Laporan.find({ userId: req.user.id });
    res.json(laporanSaya);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/chart-laporan
exports.getChartLaporan = async (req, res) => {
  try {
    const statusList = ["terkirim", "diproses", "ditolak", "selesai"];

    const data = await Promise.all(
      statusList.map(async (status) => {
        const count = await Laporan.countDocuments({ status });
        return { status, jumlah: count };
      })
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data chart" });
  }
};

// delete laporan petugas or admin
exports.deleteLaporanById = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndDelete(req.params.id);
    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }
    res.status(200).json({ message: "Laporan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus laporan", error: err.message });
  }
};

