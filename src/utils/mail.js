import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";
import Mailgen from "mailgen";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options)=>{
    
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "AI Chatbot",
            link: "https://ai-chatbot.vercel.app/"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent
    )

    const emailHtml = mailGenerator.generate(
        options.mailgenContent
    );

    const recipient = process.env.NODE_ENV === "development" ? process.env.TEST_EMAIL : options.email;

    try {
        await resend.emails.send({
            from: "Project Management App <onboarding@resend.dev>",
            to: recipient,
            subject: options.subject,
            html: emailHtml,
            text: emailTextual
        });

        console.log("📨 Email sent successfully");

    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }

}

const emailVerificationMailgenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to project management app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your email",
                    link: verficationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export { sendEmail, emailVerificationMailgenContent }   