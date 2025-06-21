const mongoose = require("mongoose");

const laporanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  judul: { type: String, required: true }, 
  kategori: { type: String, required: true },
  isi: { type: String, required: true },
  lokasi: { type: String },
  gambar: { type: String },
  status: {
    type: String,
    enum: ['terkirim', 'diproses', 'selesai'],
    default: 'terkirim'
  }
}, { timestamps: true });

module.exports = mongoose.model("Laporan", laporanSchema);
