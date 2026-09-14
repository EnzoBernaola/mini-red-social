// Envía mails usando la API HTTP de Brevo (antes Sendinblue).
// Se usa la API en vez de SMTP porque Render bloquea los puertos
// SMTP (25/465/587) en el plan free; la API va por HTTPS (443), que sí está permitido.
// Variables de entorno necesarias: BREVO_API_KEY, EMAIL_FROM
export const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM, name: "Mini Red Social" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al enviar el mail (Brevo): ${res.status} ${errorBody}`);
  }
};
