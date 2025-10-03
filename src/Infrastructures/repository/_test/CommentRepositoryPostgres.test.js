const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist comment and return added comment correctly", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const addComment = new AddComment({
        content: "sebuah comment",
        threadId,
        owner: userId,
      });

      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        addComment
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "sebuah comment",
          owner: userId,
        })
      );
      expect(comment).toBeDefined();
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when comment owner is not the same as given owner", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw AuthorizationError when comment owner is the same as given owner", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteComment function", () => {
    it("should delete comment from database", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment.is_delete).toEqual(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return comments from a thread correctly", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: userId, username: "dicoding" });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
        content: "sebuah comment",
        date: "2023-01-01T00:00:00.000Z",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual({
        id: commentId,
        username: "dicoding",
        date: "2023-01-01T00:00:00.000Z",
        content: "sebuah comment",
        is_delete: false,
      });
    });
  });
});
