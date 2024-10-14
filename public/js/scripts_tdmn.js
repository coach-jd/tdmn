//import { categorias } from "./categorias.js"; // Importa un objeto llamado "categorias" desde otro archivo
import { categorias } from "./categorias_tdmn.js";
// Variables y elementos del DOM (Document Object Model)
let currentCategoryIndex = 0; // Índice de la categoría actual, empieza en 0
const initialForm = document.getElementById("initial-form"); // Formulario inicial que el usuario completa
const questionContainer = document.getElementById("question-container"); // Contenedor donde se muestran las preguntas de las categorías
const categoryTitle = document.getElementById("category-title"); // Título que muestra el nombre de la categoría actual
const questionsDiv = document.getElementById("questions"); // Contenedor donde se muestran las preguntas específicas de cada categoría
const prevButton = document.getElementById("prev-button"); // Botón que permite navegar a la categoría anterior
const nextButton = document.getElementById("next-button"); // Botón que permite avanzar a la siguiente categoría
const submitButton = document.getElementById("submit-button"); // Botón que permite enviar las respuestas del cuestionario
const reportContainer = document.getElementById("report-container"); // Contenedor donde se mostrará el informe con las respuestas
const progressBar = document.getElementById("progress"); // Barra de progreso que muestra el avance en el cuestionario

let userResponses = []; // Arreglo para almacenar las respuestas que el usuario proporciona
let userScores = []; // Arreglo para almacenar los puntajes calculados por categoría

// Variables para el contador de palabras en la descripción de la startup
const descripcionStartup = document.getElementById("descripcion_startup"); // Campo donde el usuario escribe la descripción de su startup
const wordCountDisplay = document.getElementById("word-count"); // Elemento que muestra el contador de palabras

// Evento de envío del formulario inicial
initialForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

  if (validateWordCount()) {
    // Si la función de validación de palabras retorna verdadero
    document.querySelector(".form-container").style.display = "none"; // Oculta el formulario inicial
    questionContainer.style.display = "block"; // Muestra el contenedor de preguntas
    updateProgressBar(); // Actualiza la barra de progreso
    showCategory(currentCategoryIndex); // Muestra la primera categoría de preguntas
  }
});

// Evento de clic del botón "Anterior"
prevButton.addEventListener("click", () => {
  if (currentCategoryIndex > 0) {
    // Si no estamos en la primera categoría
    currentCategoryIndex--; // Retrocede a la categoría anterior
    showCategory(currentCategoryIndex); // Muestra la categoría actualizada
    updateProgressBar(); // Actualiza la barra de progreso
  }
});

// Evento de clic del botón "Siguiente"
nextButton.addEventListener("click", () => {
  if (validateCategory()) {
    // Valida si todas las preguntas de la categoría actual han sido respondidas
    if (currentCategoryIndex < categorias.length - 1) {
      // Mostrar el mensaje de la categoría actual en el modal
      const categoryMessage = categorias[currentCategoryIndex].mensaje;
      document.getElementById("categoryMessageContent").textContent =
        categoryMessage;

      // Mostrar el modal de Bootstrap
      $("#categoryMessageModal").modal("show");

      // Cuando el modal se cierra, avanzar a la siguiente categoría
      document.getElementById("modalCloseButton").addEventListener(
        "click",
        () => {
          currentCategoryIndex++; // Avanza a la siguiente categoría
          showCategory(currentCategoryIndex); // Muestra la nueva categoría
          updateProgressBar(); // Actualiza la barra de progreso
        },
        { once: true }
      ); // Asegura que el evento se escuche solo una vez
    }
  }
});

// Evento de clic del botón "Enviar respuestas"
submitButton.addEventListener("click", (e) => {
  e.preventDefault(); // Evita el comportamiento por defecto del formulario
  if (validateCategory()) {
    // Valida si todas las preguntas han sido respondidas
    if (confirm("¿Estás seguro de que deseas enviar tus respuestas?")) {
      // Pide confirmación antes de enviar
      generateReport(); // Genera el informe con las respuestas
    }
  }
});

// Evento para contar las palabras en tiempo real en la descripción de la startup
descripcionStartup.addEventListener("input", updateWordCount); // Escucha cambios en el campo de descripción para actualizar el contador de palabras

