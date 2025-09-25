import ampq from "amqplib";
import nodemailer from "nodemailer";
import { ENV_VARS } from "./config/env.config";

const emailConsumer = async (queueName: string, logMessage: string) => {
  try {
    const connection = await ampq.connect({
      protocol: "amqp",
      hostname: ENV_VARS.RABBITMQ_HOST,
      port: 5672,
      username: ENV_VARS.RABBITMQ_USERNAME,
      password: ENV_VARS.RABBITMQ_PASSWORD,
    });

    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    console.log(`✅ Mail Service consumer started, listening for ${logMessage}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body, templateData } = JSON.parse(
            msg.content.toString()
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: ENV_VARS.NODEMAILER_USER,
              pass: ENV_VARS.NODEMAILER_PASS,
            },
          });
          let processedHtml = body;
          if (templateData) {
            Object.keys(templateData).forEach((key) => {
              const placeholder = `{{${key}}}`;
              processedHtml = processedHtml.replace(
                new RegExp(placeholder, "g"),
                templateData[key]
              );
            });
          }
          await transporter.sendMail({
            from: `"Whispr" <${ENV_VARS.NODEMAILER_USER}>`,
            to,
            subject,
            html: processedHtml,
            text: `Your verification code: ${
              templateData?.otpCode ||
              "Please enable HTML emails to view this message properly."
            }`,
          });

          console.log(`Email sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log(`Failed to send email for queue ${queueName}`, error);
        }
      }
    });
  } catch (error) {
    console.log("Failed to connect to rabbitmq consumer", error);
  }
};

export const startSendOTPConsumer = () => emailConsumer("send-otp", "otp emails");
export const startSendVerificationSuccessConsumer = () =>
  emailConsumer(
    "send-verification-success",
    "verification success emails"
  );