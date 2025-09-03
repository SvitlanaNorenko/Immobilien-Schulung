import {
  countQuestions,
  countTopics,
  getActiveUsersAndCompletionPercentage,
} from "./functions.js";

export default async function getStatistics(_, res) {
  // not to wait for every separate, but all working together and will be finished quicker
  const [questionsCount, topicsCount, { completionPercentage, usersCount }] =
    await Promise.all([
      countQuestions(),
      countTopics(),
      getActiveUsersAndCompletionPercentage(),
    ]);

  res.json({ questionsCount, topicsCount, completionPercentage, usersCount });
}
