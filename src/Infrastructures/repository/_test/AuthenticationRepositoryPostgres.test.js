const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const pool = require("../../database/postgres/pool");
const AuthenticationRepositoryPostgres = require("../AuthenticationRepositoryPostgres");

describe("AuthenticationRepository postgres", () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addToken function", () => {
    it("should add token to database", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool
      );
      const token = "token";

      // Action
      await authenticationRepository.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe("checkAvailabilityToken function", () => {
    it("should return 0 if token not available", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool
      );
      const token = "token";

      // Action
      const count = await authenticationRepository.checkAvailabilityToken(
        token
      );

      // Assert
      expect(count).toBe(0);
    });

    it("should return > 0 if token available", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool
      );
      const token = "token";
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      const count = await authenticationRepository.checkAvailabilityToken(
        token
      );

      // Assert
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("deleteToken", () => {
    it("should delete token from database", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool
      );
      const token = "token";
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      await authenticationRepository.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
