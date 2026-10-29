// ========================================================
// RENDERIZADO DE SOLICITUDES Y CONTADOR (WEB STORAGE)
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const messagesTableBody = document.getElementById("messagesTableBody");
  const btnLimpiar = document.getElementById("btnLimpiarSolicitudes");
  const cotizacionesCount = document.getElementById("cotizacionesCount"); // Captura la tarjeta

  if (!messagesTableBody) return;

  function cargarSolicitudes() {
    // 1. Leer solicitudes guardadas en localStorage
    const solicitudes =
      JSON.parse(localStorage.getItem("solicitudes_contacto")) || [];

    // 2. ACTUALIZAR EL CONTADOR DE LA TARJETA (Cambia el 28 por la cantidad real)
    if (cotizacionesCount) {
      cotizacionesCount.textContent = solicitudes.length;
    }

    // 3. Limpiar tabla antes de renderizar
    messagesTableBody.innerHTML = "";

    // 4. Si la lista está vacía
    if (solicitudes.length === 0) {
      messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fa-solid fa-inbox display-6 d-block mb-2"></i>
                        No hay solicitudes o cotizaciones registradas por el momento.
                    </td>
                </tr>`;
      return;
    }

    // 5. Renderizar filas dinámicamente
    solicitudes.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td class="small text-muted">${item.fecha || "Reciente"}</td>
                <td class="fw-bold text-dark">${item.nombre}</td>
                <td>
                    <a href="https://wa.me/51${item.telefono}" target="_blank" class="btn btn-sm btn-outline-success py-0 px-2">
                        <i class="fa-brands fa-whatsapp me-1"></i>${item.telefono}
                    </a>
                </td>
                <td class="small">${item.email}</td>
                <td class="small text-secondary">${item.mensaje}</td>
            `;
      messagesTableBody.appendChild(tr);
    });
  }

  // Evento para limpiar mensajes
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (confirm("¿Deseas borrar todas las solicitudes guardadas?")) {
        localStorage.removeItem("solicitudes_contacto");
        cargarSolicitudes(); // Recarga la tabla y vuelve el contador a 0
      }
    });
  }

  // Ejecutar al cargar la vista
  cargarSolicitudes();
});
