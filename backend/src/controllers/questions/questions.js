import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestionById,
} from "./functions.js";

const questionsRouter = Router();

questionsRouter.get("/", getAllQuestions);

questionsRouter.get("/:id", getQuestionById);

questionsRouter.post("/:id", updateQuestionById);

questionsRouter.patch("/:id", updateQuestionById);

questionsRouter.post("/", createQuestion);

questionsRouter.delete("/:id", deleteQuestion);

export default questionsRouter;
