// ========================================================
// VALIDACIÓN DEL FORMULARIO DE CONTACTO Y COTIZACIÓN
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");

  if (!contactForm) return;

  // Referencia a los elementos del formulario
  const inputNombre = document.getElementById("nombre");
  const inputTelefono = document.getElementById("telefono");
  const inputEmail = document.getElementById("email");
  const inputMensaje = document.getElementById("mensaje");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitamos que la página se recargue

    // Captura de valores limpios
    const nombre = inputNombre.value.trim();
    const telefono = inputTelefono.value.trim();
    const email = inputEmail.value.trim();
    const mensaje = inputMensaje.value.trim();

    // Limpiar estados de validación y alertas previas
    resetValidationState([
      inputNombre,
      inputTelefono,
      inputEmail,
      inputMensaje,
    ]);
    hideAlert();

    // 1. Validar Nombre
    if (nombre === "" || nombre.length < 3) {
      setInvalid(inputNombre);
      showAlert(
        "Por favor, ingresa tu nombre completo (mínimo 3 caracteres).",
        "danger",
      );
      return;
    }
    setValid(inputNombre);

    // 2. Validar Teléfono (Celular Perú: 9 dígitos iniciando en 9)
    const phoneRegex = /^[9]\d{8}$/;
    if (!phoneRegex.test(telefono)) {
      setInvalid(inputTelefono);
      showAlert(
        "Por favor, ingresa un número de celular válido de 9 dígitos (ej. 999888777).",
        "danger",
      );
      return;
    }
    setValid(inputTelefono);

    // 3. Validar Email (Opcional, pero debe ser válido si se completa)
    if (email !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setInvalid(inputEmail);
        showAlert("Por favor, ingresa un correo electrónico válido.", "danger");
        return;
      }
      setValid(inputEmail);
    }

    // 4. Validar Mensaje
    if (mensaje === "" || mensaje.length < 5) {
      setInvalid(inputMensaje);
      showAlert(
        "Por favor, escribe tu consulta o lista de útiles a cotizar.",
        "danger",
      );
      return;
    }
    setValid(inputMensaje);

    // --- SI TODO ES VÁLIDO: PERSISTENCIA Y UX ---
    const nuevaSolicitud = {
      id: Date.now(),
      nombre: nombre,
      telefono: telefono,
      email: email || "No especificado",
      mensaje: mensaje,
      fecha: new Date().toLocaleString("es-PE"),
    };

    // Guardar registro en localStorage usando JSON (Sesión 06 y 07)
    guardarSolicitudStorage(nuevaSolicitud);

    // Notificación de éxito (Bootstrap Alert)
    showAlert(
      "¡Solicitud enviada con éxito! Nos pondremos en contacto contigo a la brevedad.",
      "success",
    );

    // Limpiar campos y remover estilos de validación tras envío exitoso
    contactForm.reset();
    setTimeout(
      () =>
        resetValidationState([
          inputNombre,
          inputTelefono,
          inputEmail,
          inputMensaje,
        ]),
      3000,
    );
  });

  // --- FUNCIONES AUXILIARES DE UX/UI (Sesión 04 - Bootstrap) ---
  function showAlert(message, type) {
    alertBox.className = `alert alert-${type} mb-3`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  function hideAlert() {
    alertBox.classList.add("d-none");
  }

  function setInvalid(element) {
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
  }

  function setValid(element) {
    element.classList.add("is-valid");
    element.classList.remove("is-invalid");
  }

  function resetValidationState(elements) {
    elements.forEach((el) => el.classList.remove("is-invalid", "is-valid"));
  }

  // --- PERSISTENCIA WEB STORAGE (Sesión 06 y 07 - JSON & localStorage) ---
  function guardarSolicitudStorage(solicitud) {
    const listaExistente =
      JSON.parse(localStorage.getItem("solicitudes_contacto")) || [];
    listaExistente.push(solicitud);
    localStorage.setItem(
      "solicitudes_contacto",
      JSON.stringify(listaExistente),
    );
  }
});