/////////////////////////////////
////////////////////////////////
// Función para mostrar la categoría actual
function showCategory(index) {
  const category = categorias[index]; // Obtiene la categoría en base al índice actual
  // Elimina la imagen anterior si existe
  const existingImg = categoryTitle.previousElementSibling;
  if (existingImg && existingImg.tagName === "IMG") {
    existingImg.remove(); // Elimina la imagen anterior
  }

  // Crear y añadir la imagen centrada
  const imgElement = document.createElement("img");
  imgElement.src = `categorias_dmn/categoria${index}.svg`; // Asigna la ruta dinámica
  imgElement.alt = `Imagen de la categoría ${category.nombre}`;
  imgElement.style.width = "200px";
  imgElement.style.height = "200px";
  imgElement.style.display = "block";
  imgElement.style.margin = "0 auto"; // Para centrar la imagen

  // Añadir la imagen antes del título de la categoría
  categoryTitle.parentNode.insertBefore(imgElement, categoryTitle); // Inserta la imagen antes del título

  // Cambia el título a la categoría actual
  categoryTitle.textContent = category.nombre;

  questionsDiv.innerHTML = ""; // Limpia las preguntas anteriores

  // Crear y añadir la descripción de la categoría
  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = category.descripcion;
  descriptionElement.className = "category-description"; // Puedes añadir una clase CSS para estilos adicionales
  questionsDiv.appendChild(descriptionElement); // Añade la descripción al contenedor

  ///////////////////////
  // Escala de valores lingüísticos para la escala de 1 a 7
  const scaleLabels = {
    1: "Totalmente en desacuerdo",
    2: "En desacuerdo",
    3: "Algo en desacuerdo",
    4: "Neutral / Ni de acuerdo ni en desacuerdo",
    5: "Algo de acuerdo",
    6: "De acuerdo",
    7: "Totalmente de acuerdo",
  };

  // Itera sobre cada pregunta de la categoría
  category.preguntas.forEach((pregunta, i) => {
    const questionDiv = document.createElement("div"); // Crea un nuevo div para cada pregunta
    questionDiv.classList.add("question-container"); // Añade una clase para estilos si es necesario

    // Crear el elemento de texto de la pregunta numerada y en negrita
    const questionText = document.createElement("p");
    questionText.innerHTML = `<strong>${i + 1}. ${pregunta.texto}</strong>`;
    questionDiv.appendChild(questionText);

    // Crear el input type="range" para el rango de 1 a 7
    const rangeInput = document.createElement("input");
    rangeInput.type = "range";
    rangeInput.name = `pregunta${i}`;
    rangeInput.min = 1;
    rangeInput.max = 7;
    rangeInput.value = 4; // Valor inicial al centro del rango
    rangeInput.step = 1;
    rangeInput.required = true; // Campo obligatorio

    // Crear un elemento span para mostrar el valor lingüístico asociado al valor seleccionado
    const rangeValue = document.createElement("span");
    rangeValue.className = "range-value"; // Clase para aplicar estilos
    rangeValue.textContent = `(${scaleLabels[rangeInput.value]})`; // Mostrar el valor inicial en formato lingüístico

    // Escuchar el evento 'input' para actualizar dinámicamente el valor seleccionado
    rangeInput.addEventListener("input", function () {
      rangeValue.textContent = `(${scaleLabels[rangeInput.value]})`; // Mostrar el valor lingüístico en lugar del numérico
    });

    // Añadir el input range y el valor mostrado al div de la pregunta
    questionDiv.appendChild(rangeInput);
    questionDiv.appendChild(rangeValue);

    // Añadir la pregunta completa al contenedor de preguntas
    questionsDiv.appendChild(questionDiv);
  });

  ///////////////////////
  // Mostrar/ocultar los botones de navegación
  prevButton.style.display = index === 0 ? "none" : "inline-block"; // Si es la primera categoría, oculta el botón "Anterior"
  nextButton.style.display =
    index === categorias.length - 1 ? "none" : "inline-block"; // Si es la última categoría, oculta el botón "Siguiente"
  submitButton.style.display =
    index === categorias.length - 1 ? "inline-block" : "none"; // Si es la última categoría, muestra el botón "Enviar respuestas"
}

