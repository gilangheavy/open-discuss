const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

const registerAndLogin = async (server, { username = "dicoding" } = {}) => {
  await server.inject({
    method: "POST",
    url: "/users",
    payload: { username, password: "secret", fullname: "Dicoding Indonesia" },
  });
  const loginRes = await server.inject({
    method: "POST",
    url: "/authentications",
    payload: { username, password: "secret" },
  });
  const {
    data: { accessToken },
  } = JSON.parse(loginRes.payload);
  return accessToken;
};

describe("/replies endpoints", () => {
  beforeAll(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS replies (
        id VARCHAR(50) PRIMARY KEY,
        comment_id VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        owner VARCHAR(50) NOT NULL,
        is_delete BOOLEAN NOT NULL DEFAULT FALSE,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_replies_comment_id_comments_id') THEN
          ALTER TABLE replies ADD CONSTRAINT fk_replies_comment_id_comments_id FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_replies_owner_users_id') THEN
          ALTER TABLE replies ADD CONSTRAINT fk_replies_owner_users_id FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  });
  afterAll(async () => {
    await pool.end();
  });
  beforeEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.query(
      "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replies') THEN DELETE FROM replies; END IF; END $$;"
    );
    await pool.query("DELETE FROM threads");
    await UsersTableTestHelper.cleanTable();
  });
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    // Clean replies table if exists
    await pool.query(
      "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replies') THEN DELETE FROM replies; END IF; END $$;"
    );
    await pool.query("DELETE FROM threads");
    await UsersTableTestHelper.cleanTable();
  });

  it("POST /threads/{threadId}/comments/{commentId}/replies should add reply and return 201", async () => {
    const server = await createServer(container);
    const accessToken = await registerAndLogin(server, {});
    // create thread
    const threadRes = await server.inject({
      method: "POST",
      url: "/threads",
      payload: { title: "judul", body: "isi" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedThread },
    } = JSON.parse(threadRes.payload);
    // add comment
    const commentRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "sebuah comment" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedComment },
    } = JSON.parse(commentRes.payload);
    // add reply
    const res = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
      payload: { content: "sebuah balasan" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toBe(201);
    expect(json.status).toBe("success");
    expect(json.data.addedReply).toBeDefined();
  });

  it("DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId} should return 200", async () => {
    const server = await createServer(container);
    const accessToken = await registerAndLogin(server, {});
    const threadRes = await server.inject({
      method: "POST",
      url: "/threads",
      payload: { title: "judul", body: "isi" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedThread },
    } = JSON.parse(threadRes.payload);
    const commentRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "sebuah comment" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedComment },
    } = JSON.parse(commentRes.payload);
    const replyRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
      payload: { content: "sebuah balasan" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedReply },
    } = JSON.parse(replyRes.payload);
    const delRes = await server.inject({
      method: "DELETE",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = JSON.parse(delRes.payload);
    expect(delRes.statusCode).toBe(200);
    expect(json.status).toBe("success");
  });

  it("POST replies returns 404 when thread or comment invalid", async () => {
    const server = await createServer(container);
    const accessToken = await registerAndLogin(server, {});
    const res = await server.inject({
      method: "POST",
      url: `/threads/thread-xxx/comments/comment-xxx/replies`,
      payload: { content: "x" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST replies returns 400 when payload invalid", async () => {
    const server = await createServer(container);
    const accessToken = await registerAndLogin(server, {});
    const threadRes = await server.inject({
      method: "POST",
      url: "/threads",
      payload: { title: "judul", body: "isi" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedThread },
    } = JSON.parse(threadRes.payload);
    const commentRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "sebuah comment" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: { addedComment },
    } = JSON.parse(commentRes.payload);
    const res = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
      payload: { content: 123 },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.statusCode).toBe(400);
  });
});
