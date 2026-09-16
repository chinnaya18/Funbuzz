const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/funbuzz';

    // Check if external / local MongoDB instance is already accessible
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        console.log(`\n✅ MongoDB Connected (Local/Service): ${mongoose.connection.host}`);
        console.log(`🍃 MongoDB Compass URI: ${uri}`);
        return;
      } catch (err) {
        console.log('\n⚡ No active MongoDB service detected on port 27017.');
        console.log('   Starting embedded MongoDB server for development & MongoDB Compass...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        
        try {
          // Attempt to bind to default MongoDB port 27017 so Compass connects out of the box
          mongoServer = await MongoMemoryServer.create({
            instance: { port: 27017, dbName: 'funbuzz' }
          });
        } catch (portErr) {
          // If 27017 is occupied, fallback to an assigned port
          console.log('   Port 27017 busy, allocating available port...');
          mongoServer = await MongoMemoryServer.create({
            instance: { dbName: 'funbuzz' }
          });
        }

        const compassUri = mongoServer.getUri();
        uri = compassUri + 'funbuzz';
        
        console.log(`\n╔══════════════════════════════════════════════════════════════════╗`);
        console.log(`║ 🍃 MONGODB COMPASS CONNECTION READY                             ║`);
        console.log(`║ Connect String : ${compassUri.padEnd(46)} ║`);
        console.log(`║ Database Name  : funbuzz                                        ║`);
        console.log(`╚══════════════════════════════════════════════════════════════════╝\n`);
      }
    }

    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const getMongoServer = () => mongoServer;

module.exports = connectDB;
module.exports.getMongoServer = getMongoServer;
