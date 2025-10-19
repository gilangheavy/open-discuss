const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('Comment Likes API', () => {
  afterAll(async () => {
    await pool.end();
  });

  const cleanDb = async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  };

  beforeEach(async () => {
    await cleanDb();
  });

  afterEach(async () => {
    await cleanDb();
  });

  // Helper function to register and login
  const registerAndLogin = async (server, username = 'dicoding') => {
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: { username, password: 'secret', fullname: 'Test User' },
    });
    const loginRes = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username, password: 'secret' },
    });
    const { data: { accessToken } } = JSON.parse(loginRes.payload);
    return accessToken;
  };

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it('should return 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLogin(server, 'user1');

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-xxx/comments/comment-123/likes',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const json = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(json.status).toBe('fail');
    });

    it('should return 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLogin(server, 'user1');

      // Create thread (user is already created by registerAndLogin)
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread title', body: 'thread body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/comment-xxx/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const json = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(json.status).toBe('fail');
    });

    it('should add like when user has not liked the comment', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLogin(server, 'user1');

      // Create thread and comment through API
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread title', body: 'thread body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'comment content' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Action - Like the comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const json = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(json.status).toBe('success');

      // Verify like is added (we can check via GET thread detail)
      const getResponse = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });
      const getJson = JSON.parse(getResponse.payload);
      expect(getJson.data.thread.comments[0].likeCount).toBe(1);
    });

    it('should remove like when user has already liked the comment (toggle unlike)', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLogin(server, 'user1');

      // Create thread and comment through API
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread title', body: 'thread body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'comment content' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Like the comment first
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action - Unlike the comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const json = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(json.status).toBe('success');

      // Verify like is removed (likeCount should be 0)
      const getResponse = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });
      const getJson = JSON.parse(getResponse.payload);
      expect(getJson.data.thread.comments[0].likeCount).toBe(0);
    });

    it('should show likeCount in GET thread detail after likes', async () => {
      // Arrange
      const server = await createServer(container);
      const token1 = await registerAndLogin(server, 'user1');
      const token2 = await registerAndLogin(server, 'user2');
      const token3 = await registerAndLogin(server, 'user3');

      // Create thread and comment
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread title', body: 'thread body' },
        headers: { Authorization: `Bearer ${token1}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'comment content' },
        headers: { Authorization: `Bearer ${token1}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Action - Three users like the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token1}` },
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token2}` },
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token3}` },
      });

      // Get thread detail
      const threadDetailResponse = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const threadJson = JSON.parse(threadDetailResponse.payload);
      expect(threadDetailResponse.statusCode).toBe(200);
      expect(threadJson.status).toBe('success');
      expect(threadJson.data.thread.comments[0].likeCount).toBe(3);
    });

    it('should show correct likeCount after user unlikes', async () => {
      // Arrange
      const server = await createServer(container);
      const token1 = await registerAndLogin(server, 'user1');
      const token2 = await registerAndLogin(server, 'user2');

      // Create thread and comment
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread title', body: 'thread body' },
        headers: { Authorization: `Bearer ${token1}` },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'comment content' },
        headers: { Authorization: `Bearer ${token1}` },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Two users like the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token1}` },
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token2}` },
      });

      // User1 unlikes the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${token1}` },
      });

      // Get thread detail
      const threadDetailResponse = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const threadJson = JSON.parse(threadDetailResponse.payload);
      expect(threadDetailResponse.statusCode).toBe(200);
      expect(threadJson.status).toBe('success');
      expect(threadJson.data.thread.comments[0].likeCount).toBe(1);
    });
  });
});
