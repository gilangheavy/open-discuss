class ReplyRepository {
  async addReply(reply) {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyReplyOwner(replyId, owner) {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteReply(replyId) {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getRepliesByCommentId(commentId) {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = ReplyRepository;
