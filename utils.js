//all that has deal with questions
const questions = require('./questions.json'); //import questions from questions.js
const {Random} = require('random-js'); //import random from random-js library

const getRandomQuestion = (topic) => { //topic - a theme from array of questions, getRandomQuestion - what has user chosen
    const random = new Random(); //create a new random object

    let questionTopic = topic.toLowerCase();

    if(questionTopic === 'random frage') {
        questionTopic = Object.keys(questions)[
            random.integer(0, Object.keys(questions).length - 1)
        ]};
    } //if the user has chosen random question
   // const randomQuestionIndex = Math.floor( //to choose the random question, math.floor - to round down the number
       // Mathrandom() * questions[questionTopic].length, //questionTopic - immobilienarten, technische verwaltung, etc.
   // ); //get random number from 0 to the length of the array

    const randomQuestionIndex = Random.integer(0, questions[questionTopic].length-1,); //get random number from 0 to the length of the array - 1

    return {question: questions[questionTopic][randomQuestionIndex],
        questionTopic, //return the question from the array
};

const getCorrectAnswer = (topic, id) => {    
    const question = questions[topic].find(        
        (question) => question.id === id
    );

    if (!question.hasOptions) {
        return question.answer; //if the question has no options, return the answer
    }
        
    return question.options.find((option) => option.isCorrect).text;//if the question has options, find the option with isCorrect = true and return it
};

const getQuestionById = (id) => {
    for (const topic in questions) { //for each topic in questions
        const question = questions[topic].find((q) => q.id === id); //find the question by id

        if (question) { //if the question is found
            return question; //return the question
        }
    }

    return null; //if the question is not found, return null
};


module.exports = {getRandomQuestion, getCorrectAnswer, getQuestionById, getTopicId};//need to export function to use it in index.js