///////////////////////////
///////////////////////////

// Función para validar que todas las preguntas de la categoría actual hayan sido respondidas
function validateCategory() {
  const inputs = questionsDiv.querySelectorAll('input[type="range"]'); // Cambiado a "range"
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      // Validar que se haya seleccionado un valor
      alert("Por favor, responde todas las preguntas antes de continuar."); // Muestra una alerta
      return false; // Retorna falso y evita que el usuario avance
    }
  }
  collectResponses(); // Si todas las preguntas fueron respondidas, recolecta las respuestas
  return true; // Permite avanzar a la siguiente categoría
}

// Función para recoger las respuestas seleccionadas de la categoría actual
function collectResponses() {
  const inputs = questionsDiv.querySelectorAll('input[type="range"]'); // Cambiado a "range"
  const responses = Array.from(inputs).map((input) => input.value); // Crea un arreglo con las respuestas del rango
  userResponses[currentCategoryIndex] = responses; // Guarda las respuestas en la posición correspondiente a la categoría actual
}

function generateReport() {
  // Limpiar la pantalla
  questionContainer.style.display = "none"; // Oculta el contenedor de preguntas
  reportContainer.style.display = "block"; // Muestra el contenedor del informe
  reportContainer.innerHTML = ""; // Limpia cualquier contenido previo

  // Presentar el título "Informe de Respuestas"
  const title = document.createElement("h2");
  title.textContent = "Informe de Respuestas"; // Añade el título del informe
  reportContainer.appendChild(title); // Lo añade al contenedor

  // Mostrar los datos del usuario
  const userData = document.createElement("div");
  userData.className = "user-data"; // Clase para estilo
  const formData = new FormData(initialForm); // Obtiene los datos del formulario inicial
  userData.innerHTML = `
    <p><strong>Nombre:</strong> ${formData.get("nombre_apellido")}</p>
    <p><strong>Correo Electrónico:</strong> ${formData.get("correo")}</p>
    <p><strong>Celular:</strong> ${formData.get(
      "celular"
    )}</p> <!-- Añadido el número de celular -->
    <p><strong>País:</strong> ${formData.get("pais")}</p>
    <p><strong>Nombre del Emprendimiento:</strong> ${formData.get(
      "nombre_startup"
    )}</p>
    <p><strong>Descripción del Emprendimiento:</strong> ${formData.get(
      "descripcion_startup"
    )}</p>
  `; // Muestra los datos ingresados por el usuario
  reportContainer.appendChild(userData); // Añade los datos al contenedor

  // Calcular puntajes del usuario para cada categoría
  userScores = calculateUserScores(); // Calcula los puntajes por categoría (promedio)

  // Mostrar la gráfica radar aquí
  generateRadarChart(userScores); // Genera la gráfica de radar con los puntajes

  // Contenedor para las respuestas
  const responsesContainer = document.createElement("div");
  responsesContainer.className = "responses-container"; // Clase para estilo

  let totalUserAverageScore = 0; // Variable para almacenar la sumatoria de los promedios por categoría
  const maxScorePerCategory = 7; // Puntaje máximo por categoría es 7
  const totalMaxScore = categorias.length * maxScorePerCategory; // Puntaje total máximo (7 * número de categorías)

  categorias.forEach((category, index) => {
    // Recorre todas las categorías
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category-div"; // Clase para estilo
    categoryDiv.innerHTML = `<h3>${category.nombre}</h3>`; // Añade el nombre de la categoría
    let categoryScore = 0; // Inicializa el puntaje de la categoría

    category.preguntas.forEach((pregunta, i) => {
      // Recorre todas las preguntas de la categoría
      const response = parseInt(userResponses[index][i], 10); // Obtiene la respuesta del usuario como número
      categoryScore += response; // Suma el puntaje de la pregunta a la categoría
      categoryDiv.innerHTML += `<p>${pregunta.texto}: ${response}</p>`; // Muestra la respuesta del usuario
    });

    // Calcular el promedio de la categoría
    const categoryAverageScore = categoryScore / category.preguntas.length;

    // Sumar el promedio de la categoría a la sumatoria total de promedios
    totalUserAverageScore += categoryAverageScore;

    // Mostrar el puntaje promedio de la categoría
    categoryDiv.innerHTML += `<p><strong>Puntaje promedio de la categoría:</strong> ${categoryAverageScore.toFixed(
      2
    )} / ${maxScorePerCategory}</p>`; // Muestra el puntaje promedio obtenido en la categoría
    responsesContainer.appendChild(categoryDiv); // Añade la categoría al contenedor
  });

  reportContainer.appendChild(responsesContainer); // Añade las respuestas al informe

  // Mostrar la totalización del puntaje basado en la sumatoria de promedios
  const totalScoreDiv = document.createElement("div");
  totalScoreDiv.className = "total-score"; // Clase para estilo

  // La variable totalUserAverageScore contiene la sumatoria de los promedios obtenidos en cada categoría
  totalScoreDiv.innerHTML = `<p><strong>Sumatoria de Promedios del Usuario:</strong> ${totalUserAverageScore.toFixed(
    2
  )} / ${totalMaxScore}</p>`; // Muestra la sumatoria de los promedios sobre el puntaje máximo
  reportContainer.appendChild(totalScoreDiv); // Añade el puntaje al informe

  // Añadir el botón "Generar PDF"
  addGeneratePDFButton(); // Añade el botón que permite generar el PDF
}

