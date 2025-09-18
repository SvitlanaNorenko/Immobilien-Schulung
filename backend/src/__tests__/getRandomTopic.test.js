import { getRandomTopic } from "../utils";

describe("Testing getRandomTopic", () => {
  test("It should return a topic", () => {
    const exampleTopics = ["topic1", "topic2", "topic3"];
    const randomTopic = getRandomTopic(exampleTopics);
    expect(exampleTopics).toContain(randomTopic);
  });

  test("It should return undefined", () => {
    const randomTopic = getRandomTopic();
    expect(randomTopic).toBe(undefined);
  });
});
