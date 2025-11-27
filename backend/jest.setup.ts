import { jest } from "@jest/globals";
import type { Transporter, SentMessageInfo } from "nodemailer";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.PORT = process.env.PORT ?? "5000";
process.env.DB_HOST = process.env.DB_HOST ?? "localhost";
process.env.DB_PORT = process.env.DB_PORT ?? "3306";
process.env.DB_USER = process.env.DB_USER ?? "test_user";
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? "test_password";
process.env.DB_NAME = process.env.DB_NAME ?? "test_db";

process.env.EMAIL_HOST = process.env.EMAIL_HOST ?? "smtp.sample.com";
process.env.EMAIL_PORT = process.env.EMAIL_PORT ?? "587";
process.env.EMAIL_SECURE = process.env.EMAIL_SECURE ?? "false";
process.env.EMAIL_USER = process.env.EMAIL_USER ?? "test@example.com";
process.env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD ?? "test_password";
