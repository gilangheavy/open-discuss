/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const InvariantError = require('../../Commons/exceptions/InvariantError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

class LogoutUserUseCase {
  constructor({
    authenticationRepository,
  }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { refreshToken } = useCasePayload;

    const tokenCount = await this._authenticationRepository.checkAvailabilityToken(refreshToken);
    if (tokenCount === 0) {
      throw new InvariantError(
        DomainErrorTranslator.translate(new Error('AUTHENTICATION.NOT_FOUND')).message,
      );
    }

    await this._authenticationRepository.deleteToken(refreshToken);
  }

  _validatePayload(payload) {
    const { refreshToken } = payload;
    if (!refreshToken) {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LogoutUserUseCase;
