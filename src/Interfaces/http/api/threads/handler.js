const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");

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

  async getThreadByIdHandler(request) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const thread = await getThreadUseCase.execute(request.params.threadId);

    return {
      status: "success",
      data: {
        thread,
      },
    };
  }

  async postCommentHandler(request, h) {
    try {
      const { id: owner } = request.auth.credentials;
      const { threadId } = request.params;
      // cek ketersediaan thread
      const getThreadUseCase = this._container.getInstance(
        GetThreadUseCase.name
      );
      await getThreadUseCase.execute(threadId);

      // validasi payload
      const { content } = request.payload || {};
      if (typeof content !== "string" || !content) {
        const response = h.response({
          status: "fail",
          message: "payload tidak valid",
        });
        response.code(400);
        return response;
      }

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
    } catch (error) {
      if (error.name === "NotFoundError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }
      if (
        error.message &&
        error.message.startsWith("ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY")
      ) {
        const response = h.response({
          status: "fail",
          message: "content, threadId, dan owner harus ada",
        });
        response.code(400);
        return response;
      }
      if (
        error.message &&
        error.message.startsWith("ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION")
      ) {
        const response = h.response({
          status: "fail",
          message: "content, threadId, dan owner harus bertipe string",
        });
        response.code(400);
        return response;
      }
      throw error;
    }
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
