botonGuardarRegistro = document.getElementById("guardarRegistro");
botonCancelarRegistro = document.getElementById("cancelarRegistro");

var seccionActual = "login";
var ultimaSeccion = "";
function cambiarSeccion(seccion){
document.getElementById(seccionActual).classList.remove("activa");
document.getElementById(seccion).classList.add("activa");
ultimaSeccion = seccionActual;
seccionActual=seccion;
}

var idGestor = null;
var selectCategoria = document.getElementById("categoriaRecurso");
var selectModelo = document.getElementById("modeloRecurso");
var selectUbicacion = document.getElementById("ubicacionRecurso");
var selectEstado = document.getElementById("estadoRecurso");

var selCatMenu = document.getElementById("categoriaMenu");
var selModMenu = document.getElementById("modeloMenu");
var selUbiMenu = document.getElementById("ubicacionMenu");
var selEstMenu = document.getElementById("estadoMenu");

var userLogin = document.getElementById("userLogin");
var passLogin = document.getElementById("passLogin");



var categorias = [];
var modelos = [];
var ubicaciones = [];
var sanitarios = [];

var token = null;
var tokenCod = null;
var idRecursoEditado = null;


var textoBienvenida = document.getElementById("textoBienvenida");

function teclaEnterLogin(e) {
  if (e.key === "Enter") { 
    entrar();
  }
}

userLogin.addEventListener("keydown", teclaEnterLogin);
passLogin.addEventListener("keydown", teclaEnterLogin);


function entrar(){

    var usuario = document.getElementById("userLogin");
    var contraseña = document.getElementById("passLogin");
    var errorLogin = document.getElementById("errorLogin");
    var gestor = {
        usuario: usuario.value,
        password: contraseña.value
        }
    rest.post("/api/gestores/login", gestor, function(estado, respuesta){
        if (estado==200){
            alert("Usuario verificado exitosamente");
            idGestor = respuesta.id;
            token = respuesta.token
            tokenCod = encodeURIComponent(token)
            // crearConexion(idGestor, "gestor")
            cargarBienvenida();
            cargarSelect();
            cambiarSeccion("menuPrincipal");
            usuario.value = "";
            contraseña.value = "";
            
        }
        else{
            errorLogin.innerHTML = "";
            errorLogin.innerHTML = "Error "+estado+" "+respuesta;
        }

    })

}

function cargarBienvenida(){
  rest.get("/api/gestores/"+idGestor, function(estadoG,respuestaG){
        if (estadoG ==200){
        textoBienvenida.innerHTML = "Bienvenido "+ respuestaG.nombre + " "+respuestaG.apellidos
        }
      })
}

function salir(){
    cambiarSeccion("login");
    // cerrarConexion();
    idGestor = null;
}

function cargarRegistro() {
    document.getElementById("userRegistro").readOnly = false;
    document.getElementById("passRegistro").readOnly = false;
}

function cargarDatosEnRegistro() {
  if (idGestor == null) return;

  rest.get("/api/gestores/" + idGestor, function(estado, respuesta) {
    if (estado === 200) {
        // El operador ?? muestra el valor de su izquierda, en caso de ser null o undefined
        // muestra el valor de su derecha
      document.getElementById("nameRegistro").value = respuesta.nombre ?? "";
      document.getElementById("apellidosRegistro").value = respuesta.apellidos ?? "";
      document.getElementById("userRegistro").value = respuesta.usuario ?? "";
      document.getElementById("passRegistro").value = "";
      document.getElementById("userRegistro").readOnly = true;
      document.getElementById("passRegistro").readOnly = true;

    } else {
      alert("Error " + estado + " " + respuesta);
    }
  });
}


