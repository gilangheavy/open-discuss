const ReplyUseCase = require("../../../../Applications/use_case/ReplyUseCase");
const ThreadUseCase = require("../../../../Applications/use_case/ThreadUseCase");
const CommentUseCase = require("../../../../Applications/use_case/CommentUseCase");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../../Domains/replies/ReplyRepository");

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const addedReply = await replyUseCase.addReply(
      request.payload,
      threadId,
      commentId,
      owner
    );

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReply(threadId, commentId, replyId, owner);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase.addThread(request.payload, userId);

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    try {
      const threadUseCase = this._container.getInstance(ThreadUseCase.name);
      const commentRepository = this._container.getInstance(
        CommentRepository.name
      );
      const replyRepository = this._container.getInstance(ReplyRepository.name);
      const thread = await threadUseCase.getThread(request.params.threadId);
      // ambil semua komentar pada thread
      const commentsRaw = await commentRepository.getCommentsByThreadId(
        request.params.threadId
      );
      // mapping sesuai kriteria + ambil replies per komentar
      const comments = await Promise.all(
        commentsRaw.map(async (comment) => {
          const repliesRaw = await replyRepository.getRepliesByCommentId(
            comment.id
          );
          const replies = repliesRaw.map((reply) => ({
            id: reply.id,
            content: reply.is_delete
              ? "**balasan telah dihapus**"
              : reply.content,
            date: reply.date,
            username: reply.username,
          }));

          return {
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: comment.is_delete
              ? "**komentar telah dihapus**"
              : comment.content,
            replies,
          };
        })
      );
      // urutkan ascending
      comments.sort((a, b) => new Date(a.date) - new Date(b.date));
      // response sesuai kriteria
      const response = h.response({
        status: "success",
        data: {
          thread: {
            id: thread.id,
            title: thread.title,
            body: thread.body,
            date:
              thread.date instanceof Date
                ? thread.date.toISOString()
                : thread.date,
            username: thread.username,
            comments,
          },
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error.name === "NotFoundError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }
      // log unexpected error for debugging
      // eslint-disable-next-line no-console
      console.error("getThreadByIdHandler unexpected error:", error);
      throw error;
    }
  }

  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment(
      request.payload,
      threadId,
      owner
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteComment(threadId, commentId, owner);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
