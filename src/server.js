const express = require("express");
const dotenv = require("dotenv");
const { loadSecrets } = require("./config/secrets");
const { connectDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "OK", timestamp: new Date().toISOString() },
    error: null,
    meta: {},
  });
});

app.use("/api/v1/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await loadSecrets();

  const PORT = process.env.PORT || 3000;

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

start();