//revisar si toca
botonGuardarRegistro.addEventListener('click', function () {
  var nombre = document.getElementById("nameRegistro").value.trim();
  var apellidos = document.getElementById("apellidosRegistro").value.trim();
  var usuario = document.getElementById("userRegistro").value.trim();
  var contraseña = document.getElementById("passRegistro").value;

  if (ultimaSeccion === 'menuPrincipal') {
    // EDITAR: usuario y contraseña son de solo lectura, no se envían
    if (nombre === "" || apellidos === "") {
      if (!confirm('Hay campos en blanco, ¿seguro que quieres continuar?')) return;
    }
    rest.put("/api/gestores/" + idGestor+"?token="+tokenCod, { nombre: nombre, apellidos: apellidos }, function (estado, respuesta) {
      if (estado === 200) {
        alert(respuesta);
        cargarBienvenida();
        cambiarSeccion('menuPrincipal');
      } else {
        alert("Error " + estado + " " + respuesta);
      }
    });
  } else {
    // REGISTRAR
    if (nombre === "" || apellidos === "" || usuario === "" || contraseña === "") {
      return alert("Rellena todos los campos.");
    }
    rest.post("/api/gestores", { nombre: nombre, apellidos: apellidos, usuario: usuario, password: contraseña }, function (estado, respuesta) {
      if (estado === 201) {
        alert(respuesta);
        cambiarSeccion('login');
      } else {
        alert("Error " + estado + " " + respuesta);
      }
    });
  }
});


botonCancelarRegistro.addEventListener('click', function(){
    //Borrar datos del formulario

    document.getElementById("nameRegistro").value = "";
    document.getElementById("apellidosRegistro").value = "";
    document.getElementById("userRegistro").value = "";
    document.getElementById("passRegistro").value = "";
    
    if (ultimaSeccion!='login'){
    cambiarSeccion('menuPrincipal')
    }
    else{
    cambiarSeccion('login')
    }
});

function limpiarFormularioRecurso() {
  document.getElementById("nSerieRecurso").value = "";
  selectCategoria.value = "";
  selectModelo.value = "";
  selectUbicacion.value = "";
  selectEstado.value = "";
  idRecursoEditado = null;  // Reset modo
}

//Hacer get de Recursos categorias y modelos
// function buscarRecurso(categoria, modelo, ubicacion, estado){
//     rest.get("/api/recursos?categoria="+categoria+
//         "&modelo="+modelo.value+
//         "&ubicacion="+ubicacion.value+
//         "&estado="+estado.value)
// }

var cuerpoTRecursos = document.getElementById("cuerpoTRecursos");
var contadorRecursos = document.getElementById("contadorRecursos");

// Estados (según tus datos)
var estados = [
  { id: 0, nombre: "Disponible" },
  { id: 1, nombre: "En uso" },
  { id: 2, nombre: "Averiado" }
];

function cargarSelectSimple(sel, items, textoTodos) {
  sel.innerHTML = "";
  var o0 = document.createElement("option");
  o0.value = "";
  o0.textContent = textoTodos;
  sel.appendChild(o0);

  items.forEach(function(it){
    var o = document.createElement("option");
    o.value = it.id;
    o.textContent = it.nombre;
    sel.appendChild(o);
  });
}

function cargarModelosPorCategoria(selModelo, idCategoria) {
  selModelo.innerHTML = "";
  var o0 = document.createElement("option");
  o0.value = "";
  o0.textContent = "Todos";
  selModelo.appendChild(o0);

  var lista = modelos;
  if (idCategoria !== "") {
    var catNum = Number(idCategoria);
    lista = modelos.filter(function(m) { return m.categoria === catNum; });
  }

  lista.forEach(function(m){
    var o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.nombre;
    selModelo.appendChild(o);
  });

  selModelo.value = "";
}

function nombreCategoriaDesdeModeloId(idModelo) {
  var mod = modelos.find(function(m){ return m.id == idModelo; });
  if (!mod) return "";
  var cat = categorias.find(function(c){ return c.id == mod.categoria; });
  return cat ? cat.nombre : "";
}

function nombreModelo(idModelo) {
  var mod = modelos.find(function(m){ return m.id == idModelo; });
  return mod ? mod.nombre : "";
}

function nombreUbicacion(idUbicacion) {
  var u = ubicaciones.find(function(x){ return x.id == idUbicacion; });
  return u ? u.nombre : "";
}

function nombreEstado(idEstado) {
  if (idEstado == 0) return "Disponible";
  if (idEstado == 1) return "En uso";
  if (idEstado == 2) return "Averiado";
  return "";
}

