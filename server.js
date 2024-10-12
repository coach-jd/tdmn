// Carga las variables del archivo .env (como la API key de SendGrid, el correo de origen, etc.)
require("dotenv").config();

// Importación de dependencias necesarias
const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Configuración de SendGrid API Key a partir de las variables de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000; // Puerto por defecto es 3000 si no hay uno en las variables de entorno

// Configuración de CORS
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000", // Añadir esto si estás haciendo la solicitud desde el puerto 3000 en local
      "https://waymentorlatam.com", // Dominio de producción
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware para parsear las solicitudes JSON y URL-encoded con un límite de 50MB
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Ruta para manejar las solicitudes preflight (OPTIONS), necesarias en CORS
app.options("*", cors());

// Implementación de autenticación básica para proteger la ruta de envío de correos
// Este middleware verifica un token de autenticación en los encabezados de la solicitud
app.use((req, res, next) => {
  const specialToken = req.headers["authorization"]?.split(" ")[1];
  console.log("Token recibido:", specialToken); // Verificar el token recibido
  if (authToken === process.env.SPECIAL_TOKEN) {
    next(); // Si el token es válido, continúa con la solicitud
  } else {
    return res.status(403).json({ message: "No autorizado" });
  }
});

// Ruta para enviar correos electrónicos con un PDF adjunto
app.post("/send-email", async (req, res) => {
  const { pdfBase64, name, email } = req.body;

  // Validación: Verifica que los campos requeridos estén presentes
  if (!pdfBase64 || !name || !email) {
    return res
      .status(400)
      .json({ message: "Faltan datos requeridos: nombre, correo o PDF." });
  }

  try {
    // Lee la plantilla HTML del correo desde el sistema de archivos
    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "templates", "emailTemplate.html"),
      "utf8"
    );

    // Reemplaza los valores dinámicos (nombre del destinatario, correo, nombre de la empresa)
    const customizedTemplate = emailTemplate
      .replace("{to_name}", name)
      .replace("{to_email}", email)
      .replace("{company_name}", "WayMentor Latam");

    // Configuración del mensaje de correo con SendGrid
    const msg = {
      to: email, // Dirección de correo del destinatario
      from: {
        email: process.env.FROM_EMAIL, // Correo del remitente desde las variables de entorno
        name: "WayMentor Latam", // Nombre del remitente
      },
      bcc: "diagnosticos@waymentorlatam.com", // Envío de copia oculta para control interno
      subject: `Informe de Diagnóstico de Modelo de Negocio para ${name}`, // Asunto personalizado
      html: customizedTemplate, // Cuerpo del correo con la plantilla personalizada
      attachments: [
        {
          content: pdfBase64, // Contenido del PDF en formato base64
          filename: "informe_tdmn.pdf", // Nombre del archivo adjunto
          type: "application/pdf", // Tipo MIME del archivo
          disposition: "attachment", // Indica que es un archivo adjunto
        },
      ],
    };

    // Intento de envío de correo
    await sgMail.send(msg);
    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    // Manejo de errores detallado
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

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
