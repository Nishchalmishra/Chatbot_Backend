import { Router } from "express";
import { registerUser, loginUser, verifyEmail, resendEmailVerification, refreshAccessToken } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post( loginUser)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)

// secured route
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification)

export default router;