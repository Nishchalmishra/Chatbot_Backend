import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {

    const accessToken  = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) {
        throw new ApiError(401, "Unauthorized: Access token not found")
    }

    try {
        const decodeToken = jwt.verify(accessToken, process.env.JWT_SECRET)

        const user = await User.findById(decodeToken._id)

        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found")
        }

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, "Unauthorized: Invalid token")
    }


})
