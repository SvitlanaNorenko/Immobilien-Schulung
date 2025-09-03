import supabase from "../../supabaseClient.js";

export async function countQuestions() {
  const { count, error } = await supabase
    .from("questions")
    .select("*", { count: "exact" })
    .limit(0);

  if (error) {
    console.error("Error fetching count:", error);
    return 0;
  } else {
    return count;
  }
}

export async function countTopics() {
  const { count, error } = await supabase
    .from("topics")
    .select("*", { count: "exact" })
    .limit(0);

  if (error) {
    console.error("Error fetching count:", error);
    return 0;
  }

  return count;
}

export async function getActiveUsersAndCompletionPercentage() {
  const {
    data: questionsStats,
    count: usersCount,
    error,
  } = await supabase
    .from("users")
    .select("questions_answered_count, correct_answers_count", {
      count: "exact",
    });

  if (error) {
    console.error("Error fetching count:", error);
    return { completionPercentage: 0, usersCount: 0 };
  }

  let totalCorrectAnswers = 0;
  let totalQuestions = 0;

  for (const questionStats of questionsStats) {
    totalCorrectAnswers += questionStats.correct_answers_count;
    totalQuestions += questionStats.questions_answered_count;
  }

  const completionPercentage = (totalCorrectAnswers / totalQuestions) * 100;

  return { completionPercentage, usersCount };
}
