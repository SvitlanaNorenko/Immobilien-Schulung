import { config } from "dotenv";
import initializeBot from "./bot.js";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import topicsRouter from "./controllers/topics/topics.js";
import questionsRouter from "./controllers/questions/questions.js";
import openapiDoc from "./docs/swagger.js";
import getStatistics from "./controllers/statistics/statistics.js";

config(); //include dotenv library to use var - env and read this file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/topics", topicsRouter);

app.use("/questions", questionsRouter);

app.get("/statistics", getStatistics);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Health
app.get("/", (_req, res) => res.json({ ok: true, message: "API running" }));

app.listen(PORT, () => {
  initializeBot();

  console.log(`AP
    I on http://localhost:${PORT}`);
});
