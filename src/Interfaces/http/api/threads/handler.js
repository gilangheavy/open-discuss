const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
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
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(
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
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );
    await deleteReplyUseCase.execute(threadId, commentId, replyId, owner);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload, userId);

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
      const getThreadUseCase = this._container.getInstance(
        GetThreadUseCase.name
      );
      const commentRepository = this._container.getInstance(
        CommentRepository.name
      );
      const replyRepository = this._container.getInstance(ReplyRepository.name);
      const thread = await getThreadUseCase.execute(request.params.threadId);
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
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const addedComment = await addCommentUseCase.execute(
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
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );
    await deleteCommentUseCase.execute(threadId, commentId, owner);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
