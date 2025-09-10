import supabase from "../supabaseClient.js";
import JSZip from "jszip";

export default async function exportUsersDataAsCSV(req, res) {
  const { data, error } = await supabase
    .from("users")
    .select("*, answers(*, questions(*,topics(*)))");

  const userAnswers = [];
  const stats = [];

  data.forEach((user) => {
    user.answers.forEach((answer) => {
      userAnswers.push({
        // If you want to have a many words or special word table header use ["put it here"]
        ["student name"]: user.name,
        topic: answer.questions.topics.name,
        question: answer.questions.text,
        answer: answer.answer,
        correct: answer.isCorrect,
        date: answer.created_at,
      });
    });

    const questionsCount = user.questions_answered_count;
    const correctAnswersCount = user.correct_answers_count;
    const percentage = ((correctAnswersCount / questionsCount) * 100).toFixed(
      2
    );

    stats.push({
      // If you want to have a many words or special word table header use ["put it here"]
      ["student name"]: user.name,
      ["Questions count"]: questionsCount,
      ["Correct answers count"]: correctAnswersCount,
      ["Correct answers percentage"]: percentage,
    });
  });

  const usersCsv = arrayToCSV(userAnswers);
  const statsCsv = arrayToCSV(stats);

  // Build a zip file
  const zip = new JSZip();
  zip.file("users.csv", usersCsv);
  zip.file("stats.csv", statsCsv);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  res.setHeader("Content-Disposition", 'attachment; filename="export.csv"');
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send(zipBuffer);
}

/**
 * Minimal CSV serializer:
 * - Unions keys across all rows to form consistent headers
 * - Escapes quotes, commas, and newlines
 * - Adds UTF-8 BOM for Excel
 */
function arrayToCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    // Return an empty CSV with no rows (or you can return '' if you prefer)
    return "\uFEFF";
  }

  // Union of keys to keep all columns
  const headerSet = new Set();
  for (const r of rows) Object.keys(r ?? {}).forEach((k) => headerSet.add(k));
  const headers = Array.from(headerSet);

  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    const needsWrap = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsWrap ? `"${escaped}"` : escaped;
  };

  const headerRow = headers.map(escape).join(",");
  const body = rows
    .map((r) => headers.map((h) => escape(r?.[h])).join(","))
    .join("\n");

  return "\uFEFF" + headerRow + (body ? "\n" + body : "") + "\n";
}
