import { Router } from "express";
import {
    getPersonality,
    upsertPersonality
} from "../controllers/personality.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getPersonality);
router.route("/").post(verifyJWT, upsertPersonality);
router.route("/").patch(verifyJWT, upsertPersonality);

export default router;
