// src/controllers/questions.controller.js
import supabase from "../../supabaseClient.js";

/**
 * GET /questions
 * Returns all questions (no pagination or filtering)
 */
export async function getAllQuestions(req, res) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch questions" });
  }

  // if data return data else return empty array []
  res.json(data ?? []);
}

/**
 * GET /questions/:id
 * Returns a single question by ID
 */
export async function getQuestionById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Valid numeric 'id' is required" });
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // If we don't fidn the question
    if (error.code === "PGRST116") {
      return res.status(404).json({ error: "Question not found" });
    }
    return res.status(500).json({ error: "Failed to fetch question" });
  }

  res.json(data);
}

/**
 * POST /questions
 * Creates a new question
 * Body: { text: string, answer: string, options: string[] }
 */
export async function createQuestion(req, res) {
  const { text, answer, options } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Question 'text' is required" });
  }
  if (!answer || typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({ error: "Question 'answer' is required" });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ error: "'options' must be an array with at least two items" });
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({ text: text.trim(), answer: answer.trim(), options })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to create question" });
  }

  res.status(201).json(data);
}

/**
 * DELETE /questions/:id
 * Deletes a question by ID
 */
export async function deleteQuestion(req, res) {
  const id = Number(req.params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Valid numeric 'id' is required" });
  }

  const { data, error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({ error: "Question not found" });
    }
    return res.status(500).json({ error: "Failed to delete question" });
  }

  res.json({ deleted: true, question: data });
}
