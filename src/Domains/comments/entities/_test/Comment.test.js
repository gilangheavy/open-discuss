const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date(),
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'dicoding',
      date: new Date(),
      content: 'sebuah comment',
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create Comment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date(),
      content: 'sebuah comment',
      isDelete: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
  });

  it('should create deleted Comment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date(),
      content: 'sebuah comment',
      isDelete: true,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual('**komentar telah dihapus**');
  });
});
