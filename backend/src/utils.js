//all that has deal with questions
const questions = require('./questions.json'); //import questions from questions.js
const {Random} = require('random-js'); //import random from random-js library
const topics = require('./topics.json'); //import topics from topics.js

const getRandomQuestion = (topic) => { //topic - a theme from array of questions, getRandomQuestion - what has user chosen
    const random = new Random(); //create a new random object

    let questionTopic = topic.toLowerCase();
    if(questionTopic === 'random frage') {
        questionTopic = Object.keys(questions)[
            random.integer(0, Object.keys(questions).length - 1)
        ]
    }

    const questionId = getQuestionIdFromTopic(questionTopic);
    const randomQuestionIndex = getRandomInt(0, questions[questionId].length-1); //get random number from 0 to the length of the array - 1

    
    
    return {
        question: getQuestionById(questionId)[randomQuestionIndex],
        topicId: questionId,//return the question from the array
    }
}



function getQuestionIdFromTopic(topic) {
//     topic = topic.toLowerCase(); //convert topic to lowercase
    return String(topics[topic]);
}



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCorrectAnswer(topicId, questionId) {
    const question = getQuestionById(topicId).find((question) => question.id === questionId); //

    if (question.answer) {
        return question.answer; //if the question has no options, return the answer
    }
        
    return question.options.find((option) => option.isCorrect).text;

}





function getQuestionById(topicId) {
    return questions[topicId];
}

module.exports = {getRandomQuestion, getCorrectAnswer, getQuestionById,};//need to export function to use it in index.js