exports.isPetugasOrAdmin = (req, res, next) => {
  if (req.user.role === 'petugas' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: "Hanya petugas atau admin yang bisa akses" });
};

