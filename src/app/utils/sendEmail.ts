/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { TransportOptions } from "nodemailer";
import { envVars } from "./env";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: envVars.EMAIL_SENDER.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASSWORD,
    },
} as TransportOptions);

interface SendEmailOptions {
    to: string;
    subject: string;
    attachments?: {
        filename: string;
        content: string | Buffer;
        contentType: string;
    }[];
    templateName: string;
    templateData: Record<string, unknown>;
}

export const sendEmail = async (options: SendEmailOptions) => {
    try {
        const { to, subject, attachments, templateName, templateData } = options;
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments,
        });
        console.log(`Message sent: ${info.messageId}`);
    } catch (error: any) {
        if (error instanceof Error) {
            console.error("Error sending email:", error.message);
        }
    }
}