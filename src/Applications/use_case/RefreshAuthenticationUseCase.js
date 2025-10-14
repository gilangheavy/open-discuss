/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
const InvariantError = require('../../Commons/exceptions/InvariantError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

class RefreshAuthenticationUseCase {
  constructor({
    authenticationRepository,
    authenticationTokenManager,
  }) {
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { refreshToken } = useCasePayload;

    await this._authenticationTokenManager.verifyRefreshToken(refreshToken);

    const tokenCount = await this._authenticationRepository.checkAvailabilityToken(refreshToken);
    if (tokenCount === 0) {
      throw new InvariantError(
        DomainErrorTranslator.translate(new Error('AUTHENTICATION.NOT_FOUND')).message,
      );
    }

    const { username, id } = await this._authenticationTokenManager.decodePayload(refreshToken);

    return this._authenticationTokenManager.createAccessToken({ username, id });
  }

  _verifyPayload(payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = RefreshAuthenticationUseCase;
