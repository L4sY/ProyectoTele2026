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

// Función auxiliar para añadir el token de forma limpia a cualquier URL de la API
function urlConToken(url) {
  if (!tokenCod) return url;
  if (url.includes("token=")) return url; // Evita duplicar el token si ya lo tiene
  var separador = url.indexOf("?") === -1 ? "?" : "&";
  return url + separador + "token=" + tokenCod;
}

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
            token = respuesta.token;
            tokenCod = encodeURIComponent(token);
            
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
  rest.get(urlConToken("/api/gestores/"+idGestor), function(estadoG,respuestaG){
        if (estadoG ==200){
        textoBienvenida.innerHTML = "Bienvenido "+ respuestaG.nombre + " "+respuestaG.apellidos
        }
      })
}

function salir(){
    cambiarSeccion("login");
    idGestor = null;
    token = null;
    tokenCod = null;
}

function cargarRegistro() {
    document.getElementById("nameRegistro").value = ""
    document.getElementById("apellidosRegistro").value = ""
    document.getElementById("userRegistro").value = ""
    document.getElementById("passRegistro").value = "";
    document.getElementById("userRegistro").readOnly = false;
    document.getElementById("passRegistro").readOnly = false;
}

function cargarDatosEnRegistro() {
  if (idGestor == null) return;

  rest.get(urlConToken("/api/gestores/" + idGestor), function(estado, respuesta) {
    if (estado === 200) {
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

botonGuardarRegistro.addEventListener('click', function () {
  var nombre = document.getElementById("nameRegistro").value.trim();
  var apellidos = document.getElementById("apellidosRegistro").value.trim();
  var usuario = document.getElementById("userRegistro").value.trim();
  var contraseña = document.getElementById("passRegistro").value;

  if (ultimaSeccion === 'menuPrincipal') {
    if (nombre === "" || apellidos === "") {
      if (!confirm('Hay campos en blanco, ¿seguro que quieres continuar?')) return;
    }
    rest.put(urlConToken("/api/gestores/" + idGestor), { nombre: nombre, apellidos: apellidos }, function (estado, respuesta) {
      if (estado === 200) {
        alert(respuesta);
        cargarBienvenida();
        cambiarSeccion('menuPrincipal');
      } else {
        alert("Error " + estado + " " + respuesta);
      }
    });
  } else {
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
    document.getElementById("nameRegistro").value = "";
    document.getElementById("apellidosRegistro").value = "";
    document.getElementById("userRegistro").value = "";
    document.getElementById("passRegistro").value = "";
    
    if (ultimaSeccion!='login'){
      cambiarSeccion('menuPrincipal');
    } else {
      cambiarSeccion('login');
    }
});

function limpiarFormularioRecurso() {
  document.getElementById("nSerieRecurso").value = "";
  selectCategoria.value = "";
  selectModelo.value = "";
  selectUbicacion.value = "";
  selectEstado.value = "";
  idRecursoEditado = null;
}
  document.getElementById("cuerpoTReservas").innerHTML = "";
  document.getElementById("totalReservas").textContent = "";
  document.getElementById("cuerpoTResenas").innerHTML = "";

var cuerpoTRecursos = document.getElementById("cuerpoTRecursos");
var contadorRecursos = document.getElementById("contadorRecursos");

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

    var tdSerie = document.createElement("td");
    tdSerie.textContent = r.numero_serie || r.numSerie || "";

    var tdCat = document.createElement("td");
    tdCat.textContent = nombreCategoriaDesdeModeloId(r.modelo);

    var tdMod = document.createElement("td");
    tdMod.textContent = nombreModelo(r.modelo);

    var tdUbi = document.createElement("td");
    tdUbi.textContent = nombreUbicacion(r.ubicacion);

    var tdEst = document.createElement("td");
    tdEst.textContent = nombreEstado(r.estado);

    var tdAcc = document.createElement("td");
    tdAcc.className = "acciones";  
    
    var btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-editar";
    btnEditar.onclick = function() { 
      editarRecurso(r.id); 
    };
    
    var btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.onclick = function() { 
      eliminarRecurso(r.id); 
    };
    
    tdAcc.appendChild(btnEditar);
    tdAcc.appendChild(document.createTextNode(" "));
    tdAcc.appendChild(btnEliminar);

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

  var url = "/api/recursos"
    + "?categoria=" + encodeURIComponent(categoria)
    + "&modelo=" + encodeURIComponent(modelo)
    + "&ubicacion=" + encodeURIComponent(ubicacion)
    + "&estado=" + encodeURIComponent(estado); 

  rest.get(urlConToken(url), function(codigo, respuesta){
    if (codigo === 200) {
      pintarTablaRecursos(respuesta);
    } else {
      alert("Error " + codigo + " " + respuesta);
    }
  });
}

function editarRecurso(idRecurso) {
  idRecursoEditado = null;
  rest.get(urlConToken("/api/recursos/" + idRecurso), function(estado, recurso) {
    if (estado !== 200) {
      alert("Error: " + estado);
      return;
    }
    
    document.getElementById("nSerieRecurso").value = recurso.numero_serie || recurso.numSerie || "";
    selectUbicacion.value = recurso.ubicacion ?? "";
    selectEstado.value = recurso.estado ?? "";
    
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

function eliminarRecurso(idRecurso) {
  if (!confirm("¿Eliminar este recurso permanentemente?")) return;
  
  rest.delete(urlConToken("/api/recursos/" + idRecurso), function(estado, respuesta) {
    if (estado === 200) {
      alert("Recurso eliminado");
      buscarRecurso();  
    } else {
      alert("Error eliminando: " + estado + " - " + respuesta);
    }
  });
}

function cargarFichaRecurso(idRecurso) {
  rest.get(urlConToken("/api/recursos/" + idRecurso + "/reservas"), function(estadoRes, reservasData) {
    if (estadoRes === 200) {
      pintarTablaReservas(reservasData);
    }
  });
  
  rest.get(urlConToken("/api/recursos/" + idRecurso + "/resenyas"), function(estadoRese, resenasData) {
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
    
    var tdSanitario = document.createElement("td");
    var san = sanitarios.find(s => s.id == reserva.sanitario);
    tdSanitario.textContent = san ? (san.nombre + " " + san.apellidos).trim() : "Cargando...";
    
    var tdHoras = document.createElement("td");
    tdHoras.textContent = reserva.horas_estimadas || 0;
    
    var tdFecha_Peticion = document.createElement("td");
    tdFecha_Peticion.textContent = reserva.fecha_peticion 
      ? new Date(reserva.fecha_peticion).toLocaleString('es-ES') 
      : '';
    
    var tdFecha_Inicio = document.createElement("td");
    tdFecha_Inicio.textContent = reserva.fecha_inicio 
      ? new Date(reserva.fecha_inicio).toLocaleString('es-ES') 
      : 'No iniciada';
    
    var tdFecha_Fin = document.createElement("td");
    tdFecha_Fin.textContent = reserva.fecha_fin 
      ? new Date(reserva.fecha_fin).toLocaleString('es-ES') 
      : 'Pendiente';
    
    tr.appendChild(tdSanitario);
    tr.appendChild(tdHoras);
    tr.appendChild(tdFecha_Peticion);
    tr.appendChild(tdFecha_Inicio);
    tr.appendChild(tdFecha_Fin);
    
    cuerpoReservas.appendChild(tr);
    total++;
    
    if (!san) {
      rest.get(urlConToken("/api/sanitarios/" + reserva.sanitario), function(estado, datosSan) {
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

function pintarTablaResenas(resenas) {
  var cuerpoResenas = document.getElementById("cuerpoTResenas");
  cuerpoResenas.innerHTML = "";
  
  if (!resenas || resenas.length === 0) {
    return;
  }
  
  resenas.forEach(function(resena) {
    var tr = document.createElement("tr");
    
    var tdFecha = document.createElement("td");
    tdFecha.textContent = resena.fecha ? new Date(resena.fecha).toLocaleDateString('es-ES') : '';
    
    var tdSanitario = document.createElement("td");
    var sanitarioLocal = sanitarios.find(s => s.id == resena.sanitario);
    
    if (sanitarioLocal) {
      tdSanitario.textContent = (sanitarioLocal.nombre + " " + sanitarioLocal.apellidos).trim() || "N/A";
    } else {
      tdSanitario.textContent = "Cargando...";
      rest.get(urlConToken("/api/sanitarios/" + resena.sanitario), function(estado, datosSan) {
        if (estado === 200 && datosSan) {
          tdSanitario.textContent = (datosSan.nombre + " " + datosSan.apellidos).trim() || "N/A";
          sanitarios.push(datosSan);
        } else {
          tdSanitario.textContent = "ID: " + resena.sanitario;
        }
      });
    }
    
    var tdValor = document.createElement("td");
    tdValor.textContent = resena.valor || "?";
    
    var tdComentario = document.createElement("td");
    tdComentario.textContent = resena.descripcion || "";

    var tdInformacion = document.createElement("td");
    var btnInformacion = document.createElement("button");
    btnInformacion.textContent= "Mas informacion";
    btnInformacion.className = "Editar";
    btnInformacion.onclick = function(){
    };

    tdInformacion.appendChild(btnInformacion);

    tr.appendChild(tdFecha);
    tr.appendChild(tdSanitario);
    tr.appendChild(tdValor);
    tr.appendChild(tdComentario);
    tr.appendChild(tdInformacion);
    
    cuerpoResenas.appendChild(tr);
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

    if (idRecursoEditado) {
    var editado = { modelo: modelo, numero_serie: numSerie.trim(), ubicacion: ubicacion, estado: estado };
    rest.put(urlConToken("/api/recursos/" + idRecursoEditado), editado, function(codigo, respuesta){
      if (codigo === 200 || codigo === 201) {
        alert(respuesta);
        limpiarFormularioRecurso();
        cambiarSeccion("menuPrincipal");
        buscarRecurso();
      } else {
        alert("Error " + codigo + " " + respuesta);
      }
    });
    return;
  }

  var nuevo = {
    categoria: categoria || null,
    modelo: modelo,
    numSerie: numSerie.trim(),
    ubicacion: ubicacion,
    estado: estado,
    idGestor: idGestor
  };

  rest.post(urlConToken("/api/recursos"), nuevo, function(codigo, respuesta){
    if (codigo === 200 || codigo === 201) {
      alert(respuesta);

      document.getElementById("nSerieRecurso").value = "";
      selectCategoria.value = "";
      cargarModelosPorCategoria(selectModelo, ""); 
      selectUbicacion.value = "";
      selectEstado.value = "";

      cambiarSeccion("menuPrincipal");
      buscarRecurso();
    } else {
      alert("Error " + codigo + " " + respuesta);
    }
  });
});

function cargarSelect() {
  rest.get(urlConToken("/api/categorias"), function(estadoCat, categoriasData) {
    if (estadoCat !== 200) {
      alert("Error categorías: " + estadoCat);
      return;
    }
    categorias = categoriasData;
    
    rest.get(urlConToken("/api/modelos"), function(estadoMod, modelosData) {
      if (estadoMod !== 200) {
        alert("Error modelos: " + estadoMod);
        return;
      }
      modelos = modelosData;
      
      rest.get(urlConToken("/api/ubicaciones"), function(estadoUbi, ubicacionesData) {
        if (estadoUbi !== 200) {
          alert("Error ubicaciones: " + estadoUbi);
          return;
        }
        ubicaciones = ubicacionesData;
        
        cargarSelectSimple(selCatMenu, categorias, "Todas");
        cargarModelosPorCategoria(selModMenu, "");  
        
        cargarSelectSimple(selUbiMenu, ubicaciones, "Todas");
        cargarSelectSimple(selEstMenu, estados, "Todos");
        
        cargarSelectSimple(selectCategoria, categorias, "Todas");
        cargarModelosPorCategoria(selectModelo, "");  
        
        cargarSelectSimple(selectUbicacion, ubicaciones, "Todas");
        cargarSelectSimple(selectEstado, estados, "Todos");
        
        selCatMenu.onchange = function() { 
          cargarModelosPorCategoria(selModMenu, selCatMenu.value); 
        };
        
        selectCategoria.onchange = function() { 
          cargarModelosPorCategoria(selectModelo, selectCategoria.value); 
        };
      });
    });
  });
}

document.getElementById("addRecurso").onclick = function() {
  idRecursoEditado = null; 
  limpiarFormularioRecurso();
  cambiarSeccion("recurso");
};

var id_area = 11; 

var listaAreasMedicas = [
  { id: 1, nombre: "Alergología" }, { id: 2, nombre: "Anestesiología" },
  { id: 3, nombre: "Cardiología" }, { id: 4, nombre: "Cirugía General" },
  { id: 5, nombre: "Dermatología" }, { id: 6, nombre: "Aparato Digestivo" },
  { id: 7, nombre: "Endocrinología" }, { id: 8, nombre: "Ginecología" },
  { id: 9, nombre: "Hematología" }, { id: 10, nombre: "Medicina Interna" },
  { id: 11, nombre: "Neumología" }, { id: 12, nombre: "Neurología" },
  { id: 13, nombre: "Oftalmología" }, { id: 14, nombre: "Oncología" },
  { id: 15, nombre: "Pediatría" }, { id: 16, nombre: "Psiquiatría" },
  { id: 17, nombre: "Traumatología" }, { id: 18, nombre: "Urología" }
];

function enviarDatosMinisterio() {
  var listaDatos = [];

  rest.get(urlConToken("/api/recursos"), function(estadoRec, recursos) {
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

    recursos.forEach(function(recurso) {
      rest.get(urlConToken("/api/recursos/" + recurso.id + "/reservas"), function(estadoRes, reservas) {
        if (estadoRes === 200 && reservas.length > 0) {
          var reservasProcesadas = 0;
          var totalReservas = reservas.length;

          reservas.forEach(function(reserva) {
            rest.get(urlConToken("/api/sanitarios/" + reserva.sanitario), function(estadoSan, sanitario) {
              var categoriaNombre = nombreCategoriaDesdeModeloId(recurso.modelo);

              listaDatos.push({
                nombre: (estadoSan === 200 && sanitario.nombre) ? sanitario.nombre : "Sanitario",
                apellidos: (estadoSan === 200 && sanitario.apellidos) ? sanitario.apellidos : "Anónimo",
                categoria: categoriaNombre || "General",
                horas_estimadas: reserva.horas_estimadas || 0,
                fec_pet: reserva.fecha_peticion ? reserva.fecha_peticion.split('T')[0] : "",
                fec_ini: reserva.fecha_inicio ? reserva.fecha_inicio.split('T')[0] : "",
                fec_fin: reserva.fecha_fin ? reserva.fecha_fin.split('T')[0] : ""
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

function cargarRankingMinisterio() {
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

      rankingCalculado.sort(function(a, b) {
        return b.totalReservas - a.totalReservas;
      });

      pintarTablaRanking(rankingCalculado);
    } else {
      console.log("No se pudo obtener el ranking. Código: " + estado);
    }
  });
}

function pintarTablaRanking(ranking) {
  var cuerpoTabla = document.getElementById("cuerpoTRanking");
  if (!cuerpoTabla) return;

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

var btnEnviarMinisterio = document.getElementById("enviarMinisterio");
if (btnEnviarMinisterio) {
  btnEnviarMinisterio.onclick = enviarDatosMinisterio;
}

var btnRefrescarRanking = document.getElementById("refrescarRanking");
if (btnRefrescarRanking) {
  btnRefrescarRanking.onclick = cargarRankingMinisterio;
}


function contarReservasArea() {
  var idArea = document.getElementById("numeroIDArea").value;

  if (idArea === "") {
    alert("Introduce el número del área");
    return;
  }

  rest.get("https://undefined.ua.es/telemedicina/api/datos", function(estado, respuesta) {
    if (estado === 200) {
      var total = 0;

      for (var i = 0; i < respuesta.length; i++) {
        if (respuesta[i].id_area == idArea) {
          total = total + respuesta[i].datos.length;
        }
      }

      alert("Reservas totales del área " + idArea + ": " + total)
    } else {
      alert("Error al consultar el ministerio: " + estado);
    }
  });
}


function porcentajeFinalizadasArea() {

  rest.get("https://undefined.ua.es/telemedicina/api/datos", function(estado, respuesta) {
    if (estado === 200) {
      var total = 0;
      var finalizadas = 0;

      for (var i = 0; i < respuesta.length; i++) {
        if (respuesta[i].id_area == 4) {
          var datos = respuesta[i].datos;

          for (var j = 0; j < datos.length; j++) {
            total = total + 1;

            if (datos[j].fecha_fin != "") {
              finalizadas = finalizadas + 1;
            }
          }
        }
      }

      if (total === 0) {
        alert("El área 4 no tiene reservas")
      } else {
        var porcentaje = finalizadas * 100 / total;
        alert("Área 4 (Cirugía general): " + porcentaje + "% finalizadas")
      }
    } else {
      alert("Error al consultar el ministerio: " + estado);
    }
  });
}