// Función para calcular los puntajes promedio del usuario en cada categoría
function calculateUserScores() {
  const scores = []; // Arreglo para almacenar los puntajes promedio

  categorias.forEach((category, index) => {
    let categoryScore = 0; // Inicializa el puntaje total de la categoría
    const totalQuestions = category.preguntas.length; // Número total de preguntas en la categoría

    category.preguntas.forEach((pregunta, i) => {
      const response = parseInt(userResponses[index][i], 10); // Obtiene la respuesta del usuario como número
      categoryScore += response; // Suma el puntaje de la pregunta
    });

    const averageScore = categoryScore / totalQuestions; // Calcula el promedio de puntajes en la categoría
    scores.push(averageScore); // Guarda el puntaje promedio de la categoría en el arreglo
  });

  return scores; // Retorna los puntajes promedio calculados
}

///////////////////////////
///////////////////////////
// Función para generar un gráfico de radar con los puntajes del usuario
function generateRadarChart(userScores) {
  // Eliminar el canvas existente
  const existingCanvas = document.querySelector("canvas.radar-chart");
  if (existingCanvas) {
    existingCanvas.remove(); // Si ya hay un gráfico, lo elimina
  }

  // Crear un nuevo canvas
  const canvas = document.createElement("canvas"); // Crea un nuevo elemento canvas
  canvas.className = "radar-chart"; // Clase para estilo
  canvas.style.width = "100%"; // Asigna ancho completo para el canvas
  canvas.style.height = "800px"; // Fija la altura del canvas
  reportContainer.appendChild(canvas); // Añade el canvas al contenedor

  // Obtener el contexto del canvas
  const ctx = canvas.getContext("2d");

  // Asegurar alta resolución en pantallas de alta densidad de píxeles
  const scale = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * scale;
  canvas.height = canvas.offsetHeight * scale;
  ctx.scale(scale, scale);

  // Inicializar datos del gráfico
  const maxScores = new Array(categorias.length).fill(7); // Puntaje máximo por categoría

  // Crear el gráfico de radar con Chart.js
  new Chart(ctx, {
    type: "radar", // Tipo de gráfico
    data: {
      labels: categorias.map((category) => category.nombre), // Etiquetas de las categorías
      datasets: [
        {
          label: "Puntaje del Usuario", // Etiqueta para el puntaje del usuario
          data: userScores, // Datos del puntaje del usuario
          backgroundColor: "rgba(0,51,102,0.6)", // Fondo azul oscuro con transparencia
          borderColor: "#003366", // Color del borde azul oscuro
          pointBackgroundColor: "#003366", // Color de los puntos del gráfico
          borderWidth: 2, // Grosor de las líneas
          pointRadius: 3, // Tamaño de los puntos
        },
        {
          label: "Puntaje Máximo", // Etiqueta para el puntaje máximo
          data: maxScores, // Puntaje máximo
          backgroundColor: "rgba(102,204,255,0.6)", // Fondo azul claro con transparencia
          borderColor: "#003366", // Color del borde azul claro
          pointBackgroundColor: "#003366", // Color de los puntos
          borderWidth: 2, // Grosor de las líneas
          pointRadius: 3, // Tamaño de los puntos
        },
      ],
    },
    options: {
      scales: {
        r: {
          angleLines: {
            display: false, // Oculta las líneas angulares
          },
          suggestedMin: 0, // Valor mínimo de la escala
          suggestedMax: 7, // Valor máximo de la escala
        },
      },
      elements: {
        line: {
          tension: 0.2, // Suaviza las líneas
        },
      },
    },
  });
}

