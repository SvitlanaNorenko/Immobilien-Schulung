import supabase from "../supabaseClient.js";

export default async function getUsers(_, res) {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,questions_answered_count,correct_answers_count")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).end();
    return;
  }

  return res.json(data);
}
