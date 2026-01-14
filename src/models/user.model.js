import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationTokenExpiry: {
            type: Date,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return 
    }
   
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.generateAccessToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
    return token;
};


userSchema.methods.generateRefreshToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10d",
        }
    );
    return token;
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateTemporaryToken = function () {
    const unhashedToken = crypto.randomBytes(32).toString("hex")

    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")

    const tokenExpiry = Date.now() + (20 * 60 * 1000)

    return { unhashedToken, hashedToken, tokenExpiry }
}

export const User = mongoose.model("User", userSchema);