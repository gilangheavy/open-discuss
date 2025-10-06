const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const Thread = require("../../../Domains/threads/entities/Thread");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
// Repositories no longer throw domain errors

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist add thread and return added thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });

      const addThread = new AddThread({
        title: "sebuah thread",
        body: "sebuah body thread",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        addThread,
        "user-123"
      );

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: "sebuah thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("verifyThreadAvailability function", () => {
    it("should return 0 if thread not available", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const count = await threadRepositoryPostgres.verifyThreadAvailability(
        "thread-123"
      );
      expect(count).toBe(0);
    });

    it("should return > 0 if thread available", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const count = await threadRepositoryPostgres.verifyThreadAvailability(
        "thread-123"
      );
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("getThreadById function", () => {
    it("should return undefined if thread not found", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");
      expect(thread).toBeUndefined();
    });

    it("should return thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: "thread-123",
          title: "sebuah thread",
          body: "sebuah body thread",
          date: thread.date,
          username: "dicoding",
          comments: [],
        })
      );
    });

    it("should handle thread.date as Date instance", async () => {
      // Arrange: mock pool to return thread with date as Date instance
      const mockPool = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              id: "thread-999",
              title: "mock thread",
              body: "mock body",
              date: new Date("2023-01-01T00:00:00Z"),
              username: "mockuser",
            },
          ],
        }),
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        mockPool,
        {}
      );
      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-999");
      // Assert
      expect(thread.date).toBeInstanceOf(Date);
      expect(thread.date.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });
  });
});
