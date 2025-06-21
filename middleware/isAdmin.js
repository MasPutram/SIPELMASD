
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Hanya admin yang bisa akses" });
  }
  next();
};
