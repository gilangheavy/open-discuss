/* eslint-disable no-underscore-dangle */
const UserLogin = require('../../Domains/users/entities/UserLogin');
const NewAuthentication = require('../../Domains/authentications/entities/NewAuth');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const { username, password } = new UserLogin(useCasePayload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);
    if (!encryptedPassword) {
      throw new InvariantError('username tidak ditemukan');
    }

    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);
    if (!id) {
      throw new InvariantError('user tidak ditemukan');
    }

    const accessToken = await this._authenticationTokenManager
      .createAccessToken({ username, id });
    const refreshToken = await this._authenticationTokenManager
      .createRefreshToken({ username, id });

    const newAuthentication = new NewAuthentication({
      accessToken,
      refreshToken,
    });

    await this._authenticationRepository.addToken(newAuthentication.refreshToken);

    return newAuthentication;
  }
}

module.exports = LoginUserUseCase;
