import { config } from "dotenv";
import { initializeBot } from "./bot.js";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import topicsRouter from "./controllers/topics/topics.js";
import questionsRouter from "./controllers/questions/questions.js";
import openapiDoc from "./docs/swagger.js";

config(); //include dotenv library to use var - env and read this file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/topics", topicsRouter);
app.use("/topics", questionsRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Health
app.get("/", (_req, res) => res.json({ ok: true, message: "API running" }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`API on http://localhost:${process.env.PORT || 3000}`);
  initializeBot();
});
