import { Memory } from "../models/memory.model.js";
import { asyncHandler } from "../utils/async-handler.js";

// Get all memories of user
export const getMemories = asyncHandler(async (req, res) => {
    const memories = await Memory.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        memories
    });
});

// Add a new memory
export const addMemory = asyncHandler(async (req, res) => {
    const { key, value } = req.body;

    if (!key || !value) {
        return res.status(400).json({ error: "Key and value are required" });
    }

    const memory = await Memory.create({
        user: req.user._id,
        key,
        value
    });

    res.status(201).json({
        success: true,
        memory
    });
});

// Update a memory
export const updateMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { key, value } = req.body;

    const memory = await Memory.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { key, value },
        { new: true }
    );

    if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
    }

    res.status(200).json({
        success: true,
        memory
    });
});

// Delete a memory
export const deleteMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const memory = await Memory.findOneAndDelete({
        _id: id,
        user: req.user._id
    });

    if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
    }

    res.status(200).json({
        success: true,
        message: "Memory deleted"
    });
});
