require("dotenv").config(); //include dotenv library to use var - env and read this file
const questions = require("./questions.json"); //import questions from questions.js
const { Random } = require("random-js"); //import random from random-js library
const topics = require("./topics.json"); //import topics from topics.js

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

function getCorrectAnswer(topicId, questionId) {
  const question = getQuestionById(topicId).find(
    (question) => question.id === questionId
  ); //

  if (question.answer) {
    return question.answer; //if the question has no options, return the answer
  }

  return question.options.find((option) => option.isCorrect).text;
}

function getQuestionById(topicId) {
  return questions[topicId];
}

async function fetchTopicsWithQuestions() {
  const { createClient } = require("@supabase/supabase-js");

  const supabaseUrl = "https://uddwvhkgbecwaerhcbil.supabase.co";
  const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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

module.exports = {
  getRandomQuestion,
  getCorrectAnswer,
  getQuestionById,
  fetchTopicsWithQuestions,
}; //need to export function to use it in index.js
