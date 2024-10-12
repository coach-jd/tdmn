import { categorias } from "./categorias.js";

// Variables y elementos del DOM
let currentCategoryIndex = 0; // Índice de la categoría actual
const initialForm = document.getElementById("initial-form"); // Formulario inicial
const questionContainer = document.getElementById("question-container"); // Contenedor de preguntas
const categoryTitle = document.getElementById("category-title"); // Título de la categoría
const questionsDiv = document.getElementById("questions"); // Contenedor de las preguntas
const prevButton = document.getElementById("prev-button"); // Botón "Anterior"
const nextButton = document.getElementById("next-button"); // Botón "Siguiente"
const submitButton = document.getElementById("submit-button"); // Botón "Enviar respuestas"
const reportContainer = document.getElementById("report-container"); // Contenedor del informe
const progressBar = document.getElementById("progress"); // Barra de progreso

let userResponses = []; // Arreglo para almacenar las respuestas del usuario
let userScores = []; // Arreglo para almacenar los puntajes de las categorías

// Variables para el contador de palabras
const descripcionStartup = document.getElementById("descripcion_startup");
const wordCountDisplay = document.getElementById("word-count");

// Evento de envío del formulario inicial
initialForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (validateWordCount()) {
    document.querySelector(".form-container").style.display = "none";
    questionContainer.style.display = "block";
    updateProgressBar();
    showCategory(currentCategoryIndex);
  }
});

// Evento de clic del botón "Anterior"
prevButton.addEventListener("click", () => {
  if (currentCategoryIndex > 0) {
    currentCategoryIndex--;
    showCategory(currentCategoryIndex);
    updateProgressBar();
  }
});

// Evento de clic del botón "Siguiente"
nextButton.addEventListener("click", () => {
  if (validateCategory()) {
    if (currentCategoryIndex < categorias.length - 1) {
      currentCategoryIndex++;
      showCategory(currentCategoryIndex);
      updateProgressBar();
    }
  }
});

// Evento de clic del botón "Enviar respuestas"
submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateCategory()) {
    if (confirm("¿Estás seguro de que deseas enviar tus respuestas?")) {
      generateReport();
    }
  }
});

// Evento para contar las palabras en tiempo real en la descripción
descripcionStartup.addEventListener("input", updateWordCount);

// Función para mostrar las preguntas de una categoría
function showCategory(index) {
  const category = categorias[index];
  categoryTitle.textContent = category.nombre;
  questionsDiv.innerHTML = "";
  category.preguntas.forEach((pregunta, i) => {
    const questionDiv = document.createElement("div");
    questionDiv.innerHTML = `
      <p>${pregunta.texto}</p>
      <label><input type="radio" name="pregunta${i}" value="Sí" required> Sí</label>
      <label><input type="radio" name="pregunta${i}" value="No" required> No</label>
    `;
    questionsDiv.appendChild(questionDiv);
  });
  prevButton.style.display = index === 0 ? "none" : "inline-block";
  nextButton.style.display =
    index === categorias.length - 1 ? "none" : "inline-block";
  submitButton.style.display =
    index === categorias.length - 1 ? "inline-block" : "none";
}

// Función para validar que todas las preguntas de la categoría actual hayan sido respondidas
function validateCategory() {
  const inputs = questionsDiv.querySelectorAll('input[type="radio"]');
  for (let i = 0; i < inputs.length; i += 2) {
    if (!inputs[i].checked && !inputs[i + 1].checked) {
      alert("Por favor, responde todas las preguntas antes de continuar.");
      return false;
    }
  }
  collectResponses();
  return true;
}

// Función para recoger las respuestas seleccionadas de la categoría actual
function collectResponses() {
  const inputs = questionsDiv.querySelectorAll('input[type="radio"]:checked');
  const responses = Array.from(inputs).map((input) => input.value);
  userResponses[currentCategoryIndex] = responses;
}

