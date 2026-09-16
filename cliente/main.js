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

var modoRecurso = "nuevo";


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
            idGestor = respuesta;
            crearConexion(idGestor, "gestor")
            cargarBienvenida();
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
    cerrarConexion();
    cambiarSeccion("login");
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
      document.getElementById("userRegistro").readOnly = true;
      document.getElementById("passRegistro").readOnly = true;
    } else 
      {
      alert("Error " + estado + " " + respuesta);
    }
  });
}



botonGuardarRegistro.addEventListener('click',function(){
    //Guardar datos en el database y vaciar formulario
    var nombre = document.getElementById("nameRegistro");
    var apellidos = document.getElementById("apellidosRegistro");
    var usuario = document.getElementById("userRegistro");
    var contraseña = document.getElementById("passRegistro");

    var usuarioActualizado = {
        nombre: nombre.value,
        apellidos: apellidos.value,
        usuario: usuario.value,
        password: contraseña.value
    }
    if (ultimaSeccion=='menuPrincipal'){
      if (!nombre && !apellidos && !usuario && !password){
        var continuar = confirm('¿Hay campos en blanco, seguro que quieres continuar?')
      }
      if (confimar){

    rest.put("/api/gestores/"+idGestor, usuarioActualizado, function(estado, respuesta){

    if (200==estado){   
        alert(respuesta)

        nombre.value = "";
        apellidos.value = "";
        usuario.value = "";
        contraseña.value = "";

        cargarBienvenida();
        alert(respuesta);
        cambiarSeccion('menuPrincipal');
    }
    else {
      alert(respuesta)
    }})}
    else{
      
  }}
    else{
      rest.post("api/gestores/",usuarioActualizado,function(estado, respuesta){
        if (estado==201){
          alert(respuesta);
          cambiarSeccion('login');
        }
      })
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
  modoRecurso = "nuevo";  // Reset modo
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

  var url = "/api/recursos"
    + "?categoria=" + encodeURIComponent(categoria)
    + "&modelo=" + encodeURIComponent(modelo)
    + "&ubicacion=" + encodeURIComponent(ubicacion)
    + "&estado=" + encodeURIComponent(estado); 

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
  rest.get("/api/recursos/" + idRecurso, function(estado, recurso) {
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
  
  rest.delete("/api/recursos/" + idRecurso, function(estado, respuesta) {
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
  rest.get("/api/recursos/" + idRecurso + "/reservas", function(estadoRes, reservasData) {
    if (estadoRes === 200) {
      pintarTablaReservas(reservasData);
    }
  });
  
  // Cargar reseñas
  rest.get("/api/recursos/" + idRecurso + "/resenyas", function(estadoRese, resenasData) {
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
    tdHoras.textContent = reserva.horasestimadas || 0;
    
    // Columna 3: Fecha petición
    var tdFechaPeticion = document.createElement("td");
    tdFechaPeticion.textContent = reserva.fechapeticion 
      ? new Date(reserva.fechapeticion).toLocaleString('es-ES') 
      : '';
    
    // Columna 4: Fecha inicio
    var tdFechaInicio = document.createElement("td");
    tdFechaInicio.textContent = reserva.fechainicio 
      ? new Date(reserva.fechainicio).toLocaleString('es-ES') 
      : 'No iniciada';
    
    // Columna 5: Fecha fin
    var tdFechaFin = document.createElement("td");
    tdFechaFin.textContent = reserva.fechafin 
      ? new Date(reserva.fechafin).toLocaleString('es-ES') 
      : 'Pendiente';
    
    // Añadir columnas en orden correcto
    tr.appendChild(tdSanitario);
    tr.appendChild(tdHoras);
    tr.appendChild(tdFechaPeticion);
    tr.appendChild(tdFechaInicio);
    tr.appendChild(tdFechaFin);
    
    cuerpoReservas.appendChild(tr);
    total++;
    
    // Cargar nombre sanitario si no está en cache local
    if (!san) {
      rest.get("/api/sanitarios/" + reserva.sanitario, function(estado, datosSan) {
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
        rest.get("/api/sanitarios/" + resena.sanitario, function(estado, datosSan) {
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
      
      // Añadir columnas en orden correcto
      tr.appendChild(tdFecha);
      tr.appendChild(tdSanitario);
      tr.appendChild(tdValor);
      tr.appendChild(tdComentario);
      
      cuerpoResenas.appendChild(tr);
    });
  }



function editarRecurso(idRecurso) {
  rest.get("/api/recursos/" + idRecurso, function(estado, recurso) {
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
    estado: estado
  };

  rest.post("/api/recursos", nuevo, function(codigo, respuesta){
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
  rest.get("/api/categorias", function(estadoCat, categoriasData) {
    if (estadoCat !== 200) {
      alert("Error categorías: " + estadoCat);
      return;
    }
    categorias = categoriasData;
    
    // Cargar modelos
    rest.get("/api/modelos", function(estadoMod, modelosData) {
      if (estadoMod !== 200) {
        alert("Error modelos: " + estadoMod);
        return;
      }
      modelos = modelosData;
      
      // Cargar ubicaciones
      rest.get("/api/ubicaciones", function(estadoUbi, ubicacionesData) {
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
  modoRecurso = "nuevo"; 
  limpiarFormularioRecurso();
  cambiarSeccion("recurso");
};


cargarSelect();