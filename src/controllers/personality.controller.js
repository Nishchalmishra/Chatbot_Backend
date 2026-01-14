import { Personality } from "../models/personality.model.js";
import { asyncHandler } from "../utils/async-handler.js";

// Get current personality
export const getPersonality = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    let personality = await Personality.findOne({ user: userId });

    // If user has none, create default
    if (!personality) {
        personality = await Personality.create({ user: userId });
    }

    res.status(200).json({
        success: true,
        personality
    });
});


// Create or Update personality
export const upsertPersonality = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, systemPrompt, tone, style } = req.body;

    let personality = await Personality.findOne({ user: userId });

    if (!personality) {
        personality = await Personality.create({
            user: userId,
            name,
            systemPrompt,
            tone,
            style
        });
    } else {
        if (name) personality.name = name;
        if (systemPrompt) personality.systemPrompt = systemPrompt;
        if (tone) personality.tone = tone;
        if (style) personality.style = style;

        await personality.save();
    }

    res.status(200).json({
        success: true,
        personality
    });
});
