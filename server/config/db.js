const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/funbuzz';

    let hasPlaceholder = uri.includes('<db_password>') || uri.includes('<password>');
    if (hasPlaceholder) {
      console.log('\n⚠️  NOTICE: MONGO_URI in .env contains placeholder "<db_password>".');
      console.log('   Please replace <db_password> with your actual MongoDB Atlas password when ready.');
      console.log('   Falling back to local / embedded MongoDB so the server starts seamlessly...\n');
    }

    // Check if external / local MongoDB instance is already accessible
    if (hasPlaceholder || !uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        const localTarget = hasPlaceholder ? 'mongodb://127.0.0.1:27017/funbuzz' : uri;
        await mongoose.connect(localTarget, { serverSelectionTimeoutMS: 2500 });
        console.log(`\n✅ MongoDB Connected (Local/Service): ${mongoose.connection.host}`);
        console.log(`🍃 MongoDB Compass URI: ${localTarget}`);
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

    try {
      await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (remoteErr) {
      console.error(`\n❌ Failed to connect to remote MongoDB: ${remoteErr.message}`);
      console.log('   Falling back to embedded MongoDB server...\n');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'funbuzz' } });
      const compassUri = mongoServer.getUri();
      await mongoose.connect(compassUri + 'funbuzz');
      console.log(`✅ MongoDB Connected (Embedded Fallback): ${mongoose.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const getMongoServer = () => mongoServer;

module.exports = connectDB;
module.exports.getMongoServer = getMongoServer;
