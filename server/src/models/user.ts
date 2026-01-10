import mongoose, { Schema, Document } from 'mongoose';

/**
 * Trainee Note: We use an Interface to tell TypeScript 
 * exactly what a 'User' object looks like. 
 * This prevents errors when we try to access user data later.
 */
export interface IMessage {
    role: 'user' | 'model';
    content: string;
    metrics: {
        latency: number;      // Time before first key press
        backspaces: number;   // Number of times they deleted
        idleTime: number;     // Pauses during typing
    };
    timestamp: Date;
}

export interface IUser extends Document {
    secretKey: string;
    name?: string;       
    profession?: string;
    stressScore: number;
    history: IMessage[];
}

// Defining the Schema for MongoDB
const UserSchema: Schema = new Schema({
    // We make secretKey unique so no two users have the same ID
    secretKey: { type: String, required: true, unique: true },

    name: { type: String, default: "" },       
    profession: { type: String, default: "" },
    
    // stressScore will be updated by Gemini based on the metrics
    stressScore: { type: Number, default: 0 },
    
    // history stores the entire conversation and the "subconscious" data
    history: [{
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        metrics: {
            latency: { type: Number, default: 0 },
            backspaces: { type: Number, default: 0 },
            idleTime: { type: Number, default: 0 }
        },
        timestamp: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export default mongoose.model<IUser>('User', UserSchema);