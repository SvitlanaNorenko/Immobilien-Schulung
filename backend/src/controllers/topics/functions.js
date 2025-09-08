// src/controllers/topics.controller.js
import supabase from "../../supabaseClient.js";

/**
 * GET /topics
 * Return all topics (no filters/pagination)
 */
export async function getTopics(_req, res) {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ error: "Failed to fetch topics" });
  res.json(data ?? []);
}

/**
 * POST /topics
 * body: { name: string }
 */
export async function createTopic(req, res) {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "Topic 'name' is required" });

  // Insert and return created row
  const { data, error } = await supabase
    .from("topics")
    .insert({ name })
    .select()
    .single();

  if (error) {
    // If you have a UNIQUE constraint on name, surface conflict nicely
    if (error.code === "23505")
      return res
        .status(409)
        .json({ error: "Topic with this name already exists" });
    return res.status(500).json({ error: "Failed to create topic" });
  }

  res.status(201).json(data);
}

// Home work
export async function updateTopic(req, res) {}

/**
 * DELETE /topics/:id
 * Path param only (no query fallback)
 */
export async function deleteTopic(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Valid numeric 'id' is required" });
  }

  const { data, error } = await supabase
    .from("topics")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // Supabase returns PGRST116 (No rows) when .single() finds none
    if (error.code === "PGRST116")
      return res.status(404).json({ error: "Topic not found" });
    return res.status(500).json({ error: "Failed to delete topic" });
  }

  res.json({ deleted: true, topic: data });
}
