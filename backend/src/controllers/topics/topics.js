import { Router } from "express";
import { createTopic, deleteTopic, getTopics, updateTopic } from "./functions.js";

const topicsRouter = Router();

// GET all Topics GET /topics/
topicsRouter.get("/", getTopics);

// POST create a Topic
topicsRouter.post("/", createTopic);

// PATCH update a Topic
topicsRouter.patch("/:id", updateTopic);

// DELETE remove a Topic
topicsRouter.delete("/:id", deleteTopic);

export default topicsRouter;