///////////////////////////
///////////////////////////

// Función para actualizar el contador de palabras
function updateWordCount() {
  const wordCount = descripcionStartup.value.trim().split(/\s+/).length; // Calcula la cantidad de palabras
  wordCountDisplay.textContent = `${wordCount}/80 palabras`; // Actualiza el contador de palabras en el DOM
  if (wordCount > 80) {
    // Si supera el límite
    wordCountDisplay.classList.add("exceeded"); // Añade una clase CSS para resaltar el exceso
  } else {
    wordCountDisplay.classList.remove("exceeded"); // Remueve la clase si el número de palabras es correcto
  }
}

// Evento al presionar el botón "Comenzar diagnóstico"
document
  .getElementById("startDiagnosisButton")
  .addEventListener("click", function () {
    console.log("Botón 1 presionado"); // Log para verificar que se presionó el botón

    if (validateForm()) {
      // Valida el formulario inicial
      console.log("Validación exitosa, mostrando modal"); // Si es válido, muestra el modal
      $("#instructionModal").modal("show"); // Muestra el modal de instrucciones
    }
  });

// Función para validar el formulario inicial (campos obligatorios y su formato)
function validateForm() {
  const nombre = document
    .querySelector('input[name="nombre_apellido"]')
    .value.trim(); // Obtiene el valor del campo "Nombre"
  const correo = document.querySelector('input[name="correo"]').value.trim(); // Obtiene el valor del campo "Correo"
  const celular = document.querySelector('input[name="celular"]').value.trim(); // Obtiene el valor del campo "Celular"
  const pais = document.querySelector('input[name="pais"]').value.trim(); // Obtiene el valor del campo "País"
  const nombreStartup = document
    .querySelector('input[name="nombre_startup"]')
    .value.trim(); // Obtiene el valor del campo "Nombre de la Startup"
  const descripcion = document
    .querySelector('textarea[name="descripcion_startup"]')
    .value.trim(); // Obtiene el valor del campo "Descripción de la Startup"

  // Verificar que el nombre solo contenga letras (incluyendo vocales acentuadas y ñ)
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nombreRegex.test(nombre)) {
    mostrarModalError("El nombre solo puede contener letras.");
    return false; // Si no cumple, retorna falso
  }

  // Verificar que el correo tenga un formato válido
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    mostrarModalError("Por favor, introduce un correo electrónico válido.");
    return false; // Si no cumple, retorna falso
  }

  // Verificar que el número de celular sea válido (puede incluir dígitos, espacios, guiones y un + opcional al inicio)
  const celularRegex = /^\+?[0-9\s-]{7,15}$/;
  if (!celularRegex.test(celular)) {
    mostrarModalError("Por favor, introduce un número de celular válido.");
    return false; // Si no cumple, retorna falso
  }

  // Verificar que el país solo contenga letras
  const paisRegex = /^[a-zA-Z\s]+$/;
  if (!paisRegex.test(pais)) {
    mostrarModalError("El campo país solo puede contener letras.");
    return false; // Si no cumple, retorna falso
  }

  // Verificar que el nombre de la startup no contenga caracteres especiales
  const nombreStartupRegex = /^[a-zA-Z0-9\s]+$/;
  if (!nombreStartupRegex.test(nombreStartup)) {
    mostrarModalError(
      "El nombre del emprendimiento solo puede contener letras y números."
    );
    return false; // Si no cumple, retorna falso
  }

  // Función para validar el número de palabras de la descripción de la startup
  function validateWordCount() {
    const wordCount = descripcion.split(/\s+/).length; // Calcula la cantidad de palabras
    if (wordCount > 80) {
      mostrarModalError(
        "La descripción del emprendimiento no debe exceder las 80 palabras."
      );
      return false; // Retorna falso si no cumple la condición
    }
    return true; // Retorna verdadero si está dentro del límite
  }

  // Verificar si todos los campos obligatorios están llenos
  if (
    nombre === "" ||
    correo === "" ||
    celular === "" ||
    pais === "" ||
    nombreStartup === "" ||
    descripcion === ""
  ) {
    mostrarModalError("Por favor, completa todos los campos obligatorios.");
    return false; // Si algún campo está vacío, retorna falso
  }

  // Validar la descripción antes de continuar
  if (!validateWordCount()) {
    return false; // Si la validación de palabras falla, retorna falso y detiene el proceso
  }

  return true; // Si todos los campos son válidos, retorna verdadero
}

