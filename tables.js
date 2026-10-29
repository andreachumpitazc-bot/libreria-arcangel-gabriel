// ========================================================
// GESTIÓN DE INVENTARIO Y TABLA DINÁMICA DE PRODUCTOS
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const productTableBody = document.getElementById("productTableBody");
  const searchInput = document.getElementById("searchInput");
  const totalProductosCount = document.getElementById("totalProductosCount");
  const stockBajoCount = document.getElementById("stockBajoCount");
  const formAgregarProducto = document.getElementById("formAgregarProducto");
  const formEditarProducto = document.getElementById("formEditarProducto");

  if (!productTableBody) return;

  // Catálogo inicial con propiedad stock
  const productosIniciales = [
    {
      id: 1,
      categoria: "Papelería",
      nombre: "Cuaderno Universitario A4",
      detalle: "100 hojas cuadriculadas Standford",
      precio: "S/ 6.50",
      stock: 45,
    },
    {
      id: 2,
      categoria: "Packs",
      nombre: "Lista Escolar Completa",
      detalle: "Primaria / Secundaria personalizada",
      precio: "Cotizar",
      stock: 2,
    },
    {
      id: 3,
      categoria: "Servicio",
      nombre: "Impresiones y Copias",
      detalle: "Blanco/Negro y Color",
      precio: "S/ 0.20",
      stock: 100,
    },
    {
      id: 4,
      categoria: "Arte",
      nombre: "Set de Témperas y Pinceles",
      detalle: "Kit Faber Castell 12 colores",
      precio: "S/ 12.00",
      stock: 3,
    },
  ];

  // Leer de localStorage
  let productos = JSON.parse(localStorage.getItem("productos_inventario"));

  // Reiniciar si no existen datos válidos
  if (
    !productos ||
    productos.length === 0 ||
    productos[0].stock === undefined
  ) {
    productos = productosIniciales;
    localStorage.setItem("productos_inventario", JSON.stringify(productos));
  }

  // Renderizar la tabla y actualizar indicadores
  function renderizarTabla(lista) {
    productTableBody.innerHTML = "";

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

  // 1. CARGAR DATOS EN EL FORMULARIO DE EDICIÓN AL HACER CLIC EN EL LÁPIZ
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

  // 2. GUARDAR LOS CAMBIOS EDITADOS (TODA LA FILA)
  if (formEditarProducto) {
    formEditarProducto.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = parseInt(document.getElementById("editProdId").value);
      const index = productos.findIndex((p) => p.id === id);

      if (index !== -1) {
        // Actualizar todos los campos
        productos[index].nombre = document
          .getElementById("editProdNombre")
          .value.trim();
        productos[index].categoria =
          document.getElementById("editProdCategoria").value;
        productos[index].stock =
          parseInt(document.getElementById("editProdStock").value) || 0;
        productos[index].precio = document
          .getElementById("editProdPrecio")
          .value.trim();
        productos[index].detalle = document
          .getElementById("editProdDetalle")
          .value.trim();

        // Guardar en Web Storage y actualizar tabla
        localStorage.setItem("productos_inventario", JSON.stringify(productos));
        renderizarTabla(productos);

        // Cerrar modal
        const modalCloseBtn = document.querySelector(
          "#modalEditarProducto .btn-close",
        );
        if (modalCloseBtn) modalCloseBtn.click();
      }
    });
  }

  // 3. REGISTRAR UN NUEVO PRODUCTO
  if (formAgregarProducto) {
    formAgregarProducto.addEventListener("submit", (e) => {
      e.preventDefault();

      const nuevoId =
        productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;

      const nuevoProducto = {
        id: nuevoId,
        nombre: document.getElementById("prodNombre").value.trim(),
        categoria: document.getElementById("prodCategoria").value,
        stock: parseInt(document.getElementById("prodStock").value) || 0,
        precio: document.getElementById("prodPrecio").value.trim(),
        detalle: document.getElementById("prodDetalle").value.trim(),
      };

      productos.push(nuevoProducto);
      localStorage.setItem("productos_inventario", JSON.stringify(productos));
      renderizarTabla(productos);

      formAgregarProducto.reset();
      const modalCloseBtn = document.querySelector(
        "#modalAgregarProducto .btn-close",
      );
      if (modalCloseBtn) modalCloseBtn.click();
    });
  }

  // 4. BUSCADOR
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      const termino = e.target.value.toLowerCase();
      const filtrados = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.categoria.toLowerCase().includes(termino),
      );
      renderizarTabla(filtrados);
    });
  }

  // 5. ELIMINAR
  productTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-eliminar");
    if (btn) {
      const id = parseInt(btn.getAttribute("data-id"));
      if (confirm("¿Deseas eliminar este producto del inventario?")) {
        productos = productos.filter((p) => p.id !== id);
        localStorage.setItem("productos_inventario", JSON.stringify(productos));
        renderizarTabla(productos);
      }
    }
  });

  renderizarTabla(productos);
});