// Función para generar el informe de respuestas
function generateReport() {
  // Limpiar la pantalla
  questionContainer.style.display = "none";
  reportContainer.style.display = "block";
  reportContainer.innerHTML = "";

  // Presentar el título "Informe de Respuestas"
  const title = document.createElement("h2");
  title.textContent = "Informe de Respuestas";
  reportContainer.appendChild(title);

  // Mostrar los datos del usuario
  const userData = document.createElement("div");
  userData.className = "user-data";
  const formData = new FormData(initialForm);
  userData.innerHTML = `
    <p><strong>Nombre:</strong> ${formData.get("nombre_apellido")}</p>
    <p><strong>Correo Electrónico:</strong> ${formData.get("correo")}</p>
    <p><strong>País:</strong> ${formData.get("pais")}</p>
    <p><strong>Nombre de la Startup:</strong> ${formData.get("nombre_startup")}</p>
    <p><strong>Descripción de la Startup:</strong> ${formData.get("descripcion_startup")}</p>
  `;
  reportContainer.appendChild(userData);

  // Calcular puntajes del usuario para cada categoría
  userScores = calculateUserScores();

  // Mostrar la gráfica radar aquí
  generateRadarChart(userScores);

  // Contenedor para las respuestas
  const responsesContainer = document.createElement("div");
  responsesContainer.className = "responses-container";

  let totalUserScore = 0;
  const maxScorePerCategory = 5;
  const totalMaxScore = categorias.length * maxScorePerCategory;

  categorias.forEach((category, index) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category-div";
    categoryDiv.innerHTML = `<h3>${category.nombre}</h3>`;
    let categoryScore = 0;

    category.preguntas.forEach((pregunta, i) => {
      const response = userResponses[index][i];
      const score = response === "Sí" ? 1 : 0;
      categoryScore += score;
      categoryDiv.innerHTML += `<p>${pregunta.texto}: ${response}</p>`;
    });

    categoryDiv.innerHTML += `<p><strong>Puntaje de la categoría:</strong> ${categoryScore} / ${maxScorePerCategory}</p>`;
    responsesContainer.appendChild(categoryDiv);

    totalUserScore += categoryScore;
  });

  reportContainer.appendChild(responsesContainer);

  // Mostrar la totalización del puntaje
  const totalScoreDiv = document.createElement("div");
  totalScoreDiv.className = "total-score";
  totalScoreDiv.innerHTML = `<p><strong>Puntaje Total del Usuario:</strong> ${totalUserScore} / ${totalMaxScore}</p>`;
  reportContainer.appendChild(totalScoreDiv);

  // Añadir el botón "Generar PDF"
  addGeneratePDFButton();
}

// Función para calcular los puntajes del usuario en cada categoría
function calculateUserScores() {
  const scores = [];
  categorias.forEach((category, index) => {
    let categoryScore = 0;
    category.preguntas.forEach((pregunta, i) => {
      const response = userResponses[index][i];
      const score = response === "Sí" ? 1 : 0;
      categoryScore += score;
    });
    scores.push(categoryScore);
  });
  return scores;
}

// Función para generar un gráfico de radar con los puntajes del usuario
function generateRadarChart(userScores) {
  // Eliminar el canvas existente
  const existingCanvas = document.querySelector("canvas");
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Crear un nuevo canvas
  const ctx = document.createElement("canvas");
  ctx.className = "radar-chart";
  reportContainer.appendChild(ctx);

  // Inicializar datos del gráfico
  const maxScores = new Array(categorias.length).fill(5);

  // Crear el gráfico de radar
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: categorias.map((category) => category.nombre),
      datasets: [
        {
          label: "Puntaje del Usuario",
          data: userScores,
          backgroundColor: "rgba(102, 204, 255, 0.2)",
          borderColor: "#66CCFF",
          pointBackgroundColor: "#66CCFF",
        },
        {
          label: "Puntaje Máximo",
          data: maxScores,
          backgroundColor: "rgba(255, 204, 153, 0.2)",
          borderColor: "#FFCC99",
          pointBackgroundColor: "#FFCC99",
        },
      ],
    },
    options: {
      scales: {
        r: {
          angleLines: {
            display: false,
          },
          suggestedMin: 0,
          suggestedMax: 5,
        },
      },
    },
  });
}

// Función para validar el número de palabras de la descripción de la startup
function validateWordCount() {
  const wordCount = descripcionStartup.value.trim().split(/\s+/).length;
  if (wordCount > 50) {
    alert("La descripción de la startup no debe exceder las 50 palabras.");
    return false;
  }
  return true;
}

// Función para actualizar el contador de palabras
function updateWordCount() {
  const wordCount = descripcionStartup.value.trim().split(/\s+/).length;
  wordCountDisplay.textContent = `${wordCount}/50 palabras`;
  if (wordCount > 50) {
    wordCountDisplay.classList.add("exceeded");
  } else {
    wordCountDisplay.classList.remove("exceeded");
  }
}