function pintarTablaRecursos(lista) {
  cuerpoTRecursos.innerHTML = "";

  lista.forEach(function(r){
    var tr = document.createElement("tr");

    // N. Serie
    var tdSerie = document.createElement("td");
    tdSerie.textContent = r.numero_serie || r.numSerie || "";

    // Categoría  
    var tdCat = document.createElement("td");
    tdCat.textContent = nombreCategoriaDesdeModeloId(r.modelo);

    // Modelo
    var tdMod = document.createElement("td");
    tdMod.textContent = nombreModelo(r.modelo);

    // Ubicación
    var tdUbi = document.createElement("td");
    tdUbi.textContent = nombreUbicacion(r.ubicacion);

    // Estado
    var tdEst = document.createElement("td");
    tdEst.textContent = nombreEstado(r.estado);


    var tdAcc = document.createElement("td");
    tdAcc.className = "acciones";  
    
    // Botón EDITAR
    var btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-editar";
    btnEditar.onclick = function() { 
      editarRecurso(r.id); 
    };
    
    // Botón ELIMINAR
    var btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.onclick = function() { 
      eliminarRecurso(r.id); 
    };
    
    // Añadir botones a celda
    tdAcc.appendChild(btnEditar);
    tdAcc.appendChild(document.createTextNode(" "));
    tdAcc.appendChild(btnEliminar);

    // Añadir celdas a fila
    tr.appendChild(tdSerie);
    tr.appendChild(tdCat);
    tr.appendChild(tdMod);
    tr.appendChild(tdUbi);
    tr.appendChild(tdEst);
    tr.appendChild(tdAcc);

    cuerpoTRecursos.appendChild(tr);
  });

  contadorRecursos.textContent = "Total recursos: " + lista.length;
}

function buscarRecurso() {
  var categoria = selCatMenu.value;
  var modelo = selModMenu.value;
  var ubicacion = selUbiMenu.value;
  var estado = selEstMenu.value;

  // encodeURIComponent codifica el valor para query string

  var url = "/api/recursos?token="+token
    + "?categoria=" + encodeURIComponent(categoria)
    + "&modelo=" + encodeURIComponent(modelo)
    + "&ubicacion=" + encodeURIComponent(ubicacion)
    + "&estado=" + encodeURIComponent(estado)
    + "?token=" + tokenCod

  rest.get(url, function(codigo, respuesta){
    if (codigo === 200) {
      pintarTablaRecursos(respuesta);
    } else {
      alert("Error " + codigo + " " + respuesta);
    }
  });
}

// Editar recurso
function editarRecurso(idRecurso) {
  // Cargar datos del recurso
  rest.get("/api/recursos/"+ idRecurso+"?token="+tokenCod, function(estado, recurso) {
    if (estado !== 200) {
      alert("Error cargando recurso: " + estado);
      return;
    }
    
    // Llenar formulario
    document.getElementById("nSerieRecurso").value = recurso.numero_serie || recurso.numSerie || "";
    selectCategoria.value = "";
    selectModelo.value = "";
    selectUbicacion.value = recurso.ubicacion || "";
    selectEstado.value = recurso.estado || "";
    
    if (modeloInfo) {
      selectCategoria.value = String(modeloInfo.categoria);
      cargarModelosPorCategoria(selectModelo, modeloInfo.categoria);
      selectModelo.value = String(recurso.modelo ?? "");
    } else {
      // Si no encuentro el modelo, cargo todos y aun así intento seleccionar el id
      selectCategoria.value = "";
      cargarModelosPorCategoria(selectModelo, "");
      selectModelo.value = String(recurso.modelo ?? "");
    }
    
    // Ir a formulario (ahora detectará nº serie existente)
    cambiarSeccion("recurso");
  });
}

// Eliminar recurso
function eliminarRecurso(idRecurso) {
  if (!confirm("¿Eliminar este recurso permanentemente?")) return;
  
  rest.delete("/api/recursos" + idRecurso+ "?token="+tokenCod, function(estado, respuesta) {
    if (estado === 200) {
      alert("Recurso eliminado");
      buscarRecurso();  // Refrescar tabla
    } else {
      alert("Error eliminando: " + estado + " - " + respuesta);
    }
  });
}
// Cargar reservas y reseñas
function cargarFichaRecurso(idRecurso) {
  // Cargar reservas
  rest.get("/api/recursos/" + idRecurso + "/reservas"+"?token="+tokenCod, function(estadoRes, reservasData) {
    if (estadoRes === 200) {
      pintarTablaReservas(reservasData);
    }
  });
  
  // Cargar reseñas
  rest.get("/api/recursos/" + idRecurso + "/resenyas"+"?token="+tokenCod, function(estadoRese, resenasData) {
    if (estadoRese === 200) {
      pintarTablaResenas(resenasData);
    }
  });
}

