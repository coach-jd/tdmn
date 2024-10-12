document.addEventListener("DOMContentLoaded", function () {
  // Aquí colocas el código que interactúa con el DOM
  const startDiagnosisButton = document.getElementById("startDiagnosisButton");
  if (startDiagnosisButton) {
    startDiagnosisButton.addEventListener("click", function () {
      console.log("Botón presionado");
      if (validateForm()) {
        $("#instructionModal").modal("show"); // Mostrar modal si pasa la validación
      } else {
        alert("Por favor, completa todos los campos obligatorios.");
      }
    });
  } else {
    console.error("El botón 'startDiagnosisButton' no se encontró.");
  }
});

// Función para enviar la descripción del emprendimiento a la API de OpenAI y evaluar
async function evaluarDescripcionConOpenAI(descripcion) {
  const prompt = {
    prompt: `Evalúa la siguiente descripción de emprendimiento basada en los criterios de claridad, problema/solución, modelo de negocio, mercado objetivo y valor diferenciador. Devuelve la evaluación en una escala del 1 al 7 para cada criterio según la rúbrica proporcionada.`,
    descripcion: descripcion,
    rubrica: {
      criterios: [
        "Claridad",
        "Problema/Solución",
        "Modelo de Negocio",
        "Mercado Objetivo",
        "Valor Diferenciador",
      ],
    },
  };

  try {
    // Realizar la solicitud a la API de OpenAI
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Reemplaza con tu clave de API
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto en evaluación de emprendimientos.",
          },
          { role: "user", content: JSON.stringify(prompt) },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content; // Devuelve la evaluación de la API
  } catch (error) {
    console.error("Error al llamar a la API de OpenAI:", error);
    alert(
      "Hubo un problema al evaluar la descripción. Por favor, inténtalo de nuevo."
    );
    return null;
  }
}
////////////////////////////////////////
// Función para procesar la respuesta de la API y validar los niveles
function procesarEvaluacionOpenAI(respuesta) {
  // Parsear la respuesta JSON que devuelve la API
  const evaluacion = JSON.parse(respuesta);

  let puedeAvanzar = true;

  // Recorrer los criterios de evaluación y verificar si cumplen con nivel 6 o 7
  evaluacion.rubrica_evaluacion.criterios.forEach((criterio) => {
    const nivel = criterio.nivel; // Obtener el nivel de cada criterio
    if (nivel < 6) {
      puedeAvanzar = false; // Si algún criterio tiene un nivel menor a 6, no puede avanzar
    }
  });

  // Mostrar un modal con la evaluación obtenida
  mostrarModalEvaluacion(evaluacion, puedeAvanzar);

  return puedeAvanzar;
}
////////////////////////////////////////
// Función para mostrar el modal con la evaluación
function mostrarModalEvaluacion(evaluacion, puedeAvanzar) {
  const modalContent = document.getElementById("evaluationModalContent");
  modalContent.innerHTML = ""; // Limpiar contenido previo

  // Mostrar los niveles de cada criterio en el modal
  evaluacion.rubrica_evaluacion.criterios.forEach((criterio) => {
    const criterioElement = document.createElement("p");
    criterioElement.textContent = `${criterio.criterio}: Nivel ${criterio.nivel} - ${criterio.descripcion}`;
    modalContent.appendChild(criterioElement);
  });

  // Mensaje de éxito o sugerencias para mejorar
  const conclusion = document.createElement("p");
  if (puedeAvanzar) {
    conclusion.textContent =
      "¡Felicitaciones! Tu descripción cumple con los criterios necesarios para avanzar.";
    modalContent.appendChild(conclusion);
    // Aquí podrías habilitar el botón para avanzar
  } else {
    conclusion.textContent =
      "Algunos aspectos de tu descripción necesitan mejora. Por favor, revisa y actualiza la descripción.";
    modalContent.appendChild(conclusion);
    // Aquí podrías bloquear el avance hasta que se mejore la descripción
  }

  // Mostrar el modal
  $("#evaluationModal").modal("show");
}
////////////////////////////////////////
// Función que inicia todo el proceso cuando el usuario envía la descripción
async function iniciarEvaluacionDescripcion() {
  const descripcion = document
    .querySelector('textarea[name="descripcion_startup"]')
    .value.trim();

  // Validar que la descripción no esté vacía antes de enviarla
  if (descripcion === "") {
    alert("Por favor, introduce la descripción de tu startup.");
    return;
  }

  // Llamar a la API de OpenAI para evaluar la descripción
  const respuestaOpenAI = await evaluarDescripcionConOpenAI(descripcion);

  // Procesar la evaluación solo si hubo una respuesta
  if (respuestaOpenAI) {
    const puedeAvanzar = procesarEvaluacionOpenAI(respuestaOpenAI);

    // Si la evaluación es satisfactoria, permitir avanzar
    if (puedeAvanzar) {
      // Habilitar el botón de avance o redirigir al siguiente paso
      document.getElementById("nextButton").disabled = false;
    }
  }
}

// Evento para iniciar la evaluación cuando el usuario hace clic en el botón
/*document
  .getElementById("startEvaluationButton")
  .addEventListener("click", iniciarEvaluacionDescripcion);
*/
