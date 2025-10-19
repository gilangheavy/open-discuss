const HealthRepository = require('../HealthRepository');

describe('HealthRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const healthRepository = new HealthRepository();

    // Action & Assert
    await expect(healthRepository.checkDatabaseConnection()).rejects.toThrow(
      'HEALTH_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
