import { CORE_RULES } from "../utils/constant.js";
import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js"
import { Personality } from "../models/personality.model.js"
import { Memory } from "../models/memory.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

const sendMessage = asyncHandler(async (req, res) => {

    const userId = req.user._id
    const { message } = req.body

    if(!message){
        throw new ApiError(400, "Message is required")
    }

    await Chat.create({
        user : userId,
        role: "user",
        message
    })

    let personality = await Personality.findOne({ user: userId })

    if(!personality){
        personality = await Personality.create({ user: userId });
    }

    const memories = await Memory.find({ user: userId })

    // let memoryText 
    
    // console.log(memories)
    // if (memories === null || memories.length === 0) {
    //     memoryText = "None";
    // } else {
    //     memoryText = memories.array
    //         .map(m => `${m.key}: ${m.value}`)
    //         .join("\n");
    // }

    const memoryText = memories.length
        ? memories.map(m => `${m.key}: ${m.value}`).join("\n")
        : "";

    const chats = await Chat.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(20)
    
    chats.reverse()
    
    console.log(chats)
    
    const chatHistory = chats.map(c => `${c.role}:${c.message}`).join("\n")

    const finalPrompt = `
        ${personality.systemPrompt}

        Important facts about the user:
        ${memoryText || "None"}

        Conversation:
        ${chatHistory}

        assistant:
    `;


    const systemPrompt = `
        ${CORE_RULES}

        ${personality.systemPrompt}
        `;

    // const messages = [
    //     { role: "system", content: systemPrompt },
    //     ...chats.map(c => ({ role: c.role, content: c.message })),
    //     { role: "user", content: message }
    // ];

    


    try {

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt + "\n\nUser facts:\n" + memoryText },
                    ...chats.map(c => ({ role: c.role, content: c.message })),
                    { role: "user", content: message }
                ]
                // messages
            })
        });

        // const response = await fetch("https://api.groq.com/openai/v1/models", {
        //     method: "GET",
        //     headers: {
        //         "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        //     }
        // });

        

        // const models = await response.json();
        // console.log(models);
        const data = await response.json();
        console.log(data)
        const reply = data.choices[0].message.content;

        console.log("AI REPLY:", reply);

        await Chat.create({
            user: userId,
            role: "assistant",
            message: reply
        });
    
        res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        throw new ApiError(500, "Something went wrong, nhi aya response")
    }



})

export { sendMessage }