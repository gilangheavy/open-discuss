const ThreadRepository = require("../ThreadRepository");

describe("ThreadRepository abstract class", () => {
  let threadRepository;

  beforeEach(() => {
    threadRepository = new ThreadRepository();
  });

  describe("addThread", () => {
    it("should throw error when addThread is called", async () => {
      await expect(
        threadRepository.addThread({}, "owner")
      ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
  });

  describe("verifyThreadAvailability", () => {
    it("should throw error when verifyThreadAvailability is called", async () => {
      await expect(
        threadRepository.verifyThreadAvailability("thread-123")
      ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
  });

  describe("getThreadById", () => {
    it("should throw error when getThreadById is called", async () => {
      await expect(
        threadRepository.getThreadById("thread-123")
      ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
  });
});
