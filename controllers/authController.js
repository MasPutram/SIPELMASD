const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔐 Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// 🧾 Register User (khusus masyarakat)
exports.registerUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { fullName, email, password, role } = req.body;
    const profileImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : "https://via.placeholder.com/150";

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // ❌ Cegah register sebagai admin/petugas
    if (role && role !== "masyarakat") {
      return res
        .status(403)
        .json({ message: "Hanya masyarakat yang boleh register di sini" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
      role: "masyarakat",
    });

    res.status(201).json({
      id: user._id,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
      token: generateToken(user),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// 🔑 Login User (admin/petugas)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    res.status(200).json({
      id: user._id,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Error login user", error: err.message });
  }
};

// 📄 Get Logged-in User Info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error mengambil data user", error: err.message });
  }
};

//update profile masyarakat
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.fullName = req.body.fullName || user.fullName;

    if (req.file) {
      user.profileImageUrl = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profil berhasil diupdate",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal update profil", error: err.message });
  }
};
