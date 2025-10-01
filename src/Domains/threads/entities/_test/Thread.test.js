const Thread = require("../Thread");

describe("Thread entities", () => {
  it("should throw error when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "title",
      body: "body",
      date: new Date(),
      username: "user-123",
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      title: "title",
      body: "body",
      date: new Date(),
      username: "user-123",
      comments: [],
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Thread entities correctly", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "title",
      body: "body",
      date: new Date(),
      username: "user-123",
      comments: [],
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread.comments).toEqual(payload.comments);
  });
});
