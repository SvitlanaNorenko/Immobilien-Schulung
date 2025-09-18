import supabase from "../supabaseClient.js";
import puppeteer from "puppeteer";

export default async function exportUsersDataAsPDF(req, res) {
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
        date: new Date(answer.created_at).toLocaleDateString("en-DE", {
          weekday: "long", // "Monday"
          year: "numeric", // "2025"
          month: "long", // "September"
          day: "numeric", // "10"
        }),
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

  const html = renderHTML(userAnswers, stats);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", right: "12mm", bottom: "15mm", left: "12mm" },
    displayHeaderFooter: true,
    headerTemplate: headerTemplate("Users & Stats Export"),
    footerTemplate: footerTemplate(),
  });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="export.pdf"');
  res.send(pdfBuffer);
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHTML(rows, headerOrder) {
  const headers =
    headerOrder && headerOrder.length
      ? headerOrder
      : Array.from(
          rows.reduce((set, r) => {
            Object.keys(r || {}).forEach((k) => set.add(k));
            return set;
          }, new Set())
        );

  const thead = `<thead><tr>${headers
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (r) =>
        `<tr>${headers
          .map((h) => `<td>${escapeHtml(r?.[h])}</td>`)
          .join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<table class="table">${thead}${tbody}</table>`;
}

function renderHTML(userAnswers, stats) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Users & Stats Export</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; }
    h1, h2 { margin: 0 0 12px; }
    .section { page-break-inside: avoid; margin-bottom: 18px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
    .table th { background: #f2f2f2; text-align: left; }
    .muted { color: #666; font-size: 12px; margin-bottom: 6px; }
    .spacer { height: 14px; }
    .wrap { word-break: break-word; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Users & Stats Export</h1>
  <div class="muted">Generated on ${new Date().toISOString()}</div>

    <div class="section">
    <h2>Stats</h2>
    ${
      stats.length
        ? tableHTML(stats, [
            "student name",
            "Questions count",
            "Correct answers count",
            "Correct answers percentage",
          ])
        : '<div class="muted">No stats available.</div>'
    }
  </div>
  <div class="spacer"></div>

  <div class="section">
    <h2>Users (Answers)</h2>
    ${
      userAnswers.length
        ? tableHTML(userAnswers, [
            "student name",
            "topic",
            "question",
            "answer",
            "correct",
            "date",
          ])
        : '<div class="muted">No answers available.</div>'
    }
  </div>



</body>
</html>`;
}

function headerTemplate(title) {
  // Puppeteer header/footer use a mini HTML doc. Keep height small.
  return `
    <div style="font-size:10px; padding:4px 10px; width:100%; display:flex; justify-content:space-between; color:#666;">
      <span>${escapeHtml(title)}</span>
      <span class="date"></span>
    </div>`;
}

function footerTemplate() {
  return `
    <div style="font-size:10px; padding:4px 10px; width:100%; text-align:right; color:#666;">
      Page <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>`;
}
