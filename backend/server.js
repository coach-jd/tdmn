require("dotenv").config(); // Carga las variables del archivo .env
const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Configura SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita CORS con manejo explícito de preflight requests (OPTIONS)
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://waymentorlatam.com",
    ], // Permite los orígenes locales y de producción
    methods: ["GET", "POST", "OPTIONS"], // Permite los métodos GET, POST y OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
    credentials: true, // Si usas cookies o autenticación basada en sesiones
  })
);

// Middleware para parsear JSON en las solicitudes con un límite mayor de tamaño
app.use(bodyParser.json({ limit: "50mb" })); // Aumenta el límite a 50 MB para JSON
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Aumenta el límite a 50 MB para formularios

// Ruta para manejar solicitudes preflight (OPTIONS)
app.options("*", cors()); // Permitir todas las rutas para solicitudes preflight

// Ruta para enviar el PDF por correo
app.post("/send-email", async (req, res) => {
  const { pdfBase64, name, email } = req.body;

  // Verifica que todos los campos requeridos estén presentes
  if (!pdfBase64 || !name || !email) {
    return res
      .status(400)
      .json({ message: "Faltan datos requeridos: nombre, correo o PDF." });
  }

  // Lee la plantilla del correo
  const emailTemplate = fs.readFileSync(
    path.join(__dirname, "templates", "emailTemplate.html"),
    "utf8"
  );

  // Reemplaza los valores dinámicos en la plantilla
  const customizedTemplate = emailTemplate
    .replace("{to_name}", name)
    .replace("{to_email}", email)
    .replace("{company_name}", "WayMentor Latam");

  // Configuración del mensaje de correo
  const msg = {
    to: email, // Correo del destinatario
    from: {
      email: process.env.FROM_EMAIL, // Correo del remitente desde el .env
      name: "WayMentor Latam", // Nombre opcional del remitente
    },
    bcc: "diagnosticos@waymentorlatam.com", // Solo una copia oculta a este correo
    subject: `Informe de Diagnóstico de Modelo de Negocio para ${name}`,
    html: customizedTemplate, // Usa la plantilla personalizada
    attachments: [
      {
        content: pdfBase64, // Contenido del PDF en base64
        filename: "informe_tdmn.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  try {
    // Enviar el correo
    await sgMail.send(msg);
    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error(
      "Error al enviar el correo:",
      error.response ? error.response.body.errors : error.message
    );
    res.status(500).json({
      message: "Hubo un error al enviar el correo",
      error: error.response ? error.response.body : error.message,
    });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
