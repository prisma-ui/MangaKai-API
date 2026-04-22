const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

// Tambahkan penanganan error global
process.on("uncaughtException", (err) => {
  console.error("Ada error yang tidak tertangkap:", err);
  // Tidak exit process agar aplikasi tetap berjalan
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Tidak exit process agar aplikasi tetap berjalan
});

const app = express();
const port = process.env.PORT || 3001;
const rateLimiter = require("./middleware/rateLimiter");

app.use(rateLimiter);

// Middleware for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Komiku Rest API",
      version: "1.0.0",
      description: "API baca manga Komiku.",
    },
    servers: [
      {
        url: "https://mangakai-api.vercel.app", 
      },
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  // Menggunakan absolute path agar Vercel bisa menemukan file route
  apis: [path.join(__dirname, "routes", "*.js")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Konfigurasi CSS eksternal untuk mengatasi blank page di Vercel
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
  })
);

// Endpoint debugging untuk mengecek apakah JSON berhasil di-generate
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

const rekomendasiRoute = require("./routes/rekomendasi");
const terbaruRoute = require("./routes/terbaru");
const pustakaRouter = require("./routes/pustaka");
const komikPopulerRoute = require("./routes/komik-populer");
const detailKomikRoute = require("./routes/detail-komik");
const bacaChapterRoute = require("./routes/baca-chapter");
const searchRoute = require("./routes/search");
const berwarnaRoute = require("./routes/berwarna");
const genreAll = require("./routes/genre-all");
const genreDetail = require("./routes/genre-detail");
const genreRekomendasi = require("./routes/genre-rekomendasi");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Komiku Rest API",
    version: "1.0.0",
    endpoints: [
      "/rekomendasi",
      "/trending",
      "/terbaru-2",
      "/terbaru",
      "/pustaka",
      "/berwarna",
      "/komik-populer",
      "/detail-komik/:slug",
      "/baca-chapter/:slug/:chapter",
      "/search?q=keyword",
      "/genre-detail/:slug",
    ],
  });
});

app.use("/rekomendasi", rekomendasiRoute);
app.use("/terbaru", terbaruRoute);
app.use("/pustaka", pustakaRouter);
app.use("/komik-populer", komikPopulerRoute);
app.use("/detail-komik", detailKomikRoute);
app.use("/baca-chapter", bacaChapterRoute);
app.use("/search", searchRoute);
app.use("/berwarna", berwarnaRoute);
app.use("/genre-all", genreAll);
app.use("/genre-rekomendasi", genreRekomendasi);
app.use("/genre", genreDetail);

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});

module.exports = app;