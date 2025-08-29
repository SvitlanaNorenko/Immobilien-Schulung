require("dotenv").config(); //include dotenv library to use var - env and read this file
const questions = require("./questions.json"); //import questions from questions.js
const { Random, date } = require("random-js"); //import random from random-js library
const topics = require("./topics.json"); //import topics from topics.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://uddwvhkgbecwaerhcbil.supabase.co";
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser(userId, name) {
  const { error } = await supabase
    .from("users")
    .insert({ telegram_id: userId, name });

  if (error) {
    console.error("Error creating user:", error);
  }
}

async function getNextQuestion(userId, topic) {
  const { id: topicId } = await getTopicId(topic);
  const lastAnswer = await getLastAnswer(userId, topicId);
  const lastAnswerQuestionId = lastAnswer?.id || 0;

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

const getRandomQuestion = (topic) => {
  //topic - a theme from array of questions, getRandomQuestion - what has user chosen
  const random = new Random(); //create a new random object

  let questionTopic = topic.toLowerCase().trim();
  let questionId;

  if (questionTopic === "random frage") {
    const allTopicsIds = Object.keys(questions);
    questionId = allTopicsIds[random.integer(0, allTopicsIds.length - 1)];
  } else {
    questionId = getQuestionIdFromTopic(questionTopic);
  }

  const questionList = getQuestionById(questionId);

  if (!Array.isArray(questionList) || questionList.length === 0) {
    throw new Error(`❌ Нет вопросов по теме ID "${questionId}"`);
  }

  const randomQuestionIndex = getRandomInt(0, questionList.length - 1); //get random number from 0 to the length of the array - 1

  return {
    question: questionList[randomQuestionIndex],
    topicId: questionId, //return the question from the array
  };
};

function getQuestionIdFromTopic(topic) {
  topic = topic.toLowerCase().trim();
  if (!topics.hasOwnProperty(topic)) {
    console.log("Ошибка! Ключа нет:", topic, Object.keys(topics));
    throw new Error(`❌ Тема "${topic}" не найдена в topics.json`);
  }
  return String(topics[topic]);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
async function saveAnswer(question, topicId, userId) {}

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

fetchTopicsWithQuestions();

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

module.exports = {
  getRandomQuestion,
  getQuestionById,
  fetchTopicsWithQuestions,
  getNextQuestion,
  createUser,
  saveAnswer,
  getQuestionAnswer,
}; //need to export function to use it in index.js
