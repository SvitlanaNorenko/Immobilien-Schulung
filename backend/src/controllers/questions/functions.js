// src/controllers/questions.controller.js
import supabase from "../../supabaseClient.js";

/**
 * GET /questions
 * Returns all questions (no pagination or filtering)
 */
export async function getAllQuestions(req, res) {
  const { data, error } = await supabase
    .from("questions")
    .select("*,topics(id,name)")
    .order("id", { ascending: true });

  if (error) {
    console.log(error);
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
  const { text, answer, options, hasOptions, topic_id } = req.body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Question 'text' is required" });
  }

  if (!topic_id || typeof topic_id !== "number") {
    return res.status(400).json({ error: "Question 'topic_id' is required" });
  }

  if (
    !hasOptions &&
    (!answer || typeof answer !== "string" || !answer.trim())
  ) {
    return res.status(400).json({ error: "Question 'answer' is required" });
  }
  if (hasOptions && (!Array.isArray(options) || options.length < 2)) {
    return res
      .status(400)
      .json({ error: "'options' must be an array with at least two items" });
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      text: text.trim(),
      answer: answer.trim(),
      options,
      hasOptions,
      topic_id,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create question" });
  }

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topic_id)
    .single();

  data.topics = topic;

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

// home work
// It should update the question based on the question id and data
// it's a bit semilar to createQuestion, you jsut need to update the question instead of creating it. Use the id to update teh correct question
// the id will be passed in   const id = req.params.id;

export async function updateQuestionById(req, res) {
  const { id, hasOptions, topic_id, answer, options, text } = req.body || {}; //to be sure that it works without info inside

  if (!id || typeof id !== "number") {
    res.status(400).json({ error: "id is required" });
    return;
  }

  if (!hasOptions || typeof hasOptions !== "boolean") {
    res.status(400).json({ error: "hasOptions are required" });
    return;
  }

  if (!topic_id || typeof topic_id !== "number") {
    res.status(400).json({ error: "topic_id is required" });
    return;
  }

  if (hasOptions) {
    if (!options || !Array.isArray(options)) {
      res.status(400).json({ error: "options is required" });
      return;
    }
  } else {
    if (!answer || typeof answer !== "string") {
      res.status(400).json({ error: "answer is required" });
      return;
    }
  }

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const { data, error } = await supabase
    .from("questions")
    .update({ hasOptions, topic_id, answer, options, text })
    .eq("id", id)
    .select() //which field to give back
    .single(); //only 1 question, not the whole arr

  if (error) {
    res.status(500).end();
    return;
  }

  res.status(200).json({ updated: true, question: data });
}
