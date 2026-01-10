import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        // Use the ! to fix the "undefined" error
        const conn = await mongoose.connect(process.env.MONGO_URI!); 
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1); 
    }
};

export default connectDB;