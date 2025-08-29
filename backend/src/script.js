require("dotenv").config(); //include dotenv library to use var - env and read this file
const questions = require("./questions.json");

const { createClient } = require("@supabase/supabase-js"); //import the createClient function from supabase-js library

const supabaseUrl = "https://uddwvhkgbecwaerhcbil.supabase.co";
const supabase = createClient(
  // create a new supabase client with the URL and service role key from .env file
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

Object.keys(questions).forEach(async (topicId) => {
  //to iterate over the keys of the questions object
  const topicQuestions = questions[topicId];
  const questionsToInsert = topicQuestions.map(
    ({ text, hasOptions, answer, options }) => ({
      text,
      hasOptions,
      answer,
      options: options?.map(({ text, isCorrect }) => ({ text, isCorrect })),
      topic_id: topicId,
    })
  );
  const { data, error } = await supabase
    .from("questions")
    .insert(questionsToInsert);
  if (error) {
    console.error("Error inserting question:", error);
  } else {
    console.log("Inserted question:", data);
  }
});
