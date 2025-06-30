require('dotenv').config();
const {Bot, Keyboard, InlineKeyboard, GrammyError, HttpError} = require('grammy');
//inlineKeybord apears under message
const {getRandomQuestion, getCorrectAnswer} = require('./utils'); //to import the functions

const bot = new Bot(process.env.BOT_API_KEY);

//bot.command - to process the command /start
//ctx - context, contains information about the message, user, chat, etc.
bot.command('start',async (ctx) => {
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
    'Immobilienarten', 'Technische Verwaltung',
    'Buchhaltung', 'Immobilienbewertung',
    'Kaufmännische Verwaltung', 'Mietverwaltung und Mietrecht',
    'Gewerbeimmobilien', 'WEG Verwaltung'
], async (ctx) => {
    await ctx.reply(`Was ist ${ctx.message.text}`); //answer the user that the topic is chosen
    const topic = ctx.message.text.toLocaleLowerCase();
    const question = getRandomQuestion(topic)

    let inlineKeyboard;

        if (question.hasOptions) {            
            const buttonRows = question.options.map((option) => [
                InlineKeyboard.text(
                    option.text, 
                    JSON.stringify({
                    t: topic, //t - type, o - option
                    isCorrect: option.isCorrect ? 1 : 0, // 1 - true, 0 - false
                    q: question.id,  //q - questionId
                })
                )         
            ]);
        
        inlineKeyboard = InlineKeyboard.from(buttonRows); //keyboard with variants of answers
        };
        if (!question.hasOptions) { 
            inlineKeyboard = new InlineKeyboard().text(
                'die Antwort bekommen', 
                JSON.stringify({
                t: topic[0], 
                q: question.id,
            })               
            );             
        };
    
        await ctx.reply(question.text, { 
        reply_markup: inlineKeyboard //for inlineKeybord create the 2d argument 
    }); //to react to these buttons need to create one more hears - callback query, and want to react only for those, that have data: 'getAnswer' 
});
//bot.on - reaction to any messages or to media messages
//processing the answer to the question
bot.on('callback_query:data', async (ctx) => {
    const callbackData = JSON.parse(ctx.callbackQuery.data); //turn the str back to object

    if(!callbackData.t.includes('option')) { //to check questions without options
        const answer = getCorrectAnswer(callbackData.t, callbackData.q); //t - type, the theme of questions, q- question id
        await ctx.reply(answer); //answer the user the found answer
        await ctx.answerCallbackQuery(); //to remove the loading icon
        return; //to stop the function
    }

    if (callbackData.isCorrect) { //with variants of answer :if the answer is correct
        await ctx.reply('Richtig! 🎉'); //answer the user that the answer is correct
        await ctx.answerCallbackQuery(); 
        return;
    }

    const answer = getCorrectAnswer(callbackData.t, callbackData.q);
    await ctx.reply(`Leider falsch! 😢\nDie richtige Antwort ist: ${answer}`); //answer the user that the answer is wrong and give the right answer
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