function pintarTablaReservas(reservas) {
  var cuerpoReservas = document.getElementById("cuerpoTReservas");
  cuerpoReservas.innerHTML = "";
  
  var total = 0;
  
  if (!reservas || reservas.length === 0) {
    document.getElementById("totalReservas").textContent = "Total: 0";
    return;
  }
  
  reservas.forEach(function(reserva) {
    var tr = document.createElement("tr");
    
    // Columna 1: Nombre del sanitario
    var tdSanitario = document.createElement("td");
    var san = sanitarios.find(s => s.id == reserva.sanitario);
    tdSanitario.textContent = san ? (san.nombre + " " + san.apellidos).trim() : "Cargando...";
    
    // Columna 2: Horas estimadas
    var tdHoras = document.createElement("td");
    tdHoras.textContent = reserva.horas_estimadas || 0;
    
    // Columna 3: Fecha petición
    var tdFecha_Peticion = document.createElement("td");
    tdFecha_Peticion.textContent = reserva.fecha_peticion 
      ? new Date(reserva.fecha_peticion).toLocaleString('es-ES') 
      : '';
    
    // Columna 4: Fecha inicio
    var tdFecha_Inicio = document.createElement("td");
    tdFecha_Inicio.textContent = reserva.fecha_inicio 
      ? new Date(reserva.fecha_inicio).toLocaleString('es-ES') 
      : 'No iniciada';
    
    // Columna 5: Fecha fin
    var tdFecha_Fin = document.createElement("td");
    tdFecha_Fin.textContent = reserva.fecha_fin 
      ? new Date(reserva.fecha_fin).toLocaleString('es-ES') 
      : 'Pendiente';
    
    // Añadir columnas en orden correcto
    tr.appendChild(tdSanitario);
    tr.appendChild(tdHoras);
    tr.appendChild(tdFecha_Peticion);
    tr.appendChild(tdFecha_Inicio);
    tr.appendChild(tdFecha_Fin);
    
    cuerpoReservas.appendChild(tr);
    total++;
    
    // Cargar nombre sanitario si no está en cache local
    if (!san) {
      rest.get("/api/sanitarios/" + reserva.sanitario + "?token="+tokenCod, function(estado, datosSan) {
        if (estado === 200) {
          tdSanitario.textContent = (datosSan.nombre || "") + " " + (datosSan.apellidos || "");
          sanitarios.push(datosSan);
        } else {
          tdSanitario.textContent = "ID: " + reserva.sanitario;
        }
      });
    }
  });
  
  document.getElementById("totalReservas").textContent = "Total: " + total;
}



  // Función corregida para mostrar correctamente sanitarios en reseñas
  function pintarTablaResenas(resenas) {
    var cuerpoResenas = document.getElementById("cuerpoTResenas");
    cuerpoResenas.innerHTML = "";
    
    if (!resenas || resenas.length === 0) {
      return;
    }
    
    resenas.forEach(function(resena) {
      var tr = document.createElement("tr");
      
      // Columna 1: Fecha de la reseña
      var tdFecha = document.createElement("td");
      tdFecha.textContent = resena.fecha ? new Date(resena.fecha).toLocaleDateString('es-ES') : '';
      
      // Columna 2: Nombre del sanitario (con carga dinámica)
      var tdSanitario = document.createElement("td");
      var sanitarioLocal = sanitarios.find(s => s.id == resena.sanitario);
      
      if (sanitarioLocal) {
        // Si existe en cache local
        tdSanitario.textContent = (sanitarioLocal.nombre + " " + sanitarioLocal.apellidos).trim() || "N/A";
      } else {
        // Carga dinámica si no está en cache
        tdSanitario.textContent = "Cargando...";
        rest.get("/api/sanitarios/" + resena.sanitario+ "?token="+tokenCod, function(estado, datosSan) {
          if (estado === 200 && datosSan) {
            tdSanitario.textContent = (datosSan.nombre + " " + datosSan.apellidos).trim() || "N/A";
            // Añadir a cache local para futuras reseñas
            sanitarios.push(datosSan);
          } else {
            tdSanitario.textContent = "ID: " + resena.sanitario;
          }
        });
      }
      
      // Columna 3: Valoración
      var tdValor = document.createElement("td");
      tdValor.textContent = resena.valor || "?";
      
      // Columna 4: Comentario
      var tdComentario = document.createElement("td");
      tdComentario.textContent = resena.descripcion || "";

      //Columna 5: Informacion
      var tdInformacion = document.createElement("td")
      var btnInformacion = document.createElement("button")
      btnInformacion.textContent= "Mas informacion"
      btnInformacion.className = "Editar"
      btnInformacion.onclick = function(){
        // notificarInformacion(resena.id, idGestor)
      }

      tdInformacion.appendChild(btnInformacion);

      // Añadir columnas en orden correcto
      tr.appendChild(tdFecha);
      tr.appendChild(tdSanitario);
      tr.appendChild(tdValor);
      tr.appendChild(tdComentario);
      tr.appendChild(tdInformacion)
      
      cuerpoResenas.appendChild(tr);
    });
  }



