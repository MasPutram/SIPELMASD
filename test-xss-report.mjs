// test-xss-report.mjs
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import assert from "assert";

// Setup axios + cookie jar
const jar = new CookieJar();
const client = wrapper(
  axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
    jar,
  })
);

const dummyUser = {
  email: "admin@sipelmasd.com",
  password: "admin123",
};

try {
  // 1. Login dulu
  const loginRes = await client.post("/api/auth/login", dummyUser);
  const token = loginRes.data.token;

  // 2. Ambil CSRF token
  const csrfRes = await client.get("/api/csrf-token");
  const csrfToken = csrfRes.data.csrfToken;

  // 3. Kirim data XSS
  const xssPayload = `Halo! <script>alert("XSS")</script>`;

  const reportRes = await client.post(
    "/api/laporan/buat",
    {
      judul: xssPayload,
      kategori: "keamanan",
      isi: xssPayload,
      lokasi: xssPayload,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Authorization: `Bearer ${token}`, // <== token dikirim di sini
      },
    }
  );

  const data = reportRes.data;

  // 4. Cek hasil sanitasi
  assert(!data.judul.includes("<script>"), "Sanitasi gagal di judul");
  assert(!data.isi.includes("<script>"), "Sanitasi gagal di isi");
  assert(!data.lokasi.includes("<script>"), "Sanitasi gagal di lokasi");

  console.log("✅ Passed: XSS berhasil difilter");
  console.log("🧼 Cleaned data:", data);
} catch (err) {
  console.error("❌ Test Gagal:", err.response?.data || err.message);
}
