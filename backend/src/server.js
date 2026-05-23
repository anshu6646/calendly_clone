const express = require("express");
const cors = require("cors");
require("dotenv").config();

const eventRoutes = require("./routes/eventRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const publicRoutes = require("./routes/publicRoutes");
const meetingRoutes = require("./routes/meetingRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://romantic-nature-production-ecf4.up.railway.app"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "calendly-clone-api" });
});

app.use("/api/event-types", eventRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/meetings", meetingRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
