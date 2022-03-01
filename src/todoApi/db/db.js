const { MongoMemoryServer } = require("mongodb-memory-server");

const dbStartUp = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017, // by default choose any free port
      ip: "127.0.0.1", // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
      //dbPath?: string, // by default create in temp directory
      storageEngine: "ephemeralForTest", // by default `ephemeralForTest`, available engines: [ 'ephemeralForTest', 'wiredTiger' ]
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
