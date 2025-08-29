require("dotenv").config(); //include dotenv library to use var - env and read this file

const {
  Bot,
  Keyboard,
  InlineKeyboard,
  GrammyError,
  HttpError,
} = require("grammy"); //import necessary classes from grammy library
//inlineKeyboard appears under message
const {
  createUser,
  getNextQuestion,
  getQuestionById,
  fetchTopicsWithQuestions,
  saveAnswer,
  getQuestionAnswer,
} = require("./utils1"); //to import the functions
const bot = new Bot(process.env.BOT_API_KEY); //create a new bot with the API key from .env file

async function initializeBot() {  //what is the difference between startBot here and down and why index4.js is almost empty, why all info is here now?? 
  const topicsWithQuestions = await fetchTopicsWithQuestions();//fetch topics with questions from the database
  const topicNames = topicsWithQuestions.map((topic) => topic.name);

  //bot.command - to process the command /start
  //ctx - context, contains information about the message, user, chat, etc.
  bot.command("start", async (ctx) => {
    const startKeyboard = new Keyboard();

    topicNames.forEach((topic, index) => {
      startKeyboard.text(topic);
      if (index % 2) {
        startKeyboard.row();
      }
    });

    startKeyboard.resized();

    await ctx.reply(
      "Hallo! Ich bin ein Immobilien Schulung Bot 🤖 \nIch helfe dir die Immobilienbranche zu verstehen und lernen"
    );
    await ctx.reply("Wo möchtest Du beginnen?👇", {
      reply_markup: startKeyboard,
    });

    const userId = ctx.from.id;
    const userName = ctx.from.first_name + " " + ctx.from.last_name;
    createUser(userId, userName);
  });
  //bot.hears - to react to the questions with specific text, events
  //processing topic selection
  bot.hears(topicNames, async (ctx) => {
    const userId = ctx.from.id;
    const topic = ctx.message.text;
    const { question, topicId } = await getNextQuestion(userId, topic); //to the next question for the topic

    let inlineKeyboard; //to create a new inline keyboard

    if (question.hasOptions) {
      inlineKeyboard = new InlineKeyboard();
      //if the question has options, create an inline keyboard with buttons for each option
      question.options.forEach((option, index) =>
        inlineKeyboard
          .text(
            option.text,
            JSON.stringify({
              topicId: topicId,
              questionId: question.id,
              optionId: index,
            })
          )
          .row()
      );
    } else {
      //if the question has no options, create a button to get the answer
      inlineKeyboard = new InlineKeyboard().text(
        "die Antwort bekommen",
        JSON.stringify({
          topicId: topicId,
          questionId: question.id,
        })
      );
    }

    await ctx.reply(question.text, {
      //question is a whole question in array
      reply_markup: inlineKeyboard, //answer the user that the topic is chosen
    });
  });

  // bot.on - reaction to any messages or to media messages
  // processing the answer to the question
  bot.on("callback_query:data", async (ctx) => {
    const callbackData = JSON.parse(ctx.callbackQuery.data);
    const userId = ctx.from.id;
    const { questionId, topicId, optionId } = callbackData;

    if (!questionId) {
      await ctx.reply("Frage nicht gefunden.");
      await ctx.answerCallbackQuery();
      return;
    }

    const question = await getQuestionById(callbackData.questionId);
    const { isCorrect, answer } = getQuestionAnswer(question, optionId);
    const showHiddenAnswer = !question.hasOptions;
    // TOD homework
    saveAnswer(question, topicId, userId);

    // Show hidden answer when there are no options to pick from
    if (showHiddenAnswer) {
      await ctx.reply(answer);
      await ctx.answerCallbackQuery();
      return;
    }

    // Show Richtig if the selected option is correct
    if (isCorrect) {
      await ctx.reply("Richtig! 🎉");
      await ctx.answerCallbackQuery();
      return;
    }

    // Show the correct answer if the selected option is wrong
    await ctx.reply("Falsch! 😢 Die richtige Antwort ist: " + answer);
    await ctx.answerCallbackQuery();
  });

  bot.catch((err) => {
    const ctx = err.ctx; // The context of the update that caused the error
    console.error(`Error while handling update ${ctx.update.update_id}:`); //update id of error in console
    const e = err.error; //get error
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      //if error with network/server
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  bot.start();
}

module.exports = { startBot: initializeBot };
