const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const pool = require("../../database/postgres/pool");
const UserRepositoryPostgres = require("../UserRepositoryPostgres");

describe("UserRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableUsername function", () => {
    it("should return > 0 when username not available", async () => {
      await UsersTableTestHelper.addUser({ username: "dicoding" });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const count = await userRepositoryPostgres.verifyAvailableUsername(
        "dicoding"
      );
      expect(count).toBeGreaterThan(0);
    });

    it("should return 0 when username available", async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const count = await userRepositoryPostgres.verifyAvailableUsername(
        "dicoding"
      );
      expect(count).toBe(0);
    });
  });

  describe("addUser function", () => {
    it("should persist register user and return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUsersById("user-123");
      expect(users).toHaveLength(1);
    });

    it("should return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: "dicoding",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(
        new RegisteredUser({
          id: "user-123",
          username: "dicoding",
          fullname: "Dicoding Indonesia",
        })
      );
    });
  });

  describe("getPasswordByUsername", () => {
    it("should return undefined when user not found", async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const pass = await userRepositoryPostgres.getPasswordByUsername(
        "dicoding"
      );
      expect(pass).toBeUndefined();
    });

    it("should return username password when user is found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        username: "dicoding",
        password: "secret_password",
      });

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername(
        "dicoding"
      );
      expect(password).toBe("secret_password");
    });
  });

  describe("getIdByUsername", () => {
    it("should return undefined when user not found", async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const id = await userRepositoryPostgres.getIdByUsername("dicoding");
      expect(id).toBeUndefined();
    });

    it("should return user id correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-321",
        username: "dicoding",
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId = await userRepositoryPostgres.getIdByUsername("dicoding");

      // Assert
      expect(userId).toEqual("user-321");
    });
  });
});
