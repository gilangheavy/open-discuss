const AddReply = require("../AddReply");

describe("AddReply entity", () => {
  it("should throw error when payload does not contain needed property", () => {
    expect(() => new AddReply({})).toThrowError(
      "ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
    expect(
      () => new AddReply({ content: "abc", commentId: "123" })
    ).toThrowError("ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    expect(
      () => new AddReply({ content: "abc", owner: "user-1" })
    ).toThrowError("ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    expect(
      () => new AddReply({ commentId: "123", owner: "user-1" })
    ).toThrowError("ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload properties do not meet data type specification", () => {
    expect(
      () => new AddReply({ content: 123, commentId: "123", owner: "user-1" })
    ).toThrowError("ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    expect(
      () => new AddReply({ content: "abc", commentId: 123, owner: "user-1" })
    ).toThrowError("ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    expect(
      () => new AddReply({ content: "abc", commentId: "123", owner: {} })
    ).toThrowError("ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });

  it("should create AddReply object correctly when given valid payload", () => {
    const payload = {
      content: "A reply",
      commentId: "comment-123",
      owner: "user-456",
    };
    const addReply = new AddReply(payload);

    expect(addReply.content).toBe(payload.content);
    expect(addReply.commentId).toBe(payload.commentId);
    expect(addReply.owner).toBe(payload.owner);
  });
});