// Función para actualizar la barra de progreso
function updateProgressBar() {
  const progress = ((currentCategoryIndex + 1) / categorias.length) * 100;
  progressBar.style.width = `${progress}%`;
}
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Función para generar el PDF
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "letter");

  const formData = new FormData(initialForm);
  const userName = formData.get("nombre_apellido");
  const userEmail = formData.get("correo");
  const userCountry = formData.get("pais");
  const startupName = formData.get("nombre_startup");
  const startupDescription = formData.get("descripcion_startup");

  const userScores = calculateUserScores();
  const totalUserScore = userScores.reduce((a, b) => a + b, 0);
  const maxScorePerCategory = 5;
  const totalMaxScore = categorias.length * maxScorePerCategory;

  const pageWidth = doc.internal.pageSize.getWidth();

  // Página 1: Título y datos del usuario
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleText = "Diagnóstico de Modelo de Negocio";
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(titleText, titleX, 50);

  // Información del usuario
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${userName}`, 40, 100);
  doc.text(`Correo: ${userEmail}`, 40, 120);
  doc.text(`País: ${userCountry}`, 40, 140);
  doc.text(`Nombre de la Startup: ${startupName}`, 40, 160);

  // Descripción con control de línea y justificada
  const descriptionY = 180;
  const descriptionMaxWidth = pageWidth - 80;
  const descriptionLines = doc.splitTextToSize(startupDescription, descriptionMaxWidth);
  doc.text(descriptionLines, 40, descriptionY, { align: "left" });

  const descriptionEndY = descriptionY + doc.getTextDimensions(descriptionLines).h + 20;

  // Puntaje total del usuario
  const totalScoreY = descriptionEndY + 40;
  const totalScoreText = `Puntaje Total del Usuario: ${totalUserScore} / ${totalMaxScore}`;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const totalScoreWidth = doc.getTextWidth(totalScoreText);
  const totalScoreX = (pageWidth - totalScoreWidth) / 2;
  doc.text(totalScoreText, totalScoreX, totalScoreY);

  // Gráfica de radar
  const radarCanvas = document.querySelector("canvas");
  if (radarCanvas) {
      const radarImage = radarCanvas.toDataURL("image/png");
      const radarX = (pageWidth - 400) / 2; // Centrar la gráfica
      doc.addImage(radarImage, "PNG", radarX, totalScoreY + 40, 400, 400);
  }

  doc.addPage();

  // Añadir categorías en sets de tres por página
  for (let i = 0; i < categorias.length; i += 3) {
      addCategoryResponsesToPDF(doc, i, Math.min(i + 2, categorias.length - 1), pageWidth);
      if (i + 3 < categorias.length) {
          doc.addPage();
      }
  }

  // Añadir pie de página a partir de la segunda página
  addFooter(doc, 1);


  /////////////
 // Convertir el PDF a Base64
 const pdfBase64 = doc.output('datauristring').split(',')[1];

 // Llamar a la función para enviar el PDF por correo
 sendPDFByEmail(pdfBase64, userName, userEmail);
  /////////////

  doc.save("informe_respuestas.pdf");
}

// Función para añadir respuestas de las categorías al PDF con recuadro y totalización del puntaje
function addCategoryResponsesToPDF(doc, startCategory, endCategory, pageWidth) {
  let yPosition = 50;
  const yOffset = 20; // Espacio entre elementos

  for (let i = startCategory; i <= endCategory; i++) {
      const category = categorias[i];
      const categoryTitle = `${category.nombre}`;
      const categoryResponses = userResponses[i]
          .map((response, index) => `${categorias[i].preguntas[index].texto}: ${response}`)
          .join("\n");

      // Recuadro para la categoría
      const boxTopY = yPosition;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);

      // Añadir título de la categoría
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(categoryTitle, 50, yPosition + 20);
      yPosition += 40;

      // Añadir respuestas con control de líneas
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(categoryResponses, pageWidth - 100);
      doc.text(lines, 50, yPosition);
      yPosition += lines.length * 14 + 10;

      // Añadir totalización de la categoría
      const categoryScore = userScores[i];
      const categoryMaxScore = 5;
      doc.setFontSize(12);
      doc.text(`Puntaje de la categoría: ${categoryScore} / ${categoryMaxScore}`, 50, yPosition);
      yPosition += 20;

      // Dibujar el recuadro
      const boxHeight = yPosition - boxTopY + 10;
      doc.rect(40, boxTopY, pageWidth - 80, boxHeight);

      yPosition += yOffset;

      // Controlar salto de página si es necesario
      if (yPosition > 700 && i < endCategory) {
          doc.addPage();
          yPosition = 50;
      }
  }
}

// Función para añadir el pie de página a partir de una página específica
function addFooter(doc, startPage) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerText = "Diagnóstico del Modelo de Negocio proporcionado por WayMentor Latam";
  const linkText = "https://waymentorlatam.com/";
  
  for (let i = startPage; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      const footerX = (pageWidth - doc.getTextWidth(footerText)) / 2;
      doc.text(footerText, footerX, 770);
      const linkX = (pageWidth - doc.getTextWidth(linkText)) / 2;
      doc.textWithLink(linkText, linkX, 785, { url: linkText });
  }
}

// Función para añadir el botón "Generar PDF"
function addGeneratePDFButton() {
  const pdfButton = document.createElement("button");
  pdfButton.textContent = "Generar PDF";
  pdfButton.id = "pdf-button";
  reportContainer.appendChild(pdfButton);

  pdfButton.addEventListener("click", generatePDF);
}

// Función para enviar el PDF por correo
// Función para enviar el PDF por correo
function sendPDFByEmail(pdfBase64, userName, userEmail) {
  // Detecta si estamos en un entorno local o en producción
  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://waymentorlatam.com';

  fetch(`${baseUrl}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userEmail,
      pdfBase64: pdfBase64,
      name: userName
    })
  })
  .then(response => {
    if (!response.ok) {  // Verifica si la respuesta del servidor es exitosa
      throw new Error('Error en la respuesta del servidor.');
    }
    return response.json();  // Convierte la respuesta a JSON solo si es exitosa
  })
  .then(data => {
    alert('Correo enviado exitosamente.');  // Mensaje en caso de éxito
  })
  .catch(error => {
    console.error('Error al enviar el correo:', error);
    alert('Hubo un error al enviar el correo. Inténtalo nuevamente más tarde.');  // Mensaje de error
  });
}


