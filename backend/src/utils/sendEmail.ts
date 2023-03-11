import Nodemailer from "nodemailer";
import createHttpError from 'http-errors';
import env from "./validateEnv";

const sendEmail = async (email: string, subject: string, html: string) => {
    try {
        const transporter = Nodemailer.createTransport({
            host: env.NODEMAILER_HOST,
            service: env.NODEMAILER_SERVICE,
            port: env.NODEMAILER_PORT,
            secure: true,
            auth: {
                user: env.NODEMAILER_USER,
                pass: env.NODEMAILER_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: env.NODEMAILER_USER,
            to: email,
            subject: subject,
            html: html,
        });
    } catch (error) {
        createHttpError(502, "Failed to send email");
    }
}

export default sendEmail;