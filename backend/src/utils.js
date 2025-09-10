import supabase from "./supabaseClient.js";

async function createUser(telegramId, name) {
  const { error } = await supabase
    .from("users")
    .insert({ telegram_id: telegramId, name });

  if (error.code === "23505") {
    await supabase.from("users").update({ name }).eq("telegram_id", telegramId);
    return;
  }

  if (error) {
    console.error("Error creating user:", error);
  }
}

async function getNextQuestion(userId, topic) {
  const { id: topicId } = await getTopicId(topic);
  const lastAnswer = await getLastAnswer(userId, topicId);
  const lastAnswerQuestionId = lastAnswer?.question_id || 0;

  // Get the next question for the topic
  const { data: question, error } = await supabase
    .from("questions")
    .select("*")
    .eq("topic_id", topicId) //get info from database and telegram-bot and compare them
    .gt("id", lastAnswerQuestionId) // Only questions with an ID greater than the last answered
    .order("id", { ascending: true }) // Smallest ID first
    .limit(1) // Get only one question
    .single(); // Return a single object instead of an array

  if (error) {
    console.error("Error fetching next question:", error);
    return null;
  }

  return { question, topicId };
}

async function getTopicId(topicName) {
  const { data, error } = await supabase
    .from("topics")
    .select("id")
    .eq("name", topicName)
    .limit(1) // get only the next one
    .single(); // return a single object instead of an array

  if (error) {
    console.error("Error fetching next question:", error);
    return null;
  }

  return data;
}

async function getLastAnswer(userId, topicId) {
  const { data, error } = await supabase
    .from("answers")
    .select("*") // you can limit fields if needed
    .eq("telegram_id", userId)
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false }) // or "id" if there's no created_at column
    .limit(1)
    .single(); // returns an object instead of an array

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching last answer:", error);
    return null;
  }

  return data;
}

async function getQuestionById(questionId) {
  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .single();

  return question;
}

// Home work: Try to finish this
// Finish this function to save the answer in supabase
// Fields to save: everything except id, created_at
// telegram_id will take teh value of userId
// https://supabase.com/dashboard/project/uddwvhkgbecwaerhcbil/editor/17310?schema=public
async function saveAnswer(question, topicId, telegramId, optionId) {
  const answer = getUserAnswer(optionId, question);
  const user = await getUserByTelegramId(telegramId);
  const { error } = await supabase.from("answers").insert({
    telegram_id: telegramId,
    question_id: question.id,
    topic_id: topicId,
    isCorrect: answer.isCorrect,
    user_id: user.id,
    answer: answer.text,
  });

  if (error) {
    if (error.code === "23505") {
      // If the question is already answered, we don't want to save the answer again or make any changes
      return true;
    }
    console.error("Error saving answer:", error);
  }

  const correctAnswersCount = answer.isCorrect
    ? user.correct_answers_count + 1 //to increase the correct answers count (total) if the user answer is correct
    : user.correct_answers_count; //to keep the correct answers count (total) if the user answer is wrong

  await supabase
    .from("users")
    .update({
      questions_answered_count: user.questions_answered_count + 1,
      correct_answers_count: correctAnswersCount,
      last_question_id: question.id,
    })
    .eq("id", user.id);

  return false;
}

async function getUserByTelegramId(telegramId) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  return user;
}

function getUserAnswer(optionId, question) {
  if (question.hasOptions) {
    return question.options.find((_, index) => optionId === index);
  }

  return { text: question.answer, isCorrect: true };
}

async function fetchTopicsWithQuestions() {
  const { data, error } = await supabase
    .from("topics")
    .select(
      `
      id,
      name,
      questions (
        id,
        text,
        hasOptions,
        answer,
        options
      )
    `
    )
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }

  return data;
}

// returns if the answer the user selected is correct and also returns the correct answer
function getQuestionAnswer(question, optionId) {
  if (question.hasOptions) {
    // the option the user selected
    const userSelectedOption = question.options.find(
      (_, index) => index === optionId
    );

    const userSelectedOptionIsCorrect = userSelectedOption.isCorrect;

    // get teh correct answer
    const correctOption = question.options.find((option) => option.isCorrect);
    // use ? just in case correctOption is undefined, to avoid errors
    /* Next line is equal to
    const correctOptionAnswer = correctOption? correctOption.text : undefined;
    */
    const correctOptionAnswer = correctOption?.text;

    return {
      isCorrect: userSelectedOptionIsCorrect,
      answer: correctOptionAnswer,
    };
  }

  return { isCorrect: true, answer: question.answer };
}

function getRandomTopic(topics = []) {
  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex];
}

export {
  getQuestionById,
  fetchTopicsWithQuestions,
  getNextQuestion,
  createUser,
  saveAnswer,
  getQuestionAnswer,
  getRandomTopic,
}; //need to export function to use it in index.js