// Función para mostrar el modal de error con un mensaje dinámico
function mostrarModalError(mensaje) {
  document.getElementById("errorModalBody").textContent = mensaje; // Cambia el texto del modal
  $("#errorModal").modal("show"); // Muestra el modal de Bootstrap
}

// Evento al presionar el botón del modal "Comenzar diagnóstico"
document
  .getElementById("startDiagnosisButtonModal")
  .addEventListener("click", function () {
    $("#instructionModal").modal("hide"); // Cierra el modal
    console.log("Botón del modal presionado"); // Log para verificar

    // Mostrar el formulario de categorías
    showCategoryForm(); // Llama a la función para mostrar las categorías
  });

// Función para mostrar el formulario de categorías
function showCategoryForm() {
  document.querySelector(".form-container").style.display = "none"; // Oculta el formulario inicial
  document.getElementById("question-container").style.display = "block"; // Muestra el contenedor de preguntas
  updateProgressBar(); // Actualiza la barra de progreso
  showCategory(currentCategoryIndex); // Muestra la primera categoría
}

// Función para actualizar la barra de progreso
function updateProgressBar() {
  const progress = ((currentCategoryIndex + 1) / categorias.length) * 100; // Calcula el porcentaje de progreso
  progressBar.style.width = `${progress}%`; // Actualiza el ancho de la barra de progreso
}
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Función para generar el PDF
function generatePDF() {
  const { jsPDF } = window.jspdf; // Inicializa la librería jsPDF
  const doc = new jsPDF("p", "pt", "letter"); // Crea un nuevo documento en formato carta

  const formData = new FormData(initialForm); // Obtiene los datos del formulario inicial
  const userName = formData.get("nombre_apellido"); // Obtiene el nombre del usuario
  const userEmail = formData.get("correo"); // Obtiene el correo del usuario
  const userCell = formData.get("celular"); // Obtiene el número de celular del usuario
  const userCountry = formData.get("pais"); // Obtiene el país del usuario
  const startupName = formData.get("nombre_startup"); // Obtiene el nombre de la startup
  const startupDescription = formData.get("descripcion_startup"); // Obtiene la descripción de la startup

  const userScores = calculateUserScores(); // Calcula los puntajes del usuario
  const totalUserScore = userScores.reduce((a, b) => a + b, 0); // Suma los puntajes para obtener el puntaje total
  const maxScorePerCategory = 7; // Puntaje máximo por categoría
  const totalMaxScore = categorias.length * maxScorePerCategory; // Puntaje máximo total

  const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página

  // Página 1: Título y datos del usuario
  doc.setFontSize(18); // Define el tamaño de la fuente
  doc.setFont("helvetica", "bold"); // Define la fuente
  const titleText = "Diagnóstico de Modelo de Negocio"; // Título del documento
  const titleWidth = doc.getTextWidth(titleText); // Ancho del texto
  const titleX = (pageWidth - titleWidth) / 2; // Centra el título
  doc.text(titleText, titleX, 50); // Añade el título al documento

  // Información del usuario
  doc.setFontSize(12); // Tamaño de fuente para la información del usuario
  doc.setFont("helvetica", "normal"); // Fuente normal
  doc.text(`Nombre: ${userName}`, 40, 100); // Añade el nombre
  doc.text(`Correo: ${userEmail}`, 40, 120); // Añade el correo
  doc.text(`Celular: ${userCell}`, 40, 140); // Añade el número de celular
  doc.text(`País: ${userCountry}`, 40, 160); // Añade el país
  doc.text(`Nombre de la Startup: ${startupName}`, 40, 180); // Añade el nombre de la startup

  // Descripción con control de línea y justificada
  const descriptionY = 200; // Coordenada Y para la descripción
  const descriptionMaxWidth = pageWidth - 80; // Ancho máximo de la descripción
  const descriptionLines = doc.splitTextToSize(
    startupDescription,
    descriptionMaxWidth
  ); // Divide la descripción en líneas
  doc.text(descriptionLines, 40, descriptionY, { align: "left" }); // Añade la descripción al documento

  const descriptionEndY =
    descriptionY + doc.getTextDimensions(descriptionLines).h + 20; // Calcula la posición final de la descripción

  // Puntaje total del usuario
  const totalScoreY = descriptionEndY + 40; // Coordenada Y para el puntaje total
  const totalScoreText = `Puntaje Total del Usuario: ${totalUserScore.toFixed(
    2
  )} / ${totalMaxScore}`; // Texto del puntaje total

  doc.setFontSize(14); // Tamaño de fuente para el puntaje
  doc.setFont("helvetica", "bold"); // Fuente en negrita
  const totalScoreWidth = doc.getTextWidth(totalScoreText); // Ancho del texto del puntaje
  const totalScoreX = (pageWidth - totalScoreWidth) / 2; // Centra el texto
  doc.text(totalScoreText, totalScoreX, totalScoreY); // Añade el texto al documento

  // Gráfica de radar
  const radarCanvas = document.querySelector("canvas"); // Obtiene el gráfico de radar
  if (radarCanvas) {
    const radarImage = radarCanvas.toDataURL("image/png"); // Convierte el gráfico a imagen PNG
    const radarX = (pageWidth - 400) / 2; // Centra la imagen
    doc.addImage(radarImage, "PNG", radarX, totalScoreY + 40, 400, 400); // Añade la imagen al documento
  }

  doc.addPage(); // Añade una nueva página

  // Añadir categorías en sets de tres por página
  for (let i = 0; i < categorias.length; i += 3) {
    addCategoryResponsesToPDF(
      doc,
      i,
      Math.min(i + 2, categorias.length - 1),
      pageWidth
    ); // Añade las respuestas al PDF
    if (i + 3 < categorias.length) {
      doc.addPage(); // Añade una nueva página si quedan más categorías
    }
  }

  // Añadir pie de página a partir de la segunda página
  addFooter(doc, 1); // Añade el pie de página

  /////////////
  // Convertir el PDF a Base64
  const pdfBase64 = doc.output("datauristring").split(",")[1]; // Convierte el PDF a base64

  // Llamar a la función para enviar el PDF por correo
  sendPDFByEmail(pdfBase64, userName, userEmail); // Envía el PDF por correo
  /////////////

  doc.save("informe_tdmn.pdf"); // Guarda el PDF
}

