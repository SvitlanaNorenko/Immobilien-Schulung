require('dotenv').config();
const {Bot, Keyboard, InlineKeyboard, GrammyError, HttpError} = require('grammy');
//inlineKeyboard appears under message
const {getRandomQuestion, getCorrectAnswer, getQuestionById, getTopicId} = require('./utils'); //to import the functions

const bot = new Bot(process.env.BOT_API_KEY);

//bot.command - to process the command /start
//ctx - context, contains information about the message, user, chat, etc.
bot.command('start',async (ctx) => { //to start the bot and show the keyboard with topics
    const startKeyboard = new Keyboard()
        .text('Immobilienarten').text('Technische Verwaltung')
        .row().text('Buchhaltung').text('Immobilienbewertung')
        .row().text('Kaufmännische Verwaltung').text('Mietverwaltung und Mietrecht')
        .row().text('Gewerbeimmobilien').text('WEG Verwaltung')
        .resized();
    await ctx.reply('Hallo! Ich bin ein Immobilien Schulung Bot 🤖 \nIch helfe dir die Immobilienbranche zu verstehen und lernen');
    await ctx.reply('Wo möchtest Du beginnen?👇', {reply_markup: startKeyboard})
});
//bot.hears - to react to the questions with specific text, events
//processing topic selection
bot.hears([                                      
    'Immobilienarte', 'Technische Verwaltung',
    'Buchhaltung', 'Immobilienbewertung',
    'Kaufmännische Verwaltung', 'Mietverwaltung und Mietrecht',
    'Gewerbeimmobilien', 'WEG Verwaltung'
], async (ctx) => {
    //const topicId = ctx.message.text.getTopicId();
    const topic = ctx.message.text.toLowerCase(); //to create a var to topic 
    const question = getRandomQuestion(topic); //to get a random question from the topic
    const topicId = getTopicId(topicId);

    if (!question) {
        await ctx.reply('Es wurde keine Frage gefunden.');
        return;
    }
   
    let inlineKeyboard; //to create a new inline keyboard

      if (question.hasOptions) { //if the question has options, create an inline keyboard with buttons for each option
       const keyboard = new InlineKeyboard();

        question.options.forEach(option => {
          keyboard.text(
            option.text,
             JSON.stringify({
            topicId: topic.id, //topicId: getTopicId(topic),
            questionId: question.id,
            optionsId: option.id,

        }).row(),
        );
        });

      inlineKeyboard = keyboard; //create a keyboard with answer variants

      } else { //if the question has no options, create a button to get the answer
        inlineKeyboard = new InlineKeyboard()
        .text('die Antwort bekommen', 
      JSON.stringify({
          topicId: topic.id,
          questionId: question.id,
          
        })
      ); 
   }
     
    await ctx.reply(question.text, { //question is a whole question in array
        reply_markup: inlineKeyboard //answer the user that the topic is chosen
    }); 
});

//bot.on - reaction to any messages or to media messages
//processing the answer to the question
bot.on('callback_query:data', async (ctx) => {   
  const callbackData = ctx.callbackQuery.data; //get the data from the callback query

  const [questionId, optionId, topicId] = callbackData.split('|').map(Number); //split the data by '|' and convert to number

  const question = getQuestionById(questionId); //get the question by id

    if (!question) {
          await ctx.reply("Frage nicht gefunden.");
          return;
    }

  //if the question has no options 
    if(!question.hasOptions) {       
      const answer = getCorrectAnswer(question.topic, questionId, topicId); //get the correct answer from the question id and type - theme name
      await ctx.reply(answer); //reply with the answer
      await ctx.answerCallbackQuery(); //to remove the loading icon
      return; //to stop the function
    }

   /* const selectedOption = question.options.find(option => option.id === optionId);

    if (!selectedOption) {
        await ctx.reply("Ausgewählte Option nicht gefunden.");
        return;
    }
*/

    //if the question has options and the user gave the correct answer
    if(callbackData.isCorrect) {
        await ctx.reply('Richtig! 🎉');   
        await ctx.answerCallbackQuery();      
        return;
    } else {
      //if the question has options and the user gave the wrong answer     
    const answer = getCorrectAnswer(callbackData.topicId, callbackData.questionId); //get the correct answer from the question id and type/topicId - theme name
      await ctx.reply(`Falsch! 😢 Die richtige Antwort ist: ${answer}`); //to answer user that the answer is wrong and give the correct answer
      await ctx.answerCallbackQuery();
      return;     

      /*
      const correct = question.options.find(option => option.isCorrect); //find the correct option
      await ctx.reply(`Falsch! 😢 Die richtige Antwort ist: ${correct.text}`);
      await ctx.answerCallbackQuery(); //to answer user that the answer is wrong and give the correct answer
      */
      }  
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



