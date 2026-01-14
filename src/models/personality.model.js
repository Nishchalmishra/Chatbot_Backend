import mongoose, { Schema } from "mongoose";

const personalitySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true   // one personality per user
        },

        name: {
            type: String,
            default: "Haven"
        },

        systemPrompt: {
            type: String,
            default:
                "You are a warm, poetic, emotionally intelligent AI companion who speaks gently and cares deeply about the user."
        },

        tone: {
            type: String,
            default: "soft"
        },

        style: {
            type: String,
            default: "poetic"
        }
    },
    {
        timestamps: true
    }
);

export const Personality = mongoose.model("Personality", personalitySchema);
