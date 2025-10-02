const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

const registerAndLogin = async (
  server,
  { username, password = "secret", fullname = "Test User" }
) => {
  await server.inject({
    method: "POST",
    url: "/users",
    payload: { username, password, fullname },
  });
  const loginRes = await server.inject({
    method: "POST",
    url: "/authentications",
    payload: { username, password },
  });
  const {
    data: { accessToken },
  } = JSON.parse(loginRes.payload);
  return accessToken;
};

describe("GET thread detail with replies", () => {
  beforeAll(async () => {
    // Ensure replies table exists (safety across environments)
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
    await pool.query(
      "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replies') THEN DELETE FROM replies; END IF; END $$;"
    );
    await pool.query("DELETE FROM threads");
    await UsersTableTestHelper.cleanTable();
  });

  it("should include replies under the correct comment", async () => {
    const server = await createServer(container);
    const tokenDicoding = await registerAndLogin(server, {
      username: "dicoding",
    });
    const tokenJohn = await registerAndLogin(server, { username: "johndoe" });

    // Create thread by dicoding
    const threadRes = await server.inject({
      method: "POST",
      url: "/threads",
      payload: { title: "judul", body: "isi" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });
    const {
      data: { addedThread },
    } = JSON.parse(threadRes.payload);

    // Add two comments by dicoding
    const comment1Res = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "komentar pertama" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });
    const {
      data: { addedComment: comment1 },
    } = JSON.parse(comment1Res.payload);

    await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "komentar kedua" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });

    // Add two replies to first comment (john then dicoding)
    const newReplyContent = "sebuah balasan";
    await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${comment1.id}/replies`,
      payload: { content: newReplyContent },
      headers: { Authorization: `Bearer ${tokenJohn}` },
    });
    await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${comment1.id}/replies`,
      payload: { content: newReplyContent },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });

    // Get thread detail
    const getRes = await server.inject({
      method: "GET",
      url: `/threads/${addedThread.id}`,
    });
    const json = JSON.parse(getRes.payload);
    expect(getRes.statusCode).toBe(200);
    const { thread } = json.data;
    expect(Array.isArray(thread.comments)).toBe(true);
    expect(thread.comments.length).toBe(2);
    const commentWithReplies = thread.comments.find(
      (c) => c.id === comment1.id
    );
    expect(commentWithReplies).toBeDefined();
    expect(Array.isArray(commentWithReplies.replies)).toBe(true);
    expect(commentWithReplies.replies.length).toBe(2);
    // Check fields
    const [reply1, reply2] = commentWithReplies.replies;
    expect(typeof reply1.id).toBe("string");
    expect(typeof reply1.date).toBe("string");
    expect(reply1.content).toBe(newReplyContent);
    expect(["dicoding", "johndoe"]).toContain(reply1.username);
    expect(reply2.content).toBe(newReplyContent);
  });

  it("should mask deleted replies with '**balasan telah dihapus**'", async () => {
    const server = await createServer(container);
    const tokenDicoding = await registerAndLogin(server, {
      username: "dicoding",
    });
    const tokenJohn = await registerAndLogin(server, { username: "johndoe" });

    // Create thread and a comment
    const threadRes = await server.inject({
      method: "POST",
      url: "/threads",
      payload: { title: "judul", body: "isi" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });
    const {
      data: { addedThread },
    } = JSON.parse(threadRes.payload);
    const commentRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments`,
      payload: { content: "komentar" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });
    const {
      data: { addedComment },
    } = JSON.parse(commentRes.payload);

    // Two replies
    const replyJohnRes = await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
      payload: { content: "balasan john" },
      headers: { Authorization: `Bearer ${tokenJohn}` },
    });
    const {
      data: { addedReply: replyJohn },
    } = JSON.parse(replyJohnRes.payload);
    await server.inject({
      method: "POST",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
      payload: { content: "balasan dicoding" },
      headers: { Authorization: `Bearer ${tokenDicoding}` },
    });

    // Delete john's reply using john
    const delRes = await server.inject({
      method: "DELETE",
      url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${replyJohn.id}`,
      headers: { Authorization: `Bearer ${tokenJohn}` },
    });
    expect(delRes.statusCode).toBe(200);

    // Get thread detail
    const getRes = await server.inject({
      method: "GET",
      url: `/threads/${addedThread.id}`,
    });
    const json = JSON.parse(getRes.payload);
    expect(getRes.statusCode).toBe(200);
    const { thread } = json.data;
    const comment = thread.comments.find((c) => c.id === addedComment.id);
    expect(comment).toBeDefined();
    const masked = comment.replies.find((r) => r.id === replyJohn.id);
    expect(masked.content).toBe("**balasan telah dihapus**");
  });
});
