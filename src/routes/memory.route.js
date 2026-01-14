import { Router } from "express";
import {
    getMemories,
    addMemory,
    updateMemory,
    deleteMemory
} from "../controllers/memory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.get("/", verifyJWT, getMemories);
// router.post("/", verifyJWT, addMemory);
// router.patch("/:id", verifyJWT, updateMemory);
// router.delete("/:id", verifyJWT, deleteMemory);

router.route("/").get(verifyJWT, getMemories);
router.route("/").post(verifyJWT, addMemory);
router.route("/:id").patch(verifyJWT, updateMemory);
router.route("/:id").delete(verifyJWT, deleteMemory);

export default router;
