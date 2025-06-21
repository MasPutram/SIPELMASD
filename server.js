require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");

const connectDB = require("./config/db");
const schema = require("./graphql/schema");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// 📁 Pastikan folder uploads ada
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 🔌 Connect ke MongoDB
connectDB();

// 🌐 Middleware Global
const allowedOrigins = [
  "http://localhost:5173",
  "https://sipelmasd.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Untuk request seperti curl atau Postman yang tidak punya origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS blocked: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// 📂 Serve folder /uploads untuk akses gambar
app.use("/uploads", express.static("uploads"));

// 🚪 ROUTE BEBAS CSRF
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// 🔮 GraphQL BEBAS CSRF (TARUH SEBELUM csrf middleware)
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// ✅ PASANG MIDDLEWARE CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});

app.use(csrfProtection);

// 🧪 Endpoint untuk ambil CSRF Token
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 🔐 ROUTE YANG BUTUH CSRF
app.use("/api/laporan", laporanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", adminRoutes); // kalau emang mau digabung di adminRoutes

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
