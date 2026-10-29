// ========================================================
// RENDERIZADO DE SOLICITUDES Y CONTADOR (API REST / HTTP GET)
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const messagesTableBody = document.getElementById("messagesTableBody");
  const btnLimpiar = document.getElementById("btnLimpiarSolicitudes");
  const cotizacionesCount = document.getElementById("cotizacionesCount");

  if (!messagesTableBody) return;

  const API_URL = "https://libreria-arcangel-gabriel.onrender.com/api/solicitudes";

  async function cargarSolicitudes() {
    try {
      // 1. Consultar solicitudes al servidor Backend (GET)
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al consultar la API de solicitudes");

      const solicitudes = await res.json();

      // 2. ACTUALIZAR EL CONTADOR DE LA TARJETA EN EL DASHBOARD
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

      // 5. Renderizar filas dinámicamente con los datos de la BD
      solicitudes.forEach((item) => {
        const fechaFormateada = item.fecha
          ? new Date(item.fecha).toLocaleString("es-PE")
          : "Reciente";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="small text-muted">${fechaFormateada}</td>
          <td class="fw-bold text-dark">${item.nombre}</td>
          <td>
            <a href="https://wa.me/51${item.telefono}" target="_blank" class="btn btn-sm btn-outline-success py-0 px-2">
              <i class="fa-brands fa-whatsapp me-1"></i>${item.telefono}
            </a>
          </td>
          <td class="small">${item.email || "No especificado"}</td>
          <td class="small text-secondary">${item.mensaje}</td>
        `;
        messagesTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      messagesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger py-4">
            <i class="fa-solid fa-triangle-exclamation me-2"></i>
            No se pudo conectar con el servidor backend (${API_URL}).
          </td>
        </tr>`;
    }
  }

  // Evento para limpiar solicitudes
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      alert("Las solicitudes registradas se gestionan y conservan directamente en la base de datos.");
    });
  }

  // Ejecutar consulta al cargar la vista
  cargarSolicitudes();
});
