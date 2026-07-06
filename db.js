const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/inotebook"; //mongoDb se connection string idhr paste krdo

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to Mongo successfully.");
    } catch (error) {
        console.error("Mongo connection failed:", error);
    }
}

module.exports = connectToMongo;