import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        message: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Chat = mongoose.model("Chat", chatSchema);
