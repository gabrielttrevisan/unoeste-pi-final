import express from "express";
import cors from "cors";
import personRouter from "./router/person.router.js";
import housingRouter from "./router/housing.router.js";

const PORT = 3004;
const FRONTEND_URL = "http://localhost:3000";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL }));

app.use("/pessoas", personRouter);
app.use("/imoveis", housingRouter);

app.use((_, res) => {
  res.status(404).json({
    data: null,
    error: {
      code: "NOT_FOUND",
      message: "Resource Not Found",
    },
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message ?? "Internal Server Error",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Listening on PORT ${PORT}...`);
});