// Función para añadir respuestas de las categorías al PDF con recuadro y totalización del puntaje
function addCategoryResponsesToPDF(doc, startCategory, endCategory, pageWidth) {
  let yPosition = 50; // Coordenada Y inicial
  const yOffset = 20; // Espacio entre elementos

  for (let i = startCategory; i <= endCategory; i++) {
    const category = categorias[i]; // Obtiene la categoría actual
    const categoryTitle = `${category.nombre}`; // Título de la categoría
    const categoryResponses = userResponses[i]
      .map(
        (response, index) =>
          `${categorias[i].preguntas[index].texto}: ${response}`
      )
      .join("\n"); // Respuestas del usuario en la categoría

    // Recuadro para la categoría
    const boxTopY = yPosition; // Posición Y del recuadro
    doc.setDrawColor(0, 0, 0); // Color del borde del recuadro
    doc.setLineWidth(0.5); // Ancho del borde

    // Añadir título de la categoría
    doc.setFontSize(14); // Tamaño de fuente del título
    doc.setFont("helvetica", "bold"); // Fuente en negrita
    doc.text(categoryTitle, 50, yPosition + 20); // Añade el título de la categoría
    yPosition += 40; // Incrementa la posición Y

    // Añadir respuestas con control de líneas
    doc.setFontSize(12); // Tamaño de fuente para las respuestas
    doc.setFont("helvetica", "normal"); // Fuente normal
    const lines = doc.splitTextToSize(categoryResponses, pageWidth - 100); // Divide las respuestas en líneas
    doc.text(lines, 50, yPosition); // Añade las respuestas
    yPosition += lines.length * 14 + 10; // Incrementa la posición Y

    // Añadir totalización de la categoría
    const categoryScore = userScores[i]; // Puntaje de la categoría
    const categoryMaxScore = 7; // Puntaje máximo de la categoría
    doc.setFontSize(12); // Tamaño de fuente para el puntaje
    doc.text(
      `Puntaje de la categoría: ${categoryScore} / ${categoryMaxScore}`,
      50,
      yPosition
    ); // Añade el puntaje
    yPosition += 20; // Incrementa la posición Y

    // Dibujar el recuadro
    const boxHeight = yPosition - boxTopY + 10; // Calcula la altura del recuadro
    doc.rect(40, boxTopY, pageWidth - 80, boxHeight); // Dibuja el recuadro

    yPosition += yOffset; // Incrementa la posición Y

    // Controlar salto de página si es necesario
    if (yPosition > 700 && i < endCategory) {
      // Si la posición supera el límite de la página
      doc.addPage(); // Añade una nueva página
      yPosition = 50; // Reinicia la posición Y
    }
  }
}

