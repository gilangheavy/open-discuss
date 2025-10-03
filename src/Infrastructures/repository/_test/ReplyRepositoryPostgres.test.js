const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  let pool;
  let idGenerator;
  let repository;

  beforeEach(() => {
    pool = { query: jest.fn() };
    idGenerator = jest.fn(() => "123");
    repository = new ReplyRepositoryPostgres(pool, idGenerator);
  });

  describe("addReply", () => {
    it("should persist reply and return AddedReply correctly", async () => {
      const fakeReply = {
        content: "reply content",
        commentId: "comment-1",
        owner: "user-1",
      };
      pool.query.mockResolvedValue({
        rows: [{ id: "reply-123", content: "reply content", owner: "user-1" }],
      });

      const result = await repository.addReply(fakeReply);

      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("INSERT INTO replies"),
        })
      );
      expect(result).toBeInstanceOf(AddedReply);
      expect(result.id).toBe("reply-123");
      expect(result.content).toBe("reply content");
      expect(result.owner).toBe("user-1");
    });
  });

  describe("verifyReplyOwner", () => {
    it("should throw NotFoundError if reply not found", async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

      await expect(
        repository.verifyReplyOwner("reply-123", "user-1")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError if owner does not match", async () => {
      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: "user-2" }],
      });

      await expect(
        repository.verifyReplyOwner("reply-123", "user-1")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw error if owner matches", async () => {
      pool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: "user-1" }],
      });

      await expect(
        repository.verifyReplyOwner("reply-123", "user-1")
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteReply", () => {
    it("should update is_delete to true", async () => {
      pool.query.mockResolvedValue();

      await repository.deleteReply("reply-123");

      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("UPDATE replies SET is_delete = true"),
          values: ["reply-123"],
        })
      );
    });
  });

  describe("getRepliesByCommentId", () => {
    it("should return mapped replies", async () => {
      const now = new Date().toISOString();
      pool.query.mockResolvedValue({
        rows: [
          {
            id: "reply-123",
            username: "user1",
            date: now,
            content: "reply content",
            is_delete: false,
          },
        ],
      });

      const replies = await repository.getRepliesByCommentId("comment-1");

      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("SELECT replies.id"),
          values: ["comment-1"],
        })
      );
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        id: "reply-123",
        username: "user1",
        date: now,
        content: "reply content",
        is_delete: false,
      });
    });

    it("should return empty array if no replies", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const replies = await repository.getRepliesByCommentId("comment-1");

      expect(replies).toEqual([]);
    });
  });
});
