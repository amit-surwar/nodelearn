const express = require("express");
const dotenv = require("dotenv");
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

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
});