function editarRecurso(idRecurso) {
  idRecursoEditado = null
  rest.get("/api/recursos/" + idRecurso + "?token=" +tokenCod, function(estado, recurso) {
    if (estado !== 200) {
      alert("Error: " + estado);
      return;
    }
    
    document.getElementById("nSerieRecurso").value = recurso.numero_serie || recurso.numSerie || "";
    selectUbicacion.value = recurso.ubicacion || "";
    selectEstado.value = recurso.estado || "";
    
    var modeloInfo = modelos.find(m => m.id == recurso.modelo);
    if (modeloInfo) {
      selectCategoria.value = modeloInfo.categoria;
      cargarModelosPorCategoria(selectModelo, modeloInfo.categoria);
      setTimeout(() => selectModelo.value = recurso.modelo, 100);
    }
    

    cargarFichaRecurso(idRecurso);
    idRecursoEditado = idRecurso;
    cambiarSeccion("recurso");
  });
}


var botonGuardarRecurso = document.getElementById("guardarRecurso");

botonGuardarRecurso.addEventListener("click", function(){
  var categoria = selectCategoria.value;
  var modelo = selectModelo.value;
  var ubicacion = selectUbicacion.value;
  var estado = selectEstado.value;
  var numSerie = document.getElementById("nSerieRecurso").value;

  if (modelo === "" || ubicacion === "" || estado === "" || numSerie.trim() === "") {
    return alert("Faltan datos (modelo, ubicación, estado o nº serie).");
  }

  var nuevo = {
    categoria: categoria || null,
    modelo: modelo,
    numSerie: numSerie.trim(),
    ubicacion: ubicacion,
    estado: estado,
    idGestor: idGestor
  };

  rest.post("/api/recursos?token="+ tokenCod, nuevo, function(codigo, respuesta){
    if (codigo === 200 || codigo === 201) {
      alert(respuesta);

      // limpiar formulario
      document.getElementById("nSerieRecurso").value = "";
      selectCategoria.value = "";
      cargarModelosPorCategoria(selectModelo, ""); // Reinicia modelos
      selectUbicacion.value = "";
      selectEstado.value = "";

      // volver al menú y refrescar lista
      cambiarSeccion("menuPrincipal");
      buscarRecurso();
    } else {
      alert("Error " + codigo + " " + respuesta);
    }
  });
});



function cargarSelect() {
  // Cargar categorías
  rest.get("/api/categorias?token="+tokenCod, function(estadoCat, categoriasData) {
    if (estadoCat !== 200) {
      alert("Error categorías: " + estadoCat);
      return;
    }
    categorias = categoriasData;
    
    // Cargar modelos
    rest.get("/api/modelos?token="+tokenCod, function(estadoMod, modelosData) {
      if (estadoMod !== 200) {
        alert("Error modelos: " + estadoMod);
        return;
      }
      modelos = modelosData;
      
      // Cargar ubicaciones
      rest.get("/api/ubicaciones?token="+tokenCod, function(estadoUbi, ubicacionesData) {
        if (estadoUbi !== 200) {
          alert("Error ubicaciones: " + estadoUbi);
          return;
        }
        ubicaciones = ubicacionesData;
        
        cargarSelectSimple(selCatMenu, categorias, "Todas");
        cargarModelosPorCategoria(selModMenu, "");  // Vacío = todos
        
        cargarSelectSimple(selUbiMenu, ubicaciones, "Todas");
        cargarSelectSimple(selEstMenu, estados, "Todos");
        
        cargarSelectSimple(selectCategoria, categorias, "Todas");
        cargarModelosPorCategoria(selectModelo, "");  // Vacío = todos
        
        cargarSelectSimple(selectUbicacion, ubicaciones, "Todas");
        cargarSelectSimple(selectEstado, estados, "Todos");
        
        //Cambio de modelos segun la categoria
        selCatMenu.onchange = function() { 
          cargarModelosPorCategoria(selModMenu, selCatMenu.value); 
        };
        
        selectCategoria.onchange = function() { 
          cargarModelosPorCategoria(selectModelo, selectCategoria.value); 
        };
        
        console.log("Selects cargados con cambio dinámico!");
      });
    });
  });
}


