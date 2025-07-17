require('dotenv').config();
const {Bot, Keyboard, InlineKeyboard, GrammyError, HttpError} = require('grammy');
//inlineKeyboard appears under message
const {getRandomQuestion, getCorrectAnswer, getQuestionById} = require('./utils'); //to import the functions

const bot = new Bot(process.env.BOT_API_KEY);

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
    const topic = ctx.message.text.toLowerCase(); //to create a var to topic 
    const {question, questionTopic} = getRandomQuestion(topic); //to get a random question from the topic
   
    let inlineKeyboard; //to create a new inline keyboard

      if (question.hasOptions) { //if the question has options, create an inline keyboard with buttons for each option
        const buttonRows = question.options.map((option) =>            //the result will come back to result array - buttonRows
          InlineKeyboard.text(
            option.text, 
            JSON.stringify({
            type: `${questionTopic}-option`,
            isCorrect: option.isCorrect,
            questionId: question.id,
            optionId: option.id, 
          })
        ) //.row(),
      );

      inlineKeyboard = InlineKeyboard.from([buttonRows]) //create a keyboard with answer variants

      } else { //if the question has no options, create a button to get the answer
        inlineKeyboard = new InlineKeyboard()
        .text('die Antwort bekommen', 
      JSON.stringify({
          type: questionTopic,
          questionId: question.id,
        }),
      ); 
      }


        
    await ctx.reply(question.text, { //question is a whole question in array
        reply_markup: inlineKeyboard //answer the user that the topic is chosen
    }); 
});

//bot.on - reaction to any messages or to media messages
//processing the answer to the question
bot.on('callback_query:data', async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);

  // if the the question has no variants, only 1 answer 
  //if(!callbackData.type.includes('option')) {

 // }

 // if(!callbackData.type || !callbackData.optionId.includes('option')) {

  //}

  if (callbackData.type === undefined && callbackData.optionId === undefined) {
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);
    await ctx.reply(answer);
    await ctx.answerCallbackQuery();
    return;
  }

  //if(callbackData.isCorrect) {
   // await ctx.reply("Richtig! 🎉");
    //await ctx.answerCallbackQuery();
    //return;
  //}

  //const answer = getCorrectAnswer(callbackData.type.split('-')[0], callbackData.questionId);
  //await ctx.reply(`Falsch! 😢 Die richtige Antwort ist: ${answer}`);
  //await ctx.answerCallbackQuery();

  const { questionId, optionId } = callbackData;
  const question = getQuestionById(questionId); 
  if (!question) {
    await ctx.reply("Frage nicht gefunden.");
    await ctx.answerCallbackQuery();
    return;
  }

  if (!Array.isArray(question.options)) {
  await ctx.reply("Antwortmöglichkeiten nicht gefunden.");
  await ctx.answerCallbackQuery();
  return;
}

  const selectedOption = question.options.find(option => option.id === optionId);

  if (!selectedOption) {
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



