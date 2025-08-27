//all that has deal with questions
const questions = require('./questions'); //import questions from questions.js
const { Random } = require('random-js'); //import random from random-js library

const getRandomQuestion = (topic) => { //topic - a theme from array of questions, getRandomQuestion - what has user chosen
    console.log("📥 getRandomQuestion вызвана с темой:", topic);

    const random = new Random(); //create a new random object
    const questionTopic = topic.toLowerCase();

    const topicQuestions = questions[questionTopic];

    if (!topicQuestions) {
        console.error("❌ Ошибка: Тема не найдена в questions:", questionTopic);
        console.log("📋 Доступные темы:", Object.keys(questions));
        throw new Error(`Тема '${questionTopic}' не найдена`);
    }

    const randomQuestionIndex = random.integer(0, topicQuestions.length - 1); //get random number from 0 to the length of the array - 1

    console.log(`🎲 Случайный индекс: ${randomQuestionIndex}, Всего вопросов: ${topicQuestions.length}`);

    return topicQuestions[randomQuestionIndex]; //return the question from the array
};

const getCorrectAnswer = (topic, id) => {
    console.log("📥 getCorrectAnswer вызвана с темой:", topic, "и ID вопроса:", id);

    const topicQuestions = questions[topic];

    if (!topicQuestions) {
        console.error("❌ Ошибка: Тема не найдена в questions:", topic);
        console.log("📋 Доступные темы:", Object.keys(questions));
        throw new Error(`Тема '${topic}' не найдена`);
    }

    const question = topicQuestions.find((question) => question.id === id);

    if (!question) {
        console.error(`❌ Ошибка: Вопрос с ID ${id} не найден в теме '${topic}'`);
        console.log("📝 Список доступных ID в теме:", topicQuestions.map(q => q.id));
        throw new Error(`Вопрос с ID ${id} не найден`);
    }

    if (!question.hasOptions) {
        console.log("✅ Вопрос без вариантов ответа. Ответ:", question.answer);
        return question.answer; //if the question has no options, return the answer
    }

    const correctOption = question.options?.find((o) => o.isCorrect);

    if (!correctOption) {
        console.error(`❌ Ошибка: В вопросе ID ${id} нет правильного варианта (isCorrect: true)`);
        console.log("🔍 Все варианты:", question.options);
        throw new Error(`Правильный ответ не найден`);
    }

    console.log("✅ Найден правильный ответ:", correctOption.text);
    return correctOption.text; //if the question has options, find the option with isCorrect = true and return it
};

module.exports = { getRandomQuestion, getCorrectAnswer }; //need to export function to use it in index.js
