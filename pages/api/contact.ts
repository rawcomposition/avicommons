import { Resend } from "resend";
import type { NextApiRequest, NextApiResponse } from "next";

const resend = new Resend(process.env.RESEND_KEY);

type ContactData = {
  name: string;
  email: string;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message }: ContactData = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!process.env.RESEND_EMAIL) {
    return res.status(500).json({ error: "Email configuration missing" });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: process.env.RESEND_EMAIL,
      subject: `New Avicommons message from ${name}`,
      html: `
        <strong>Name:</strong> ${name}<br />
        <strong>Email:</strong> ${email}<br /><br />
        <strong>Message:</strong><br />${message}
        <br />
        <hr>
        <p><em>This message was sent through the Avicommons contact form.</em></p>
        <p><em>You can reply directly to this email to contact the user.</em></p>
      `,
      replyTo: email,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