document.getElementById("addRecurso").onclick = function() {
  idRecursoEditado = null; 
  limpiarFormularioRecurso();
  cambiarSeccion("recurso");
};

// ==========================================
// PARTE 1: INTEGRACIÓN CON EL MINISTERIO
// ==========================================

var id_area = 11; // Código asignado a Neumología

// Catálogo oficial con las 18 áreas médicas del Ministerio
var listaAreasMedicas = [
  { id: 1, nombre: "Alergología" },
  { id: 2, nombre: "Anestesiología" },
  { id: 3, nombre: "Cardiología" },
  { id: 4, nombre: "Cirugía General" },
  { id: 5, nombre: "Dermatología" },
  { id: 6, nombre: "Aparato Digestivo" },
  { id: 7, nombre: "Endocrinología" },
  { id: 8, nombre: "Ginecología" },
  { id: 9, nombre: "Hematología" },
  { id: 10, nombre: "Medicina Interna" },
  { id: 11, nombre: "Neumología" },
  { id: 12, nombre: "Neurología" },
  { id: 13, nombre: "Oftalmología" },
  { id: 14, nombre: "Oncología" },
  { id: 15, nombre: "Pediatría" },
  { id: 16, nombre: "Psiquiatría" },
  { id: 17, nombre: "Traumatología" },
  { id: 18, nombre: "Urología" }
];

// ------------------------------------------
// 1. MÉTODO POST (RECOPILAR Y ENVIAR DATOS)
// ------------------------------------------
function enviarDatosMinisterio() {
  // Se vacía la lista al inicio
  var listaDatos = [];

  // Petición para obtener todos los recursos
  rest.get("/api/recursos?token="+tokenCod, function(estadoRec, recursos) {
    if (estadoRec !== 200) {
      alert("Error al obtener los recursos. Código: " + estadoRec);
      return;
    }

    var recursosProcesados = 0;
    var totalRecursos = recursos.length;

    if (totalRecursos === 0) {
      mudarDatosAlMinisterio(listaDatos);
      return;
    }

    // Obtención de reservas por cada recurso
    recursos.forEach(function(recurso) {
      rest.get("/api/recursos/" + recurso.id + "/reservas", function(estadoRes, reservas) {
        if (estadoRes === 200 && reservas.length > 0) {
          var reservasProcesadas = 0;
          var totalReservas = reservas.length;

          // Obtención del sanitario para cada reserva
          reservas.forEach(function(reserva) {
            rest.get("/api/sanitarios/" + reserva.sanitario + "?token="+tokenCod, function(estadoSan, sanitario) {
              var categoriaNombre = nombreCategoriaDesdeModeloId(recurso.modelo);

              // Creación del objeto y adición al array de datos
              listaDatos.push({
                nombre: (estadoSan === 200 && sanitario.nombre) ? sanitario.nombre : "Sanitario",
                apellidos: (estadoSan === 200 && sanitario.apellidos) ? sanitario.apellidos : "Anónimo",
                categoria: categoriaNombre || "General",
                horas_estimadas: reserva.horas_estimadas || 0,
                fec_pet: reserva.fecha_peticion ? reserva.fecha_peticion.split('T')[0] : "",
                fec_ini: reserva.fecha_inicio ? reserva.fecha_inicio.split('T')[0] : "",
                fecha_fin: reserva.fecha_fin ? reserva.fecha_fin.split('T')[0] : ""
              });

              reservasProcesadas++;
              if (reservasProcesadas === totalReservas) {
                recursosProcesados++;
                if (recursosProcesados === totalRecursos) {
                  mudarDatosAlMinisterio(listaDatos);
                }
              }
            });
          });
        } else {
          recursosProcesados++;
          if (recursosProcesados === totalRecursos) {
            mudarDatosAlMinisterio(listaDatos);
          }
        }
      });
    });
  });
}

