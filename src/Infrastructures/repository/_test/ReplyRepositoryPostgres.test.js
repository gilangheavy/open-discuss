const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("ReplyRepositoryPostgres integration", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should add reply and verify in database", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    });
    const fakeIdGenerator = () => "123"; // stub!
    const repository = new ReplyRepositoryPostgres(pool, () =>
      fakeIdGenerator()
    );
    const replyPayload = {
      content: "integration test reply",
      commentId: "comment-123",
      owner: "user-123",
    };

    // Act
    const addedReply = await repository.addReply(replyPayload);

    // Assert
    const replies = await RepliesTableTestHelper.findReplyById("reply-123");
    expect(replies).toHaveLength(1);
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.content).toBe("integration test reply");
    expect(replies[0].content).toBe("integration test reply");
    expect(replies[0].owner).toBe("user-123");
    expect(replies[0].is_delete).toBe(false);
  });

  it("should delete reply and set is_delete to true in database", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "reply to be deleted",
      commentId: "comment-123",
      owner: "user-123",
      date: new Date().toISOString(),
      is_delete: false,
    });

    const repository = new ReplyRepositoryPostgres(pool, () => "reply-123");

    // Act
    await repository.deleteReply("reply-123");

    // Assert
    const replies = await RepliesTableTestHelper.findReplyById("reply-123");
    expect(replies).toHaveLength(1);
    expect(replies[0].is_delete).toBe(true);
  });
});
