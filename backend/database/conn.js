// for mongo db connection

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import ENV from '../config.js';

async function connect(){
    // create new mongodb instance when we will start our server
    const mongod = await MongoMemoryServer.create();
    const getUri = mongod.getUri();

    mongoose.set('strictQuery', true)
    const db = mongoose.connect(ENV.ATLAS_URI);
    console.log("Database Connected")
    return db;
}

export default connect;