function mudarDatosAlMinisterio(datos) {
  // Se crea el objeto paquete generando la fecha actual directamente en la propiedad
  var paquete = {
    id_area: id_area,
    fecha: new Date().toISOString().split('T')[0],
    datos: datos
  };

  rest.post("https://undefined.ua.es/telemedicina/api/datos", paquete, function(estado, respuesta) {
    if (estado === 200 || estado === 201) {
      alert("Información enviada al Ministerio correctamente.");
      cargarRankingMinisterio();
    } else {
      alert("Error al enviar datos al Ministerio: " + estado);
    }
  });
}

// ------------------------------------------
// 2. MÉTODO GET (OBTENER RANKING)
// ------------------------------------------
function cargarRankingMinisterio() {
  // Reiniciamos los contadores de las áreas
  var rankingCalculado = listaAreasMedicas.map(function(area) {
    return { id: area.id, nombre: area.nombre, totalReservas: 0 };
  });

  rest.get("https://undefined.ua.es/telemedicina/api/datos", function(estado, respuesta) {
    if (estado === 200) {
      respuesta.forEach(function(registro) {
        var areaExistente = rankingCalculado.find(function(item) {
          return item.id == registro.id_area;
        });

        if (areaExistente) {
          if (registro.datos && registro.datos.length !== undefined) {
            areaExistente.totalReservas += registro.datos.length;
          } else if (registro.datos) {
            areaExistente.totalReservas += 1;
          }
        }
      });

      // Ordenar áreas de mayor a menor volumen de reservas
      rankingCalculado.sort(function(a, b) {
        return b.totalReservas - a.totalReservas;
      });

      pintarTablaRanking(rankingCalculado);
    } else {
      console.log("No se pudo obtener el ranking. Código: " + estado);
    }
  });
}

// ------------------------------------------
// 3. MÉTODO PARA PINTAR LA TABLA EN HTML
// ------------------------------------------
function pintarTablaRanking(ranking) {
  var cuerpoTabla = document.getElementById("cuerpoTRanking");
  if (!cuerpoTabla) return;

  // Vaciar la tabla antes de insertar
  cuerpoTabla.innerHTML = "";

  ranking.forEach(function(item) {
    var tr = document.createElement("tr");

    var tdNombre = document.createElement("td");
    tdNombre.textContent = item.nombre;

    var tdReservas = document.createElement("td");
    tdReservas.textContent = item.totalReservas;

    tr.appendChild(tdNombre);
    tr.appendChild(tdReservas);

    cuerpoTabla.appendChild(tr);
  });
}

// ------------------------------------------
// EVENTOS EN EL DOM
// ------------------------------------------
var btnEnviarMinisterio = document.getElementById("enviarMinisterio");
if (btnEnviarMinisterio) {
  btnEnviarMinisterio.onclick = enviarDatosMinisterio;
}

var btnRefrescarRanking = document.getElementById("refrescarRanking");
if (btnRefrescarRanking) {
  btnRefrescarRanking.onclick = cargarRankingMinisterio;
}


// document.getElementById("botonenviarsalud").onclick = function () {
//     var codigopostal = document.getElementById("codigopostal").value.trim();
//     var nombresalud = document.getElementById("nombresalud").value.trim();

//     if (codigopostal === "" || nombresalud === "") {
//         return alert("Rellena el código postal y el nombre.");
//     }

//     var nuevoArea = {
//         Codigo_postal: codigopostal,
//         nombre: nombresalud,
//         gestor: idGestor,
//         sanitario: null
//     };

//     rest.post("/api/area_salud", nuevoArea, function (estado, datos) {
//         if (estado === 201) {
//             alert(datos);
//             document.getElementById("codigopostal").value = "";
//             document.getElementById("nombresalud").value = "";
//         } else {
//             alert("Error " + estado + ": " + datos);
//             console.log(datos);
//         }
//     });
// };


