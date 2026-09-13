import nodemailer from "nodemailer";

// Usa una cuenta de Gmail con "contraseña de aplicación"
// (no la contraseña normal de la cuenta).
// Variables de entorno necesarias: EMAIL_USER, EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Mini Red Social" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
