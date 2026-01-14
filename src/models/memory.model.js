import mongoose, { Schema } from "mongoose";

const memorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        key: {
            type: String,
            required: true
        },

        value: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Memory = mongoose.model("Memory", memorySchema);
