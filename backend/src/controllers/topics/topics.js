import { Router } from "express";
import { createTopic, deleteTopic, getTopics } from "./functions.js";

const topicsRouter = Router();

// GET all Topics
topicsRouter.get("/", getTopics);

// POST create a Topic
topicsRouter.post("/", createTopic);

// DELETE remove a Topic
topicsRouter.delete("/:id", deleteTopic);

export default topicsRouter;
