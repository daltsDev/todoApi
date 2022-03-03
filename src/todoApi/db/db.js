const { MongoMemoryServer } = require("mongodb-memory-server");
/**
 * This application uses MongoDB Memory Sever.
 * A pitfall of this application is the data is lost once the server is restarted
 * In the future we should consider utilizing an on-disk Database
 * See https://github.com/stephen-dalton/todoApi/issues/1
 */

const dbStartUp = async () => {
  /**
   * Create the Database Instance on Localhost, and PORT 27017.
   * MongoDB v5.0.2
   */
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      ip: "127.0.0.1",
      storageEngine: "ephemeralForTest",
    },
    binary: {
      version: "5.0.2",
    },
  });
  return mongod;
};

const dbConn = async () => {
  const mongod = await dbStartUp();
  const uri = mongod.getUri();
  return uri;
};

const dbShutDown = async () => {
  const mongod = await dbStartUp();
  await mongod.stop({ doCleanup: true, force: false });
};

module.exports = { dbConn, dbShutDown };
