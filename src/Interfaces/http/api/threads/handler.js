/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const LikeUseCase = require('../../../../Applications/use_case/LikeUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase.addThread(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const thread = await threadUseCase.getThread(request.params.threadId);
    const response = h.response({
      status: 'success',
      data: { thread },
    });
    response.code(200);
    return response;
  }

  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment(
      request.payload,
      threadId,
      owner,
    );

    const response = h.response({
      status: 'success',
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
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const addedReply = await replyUseCase.addReply(
      request.payload,
      threadId,
      commentId,
      owner,
    );

    const response = h.response({
      status: 'success',
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
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    await likeUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