// Función para añadir el pie de página a partir de una página específica
function addFooter(doc, startPage) {
  const pageCount = doc.internal.getNumberOfPages(); // Obtiene el número total de páginas
  const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene el ancho de la página
  const footerText =
    "Diagnóstico del Modelo de Negocio proporcionado por WayMentor Latam"; // Texto del pie de página
  const linkText = "https://waymentorlatam.com/"; // Enlace del pie de página

  for (let i = startPage; i <= pageCount; i++) {
    doc.setPage(i); // Cambia a la página actual
    doc.setFontSize(10); // Tamaño de fuente para el pie de página
    const footerX = (pageWidth - doc.getTextWidth(footerText)) / 2; // Calcula la posición del texto
    doc.text(footerText, footerX, 770); // Añade el texto del pie de página
    const linkX = (pageWidth - doc.getTextWidth(linkText)) / 2; // Calcula la posición del enlace
    doc.textWithLink(linkText, linkX, 785, { url: linkText }); // Añade el enlace al pie de página
  }
}

// Función para añadir el botón "Generar PDF"
function addGeneratePDFButton() {
  const pdfButton = document.createElement("button"); // Crea un botón
  pdfButton.textContent = "Generar PDF"; // Texto del botón
  pdfButton.id = "pdf-button"; // ID del botón
  reportContainer.appendChild(pdfButton); // Añade el botón al contenedor del informe

  pdfButton.addEventListener("click", generatePDF); // Evento al hacer clic en el botón
}

// Función para enviar el PDF por correo
function sendPDFByEmail(pdfBase64, userName, userEmail) {
  // Detecta si estamos en entorno local o en producción (Vercel)
  const baseUrl =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000" // Entorno local
      : "https://tdmn.vercel.app"; // Producción en Vercel

  fetch(`${baseUrl}/send-email`, {
    method: "POST", // Método HTTP POST
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail, // Correo del usuario
      pdfBase64: pdfBase64, // PDF en base64
      name: userName, // Nombre del usuario
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor."); // Muestra un error si la respuesta no es exitosa
      }
      return response.json(); // Convierte la respuesta a JSON
    })
    .then((data) => {
      alert("Correo enviado exitosamente."); // Muestra una alerta si el correo fue enviado con éxito
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error); // Muestra un error en la consola si falla el envío
      alert(
        "Hubo un error al enviar el correo. Inténtalo nuevamente más tarde."
      ); // Muestra una alerta si falla el envío
    });
}
