import { getQuestionAnswer } from "../utils";

const exampleQuestionWithOptions = {
  id: 1,
  text: "What is?",
  options: [
    {
      text: "Answer 1",
      isCorrect: true,
    },
    {
      text: "Answer 2",
      isCorrect: false,
    },
  ],
  hasOptions: true,
};

const exampleQuestionWithoutOptions = {
  id: 1,
  text: "What is?",
  answer: "this is the answer",
  hasOptions: false,
};

describe("getQuestionAnswer should return the correct answer and if the user selected a correct answer", () => {
  describe("We should return the correct answer text", () =>
    test.each([
      {
        question: exampleQuestionWithOptions,
        optionId: 0,
        correctAnswer: "Answer 1",
      },
      {
        question: exampleQuestionWithOptions,
        optionId: 1,
        correctAnswer: "Answer 1",
      },
      {
        question: exampleQuestionWithoutOptions,
        optionId: 0,
        correctAnswer: "this is the answer",
      },
    ])(
      "We should return answer=$correctAnswer",
      ({ question, optionId, correctAnswer }) => {
        const answer = getQuestionAnswer(question, optionId).answer;
        expect(answer).toBe(correctAnswer);
      }
    ));

  describe("We check if the user chose the correct answer:", () =>
    test.each([
      {
        question: exampleQuestionWithOptions,
        optionId: 0,
        expectedIsCorrect: true,
      },
      {
        question: exampleQuestionWithOptions,
        optionId: 1,
        expectedIsCorrect: false,
      },
      {
        question: exampleQuestionWithoutOptions,
        optionId: undefined,
        expectedIsCorrect: true,
      },
    ])(
      "We should return isCorrect=$expectedIsCorrect",
      ({ question, optionId, expectedIsCorrect }) => {
        const isCorrect = getQuestionAnswer(question, optionId).isCorrect;
        expect(isCorrect).toBe(expectedIsCorrect);
      }
    ));

  test("Should return undefined we don't pass a question", () => {
    const answer = getQuestionAnswer({}, 1).answer;
    expect(answer).toBe(undefined);
  });
});
