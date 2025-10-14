/* eslint-disable no-underscore-dangle */
const RegisterUser = require('../../Domains/users/entities/RegisterUser');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload);

    const usernameCount = await this._userRepository.verifyAvailableUsername(registerUser.username);
    if (usernameCount > 0) {
      throw new InvariantError('username tidak tersedia');
    }

    registerUser.password = await this._passwordHash.hash(registerUser.password);
    return this._userRepository.addUser(registerUser);
  }
}

module.exports = AddUserUseCase;
