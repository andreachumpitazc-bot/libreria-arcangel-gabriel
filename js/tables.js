// ========================================================
// GESTIÓN DE INVENTARIO Y TABLA DINÁMICA DE PRODUCTOS (API REST)
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const productTableBody = document.getElementById("productTableBody");
  const searchInput = document.getElementById("searchInput");
  const totalProductosCount = document.getElementById("totalProductosCount");
  const stockBajoCount = document.getElementById("stockBajoCount");
  const formAgregarProducto = document.getElementById("formAgregarProducto");
  const formEditarProducto = document.getElementById("formEditarProducto");

  if (!productTableBody) return;

  // Endpoint de la API REST para la gestión de productos
  const API_URL = "https://libreria-arcangel-gabriel.onrender.com/api/productos";
  let productos = []; // Estado local en memoria para búsquedas y filtros rápidos

  // --------------------------------------------------------
  // 1. OBTENER Y RENDERIZAR PRODUCTOS DESDE LA BD (GET)
  // --------------------------------------------------------
  async function obtenerProductos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al consultar la API REST");
      
      productos = await response.json();
      renderizarTabla(productos);
    } catch (error) {
      console.error("Error cargando el inventario:", error);
      productTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger py-3">
            <i class="fa-solid fa-triangle-exclamation me-2"></i>
            No se pudo conectar con el servidor backend (${API_URL}).
          </td>
        </tr>`;
    }
  }

  function renderizarTabla(lista) {
    productTableBody.innerHTML = "";

    // Actualizar KPIs/Contadores del Dashboard
    if (totalProductosCount) {
      totalProductosCount.textContent = productos.length;
    }

    if (stockBajoCount) {
      const bajoStock = productos.filter((p) => p.stock <= 5).length;
      stockBajoCount.textContent = bajoStock;
    }

    if (lista.length === 0) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-3">No se encontraron productos.</td>
        </tr>`;
      return;
    }

    lista.forEach((prod) => {
      let stockBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">${prod.stock} un.</span>`;
      if (prod.stock <= 5) {
        stockBadge = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="fa-solid fa-triangle-exclamation me-1"></i>${prod.stock} un. (Bajo)</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="fw-bold text-muted">#${prod.id}</td>
        <td><span class="badge bg-primary-subtle text-primary">${prod.categoria}</span></td>
        <td class="fw-bold text-dark">${prod.nombre}</td>
        <td class="small text-secondary">${prod.detalle}</td>
        <td>${stockBadge}</td>
        <td class="fw-bold ${prod.precio === "Cotizar" ? "text-success" : "text-dark"}">${prod.precio}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-editar me-1" 
                  data-id="${prod.id}" 
                  data-bs-toggle="modal" 
                  data-bs-target="#modalEditarProducto" 
                  title="Editar Producto">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${prod.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      productTableBody.appendChild(tr);
    });
  }

  // --------------------------------------------------------
  // 2. CARGAR DATOS EN EL MODAL AL EDITAR
  // --------------------------------------------------------
  productTableBody.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-editar");
    if (btnEditar) {
      const id = parseInt(btnEditar.getAttribute("data-id"));
      const prod = productos.find((p) => p.id === id);

      if (prod) {
        document.getElementById("editProdId").value = prod.id;
        document.getElementById("editProdNombre").value = prod.nombre;
        document.getElementById("editProdCategoria").value = prod.categoria;
        document.getElementById("editProdStock").value = prod.stock;
        document.getElementById("editProdPrecio").value = prod.precio;
        document.getElementById("editProdDetalle").value = prod.detalle;
      }
    }
  });

  // --------------------------------------------------------
  // 3. REGISTRAR UN NUEVO PRODUCTO EN LA BD (POST)
  // --------------------------------------------------------
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nuevoProducto = {
        nombre: document.getElementById("prodNombre").value.trim(),
        categoria: document.getElementById("prodCategoria").value,
        stock: parseInt(document.getElementById("prodStock").value) || 0,
        precio: document.getElementById("prodPrecio").value.trim(),
        detalle: document.getElementById("prodDetalle").value.trim(),
      };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoProducto),
        });

        if (!response.ok) throw new Error("Error al guardar el producto");

        formAgregarProducto.reset();

        // Cerrar modal de Bootstrap
        const modalElement = document.getElementById("modalAgregarProducto");
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();

        // Recargar lista actualizada desde el servidor
        await obtenerProductos();
      } catch (error) {
        console.error("Error al registrar producto:", error);
        alert("No se pudo guardar el producto. Revisa la conexión con el backend.");
      }
    });
  }

  // --------------------------------------------------------
  // 4. GUARDAR CAMBIOS EDITADOS EN LA BD (PUT)
  // --------------------------------------------------------
  if (formEditarProducto) {
    formEditarProducto.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editProdId").value;
      const productoActualizado = {
        nombre: document.getElementById("editProdNombre").value.trim(),
        categoria: document.getElementById("editProdCategoria").value,
        stock: parseInt(document.getElementById("editProdStock").value) || 0,
        precio: document.getElementById("editProdPrecio").value.trim(),
        detalle: document.getElementById("editProdDetalle").value.trim(),
      };

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productoActualizado),
        });

        if (!response.ok) throw new Error("Error al actualizar producto");

        // Cerrar modal de Bootstrap
        const modalElement = document.getElementById("modalEditarProducto");
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();

        // Recargar lista actualizada desde la BD
        await obtenerProductos();
      } catch (error) {
        console.error("Error al actualizar producto:", error);
        alert("No se pudo guardar los cambios del producto.");
      }
    });
  }

  // --------------------------------------------------------
  // 5. ELIMINAR UN PRODUCTO DE LA BD (DELETE)
  // --------------------------------------------------------
  productTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-eliminar");
    if (btn) {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Deseas eliminar este producto del inventario de forma permanente?")) {
        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Error al eliminar producto");

          // Recargar lista actualizada desde la BD
          await obtenerProductos();
        } catch (error) {
          console.error("Error al eliminar producto:", error);
          alert("No se pudo eliminar el producto.");
        }
      }
    }
  });

  // --------------------------------------------------------
  // 6. BUSCADOR EN TIEMPO REAL (FILTRADO LOCAL)
  // --------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      const termino = e.target.value.toLowerCase();
      const filtrados = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.categoria.toLowerCase().includes(termino)
      );
      renderizarTabla(filtrados);
    });
  }

  // Cargar productos al iniciar la vista
  obtenerProductos();
});
