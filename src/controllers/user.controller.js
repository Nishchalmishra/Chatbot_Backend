import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js" 
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js"
import crypto from "node:crypto";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res) =>{
    
    const { username, email, password } = req.body;
    
    if(!username || !email || !password){
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ email });
    if(userExists){
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    });

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});


    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "User created successfully"
            )
        )

})


const loginUser = asyncHandler(async (req, res) => { 

    const { email, password } = req.body;
    
    if(!email || !password){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });
    if(!user){
        throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken, user: loggedInUser },
                "User logged in successfully"
            )
        );

})

const verifyEmail = asyncHandler(async (req, res) => { 

    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is required")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Email verified successfully"
            )
        ); 

})


const resendEmailVerification = asyncHandler(async (req, res) => { 

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Email verification link sent successfully"
            )
        );

})

const refreshAccessToken = asyncHandler(async (req, res) => { 


    const incomingRefreshToken = req.cookies.refreshToken; 

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }


    // try {

        const decodeIncomingToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decodeIncomingToken._id);

        // console.log(user)

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is invalid");
        }

        const options = {
            httpOnly: true,
            secure:true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );

    // } catch (error) {
        
    //     throw new ApiError(500, "Something went wrong while refreshing access token", error)

    // }



})


export {
    registerUser,
    loginUser,
    verifyEmail,    
    resendEmailVerification,
    refreshAccessToken
}