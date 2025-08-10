require('dotenv').config(); //include dotenv library to use var - env and read this file
const {Bot, Keyboard, InlineKeyboard, GrammyError, HttpError} = require('grammy'); //import necessary classes from grammy library
//inlineKeyboard appears under message
const {getRandomQuestion, getCorrectAnswer, getQuestionById,} = require('./utils1'); //to import the functions

const bot = new Bot(process.env.BOT_API_KEY); //create a new bot with the API key from .env file

//bot.command - to process the command /start
//ctx - context, contains information about the message, user, chat, etc.
bot.command('start',async (ctx) => {
    const startKeyboard = new Keyboard()
        .text('Immobilienarten').text('Technische Verwaltung')
        .row().text('Buchhaltung').text('Immobilienbewertung')
        .row().text('Kaufmännische Verwaltung').text('Mietverwaltung und Mietrecht')
        .row().text('Gewerbeimmobilien').text('WEG Verwaltung')
        .row().text('Random Frage')
        .resized();
    await ctx.reply('Hallo! Ich bin ein Immobilien Schulung Bot 🤖 \nIch helfe dir die Immobilienbranche zu verstehen und lernen');
    await ctx.reply('Wo möchtest Du beginnen?👇', {reply_markup: startKeyboard})
});
//bot.hears - to react to the questions with specific text, events
//processing topic selection
bot.hears([                                      
    'Immobilienarten', 'Technische Verwaltung',
    'Buchhaltung', 'Immobilienbewertung',
    'Kaufmännische Verwaltung', 'Mietverwaltung und Mietrecht',
    'Gewerbeimmobilien', 'WEG Verwaltung',
    'Random Frage'
], async (ctx) => {
    const topic = ctx.message.text.toLowerCase().trim();
    const {question, topicId} = getRandomQuestion(topic); //to get a random question from the topic
   
    let inlineKeyboard; //to create a new inline keyboard

      if (question.hasOptions) {
        inlineKeyboard = new InlineKeyboard();
        //if the question has options, create an inline keyboard with buttons for each option
        question.options.forEach((option) =>            
          inlineKeyboard.text(
            option.text, 
            JSON.stringify({
            topicId: topicId,
            questionId: question.id,
            optionId: option.id, 
          })
        ).row()
      );
      
      } else { //if the question has no options, create a button to get the answer
        inlineKeyboard = new InlineKeyboard()
        .text('die Antwort bekommen', 
        JSON.stringify({
        topicId: topicId,
        questionId: question.id,
        }),
      ); 
      }
        
    await ctx.reply(question.text, { //question is a whole question in array
        reply_markup: inlineKeyboard //answer the user that the topic is chosen
    }); 
});

// bot.on - reaction to any messages or to media messages
// processing the answer to the question
bot.on('callback_query:data', async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);
  const { questionId, topicId, optionId } = callbackData;

  if (!optionId) { //if the question has no options
    const answer = getCorrectAnswer(callbackData.topicId, callbackData.questionId);
    await ctx.reply(answer);
    await ctx.answerCallbackQuery(); 
    return;
  }
    
    const question = getQuestionById(topicId).find((q) => q.id === questionId); //check urself if u have written a question
  if (!question) {
    await ctx.reply("Frage nicht gefunden.");
    await ctx.answerCallbackQuery();
    return;
  }

  if (!Array.isArray(question.options)) { //if the question has no options
  await ctx.reply("Antwortmöglichkeiten nicht gefunden.");
  await ctx.answerCallbackQuery();
  return;
}

  const selectedOption = question.options.find(option => option.id === optionId); //to compare the right option from the question and the option that user has chosen

  if (!selectedOption) { //to check if the program has found the option that user has chosen
    await ctx.reply("Ausgewählte Option nicht gefunden."); 
    await ctx.answerCallbackQuery();
    return;
  }

  if (selectedOption.isCorrect) {
    await ctx.reply("Richtig! 🎉");
  } else {
    const correct = question.options.find(option => option.isCorrect);
    await ctx.reply(`Falsch! 😢 Die richtige Antwort ist: ${correct.text}`);
  }

  await ctx.answerCallbackQuery();
});




bot.catch((err) => {
  const ctx = err.ctx; // The context of the update that caused the error
  console.error(`Error while handling update ${ctx.update.update_id}:`); //update id of error in console
  const e = err.error; //get error
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) { //if error with network/server
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
}); 

bot.start();



