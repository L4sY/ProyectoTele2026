var app = rpc("localhost", "gestion_pacientes");


var obtenerModelos      = app.procedure("obtenerModelos");
var obtenerUbicaciones  = app.procedure("obtenerUbicaciones");
var obtenerCategorias   = app.procedure("obtenerCategorias");
var loginSanitario      = app.procedure("loginSanitario");
var crearSanitario      = app.procedure("crearSanitario");
var actualizarSanitario = app.procedure("actualizarSanitario");
var obtenerSanitario    = app.procedure("obtenerSanitario");
var obtenerRecursos     = app.procedure("obtenerRecursos");
var tiempoPendiente     = app.procedure("tiempoPendiente");
var obtenerReservas     = app.procedure("obtenerReservas");
var obtenerResenyas     = app.procedure("obtenerResenyas");
var crearResenya        = app.procedure("crearResenya");
var reservarRecurso     = app.procedure("reservarRecurso");
var cancelarReserva     = app.procedure("cancelarReserva");
var iniciarReserva      = app.procedure("iniciarReserva");
var finalizarReserva    = app.procedure("finalizarReserva");
var obtenerRecurso      = app.procedure("obtenerRecurso");
// var asignarArea         = app.procedure("asignarArea")

var seccionActual    = "login";
var ultimaSeccion    = "";
var idUsuarioActivo  = null;
var idRecursoResenya = null;

function etiquetarTablas() {
  document.querySelectorAll('table').forEach(tabla => {
    const cabeceras = [...tabla.querySelectorAll('thead th')].map(th => th.textContent.trim());
    tabla.querySelectorAll('tbody tr').forEach(tr => {
      [...tr.children].forEach((td, i) => {
        if (cabeceras[i] && td.getAttribute('data-label') !== cabeceras[i]) {
          td.setAttribute('data-label', cabeceras[i]);
        }
      });
    });
  });
}

new MutationObserver(etiquetarTablas)
  .observe(document.body, { childList: true, subtree: true });

etiquetarTablas();

function cambiarSeccion(seccion) {
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    ultimaSeccion = seccionActual;
    seccionActual = seccion;
}

function login() {
    var usuario  = document.getElementById("userLogin").value;
    var password = document.getElementById("passLogin").value;

    loginSanitario(usuario, password, function (id) {
        if (!id) {
            document.getElementById("errorLogin").textContent = "Usuario o contraseña incorrectos.";
        } else {
            document.getElementById("errorLogin").textContent = "";
            idUsuarioActivo = id;
            crearConexion(idUsuarioActivo, "sanitario");
            cargarMenuPrincipal();
            cambiarSeccion("menuPrincipal");
        }
    });
}

function teclaEnterLogin(e) {
    if (e.key === "Enter") login();
}

document.getElementById("userLogin").addEventListener("keydown", teclaEnterLogin);
document.getElementById("passLogin").addEventListener("keydown", teclaEnterLogin);

function cargarRegistro() {
    document.getElementById("userRegistro").readOnly = false;
    document.getElementById("passRegistro").readOnly = false;
}

function guardarRegistro() {
    var nombre    = document.getElementById("nameRegistro").value.trim();
    var apellidos = document.getElementById("apellidosRegistro").value.trim();
    var usuario   = document.getElementById("userRegistro").value.trim();
    var password  = document.getElementById("passRegistro").value.trim();

    if (idUsuarioActivo) {
        if (!nombre || !apellidos) {
            document.getElementById("errorRegistro").textContent = "Nombre y apellidos son obligatorios.";
            return;
        }
        actualizarSanitario(idUsuarioActivo, { nombre, apellidos}, function (ok) {
            if (!ok) {
                document.getElementById("errorRegistro").textContent = "Datos inválidos.";
            } else {
                document.getElementById("errorRegistro").textContent = "";
                cargarMenuPrincipal();
                cambiarSeccion("menuPrincipal");
            }
        });
    } else {
        if (!nombre || !apellidos) {
            document.getElementById("errorRegistro").textContent = "Nombre y apellidos son obligatorios.";
            return;
        }

        var nuevoSanitario = {
            nombre : nombre,
            apellidos : apellidos,
            usuario : usuario,
            password : password
        }
        crearSanitario(nuevoSanitario, function (id) {
            if (!id) {
                document.getElementById("errorRegistro").textContent = "Usuario ya existente o datos inválidos.";
            } else {
                document.getElementById("errorRegistro").textContent = "";
                document.getElementById("userLogin").value = usuario
                document.getElementById("passLogin").value = password
                cambiarSeccion("login");
            }
        });
    }
    vaciarRegistro();
}

function cancelarRegistro() {
    document.getElementById("errorRegistro").textContent = "";
    cambiarSeccion(ultimaSeccion);
    vaciarRegistro();
}

function vaciarRegistro() {
    document.getElementById("nameRegistro").value      = "";
    document.getElementById("apellidosRegistro").value = "";
    document.getElementById("userRegistro").value      = "";
    document.getElementById("passRegistro").value      = "";
}

function cargarMenuPrincipal() {
    obtenerSanitario(idUsuarioActivo, function (sanitario) {
        document.getElementById("textoBienvenida").textContent =
            "Bienvenido/a, " + sanitario.nombre + " " + sanitario.apellidos;
    });
    cargarReservasPendientes();
    cargarReservasRealizadas();
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    return fecha.toString().slice(0, 19).replace("T", " ");
}

function cargarReservasPendientes() {
    obtenerReservas(idUsuarioActivo, function (reservas) {
        var pendientes = reservas.filter(function (r) { return !r.fecha_inicio; });
        var tbody   = document.getElementById("cuerpoTReservasP");
        var counter = document.getElementById("contadorTReservasP");
        tbody.innerHTML = "";

        if (pendientes.length === 0) {
            counter.textContent = "No hay reservas pendientes.";
            return;
        }

        var contador = 0;

        pendientes.forEach(function (r) {
            obtenerRecurso(r.recurso, function (recurso) {
                obtenerModelos(function (modelos) {
                    var modelo = modelos.find(function (m) { return m.id === recurso.modelo; });
                    obtenerCategorias(function (categorias) {
                        var categoria = categorias.find(function (c) { return c.id === (modelo ? modelo.categoria : -1); });
                        obtenerUbicaciones(function (ubicaciones) {
                            var ubicacion = ubicaciones.find(function (u) { return u.id === recurso.ubicacion; });
                            tiempoPendiente(r.recurso, function (tiempoEspera) {

                                var fila = document.createElement("tr");

                                var tdCategoria = document.createElement("td");
                                tdCategoria.textContent = categoria ? categoria.nombre : "-";

                                var tdModelo = document.createElement("td");
                                tdModelo.textContent = modelo ? modelo.nombre : "-";

                                var tdSerie = document.createElement("td");
                                tdSerie.textContent = recurso.numero_serie;

                                var tdUbicacion = document.createElement("td");
                                tdUbicacion.textContent = ubicacion ? ubicacion.nombre : "-";

                                var tdFecha = document.createElement("td");
                                tdFecha.textContent = formatearFecha(r.fecha_peticion);

                                var tdTiempo = document.createElement("td");
                                tdTiempo.textContent = tiempoEspera > 0 ? tiempoEspera + "h" : "Disponible";

                                var tdEstado = document.createElement("td");
                                if (tiempoEspera === 0) {
                                    var btnRetirar = document.createElement("button");
                                    btnRetirar.className = "btn-accion btn-iniciar";
                                    btnRetirar.textContent = "Retirar";
                                    btnRetirar.onclick = (function (id) {
                                        return function () { iniciar(id); };
                                    })(r.id);
                                    tdEstado.appendChild(btnRetirar);
                                } else {
                                 tdEstado.innerHTML = '<span class="badge badge-ocupado">No disponible</span>';
                                }

                                var tdAcciones = document.createElement("td");
                                tdAcciones.className = "td-acciones";

                                var btnCancelar = document.createElement("button");
                                btnCancelar.className = "btn-accion btn-cancelar";
                                btnCancelar.textContent = "Cancelar";
                                btnCancelar.onclick = (function (id) {
                                    return function () { cancelar(id); };
                                })(r.id);
                                tdAcciones.appendChild(btnCancelar);

                                fila.appendChild(tdCategoria);
                                fila.appendChild(tdModelo);
                                fila.appendChild(tdSerie);
                                fila.appendChild(tdUbicacion);
                                fila.appendChild(tdFecha);
                                fila.appendChild(tdTiempo);
                                fila.appendChild(tdEstado);
                                fila.appendChild(tdAcciones);

                                tbody.appendChild(fila);
                                contador++;
                                counter.textContent = "Total pendientes: " + contador;
                            });
                        });
                    });
                });
            });
        });
    });
}

function cargarReservasRealizadas() {
    obtenerReservas(idUsuarioActivo, function (reservas) {
        var realizadas = reservas.filter(function (r) { return r.fecha_inicio; });
        var tbody   = document.getElementById("cuerpoTReservasR");
        var counter = document.getElementById("contadorRecursos");
        tbody.innerHTML = "";

        if (realizadas.length === 0) {
            counter.textContent = "No hay reservas realizadas.";
            return;
        }

        var contador = 0;

        realizadas.forEach(function (r) {
            obtenerRecurso(r.recurso, function (recurso) {
                obtenerModelos(function (modelos) {
                    var modelo = modelos.find(function (m) { return m.id === recurso.modelo; });
                    obtenerCategorias(function (categorias) {
                        var categoria = categorias.find(function (c) { return c.id === (modelo ? modelo.categoria : -1); });

                        var fila = document.createElement("tr");

                        var tdCategoria = document.createElement("td");
                        tdCategoria.textContent = categoria ? categoria.nombre : "-";

                        var tdModelo = document.createElement("td");
                        tdModelo.textContent = modelo ? modelo.nombre : "-";

                        var tdSerie = document.createElement("td");
                        tdSerie.textContent = recurso.numero_serie;

                        var tdHoras = document.createElement("td");
                        tdHoras.textContent = r.horas_estimadas + "h";

                        var tdInicio = document.createElement("td");
                        tdInicio.textContent = formatearFecha(r.fecha_inicio);

                        var tdFin = document.createElement("td");
                        if (r.fecha_fin) {
                            tdFin.textContent = formatearFecha(r.fecha_fin);
                        } else {
                            tdFin.innerHTML = '<span class="badge badge-en-uso">En uso</span>';
                        }

                        var tdResenya = document.createElement("td");
                        tdResenya.className = "td-acciones";

                        if (!r.fecha_fin) {
                            var btnDevolver = document.createElement("button");
                            btnDevolver.className = "btn-accion btn-finalizar";
                            btnDevolver.textContent = "Devolver";
                            btnDevolver.onclick = (function (id) {
                                return function () { finalizar(id); };
                            })(r.id);
                            tdResenya.appendChild(btnDevolver);
                        }

                        var btnResenya = document.createElement("button");
                        btnResenya.className = "btn-accion btn-resenya";
                        btnResenya.textContent = "Reseña";
                        btnResenya.onclick = (function (id) {
                            return function () { abrirResenya(id); };
                        })(r.id);
                        tdResenya.appendChild(btnResenya);

                        fila.appendChild(tdCategoria);
                        fila.appendChild(tdModelo);
                        fila.appendChild(tdSerie);
                        fila.appendChild(tdHoras);
                        fila.appendChild(tdInicio);
                        fila.appendChild(tdFin);
                        fila.appendChild(tdResenya);

                        tbody.appendChild(fila);
                        contador++;
                        counter.textContent = "Total realizadas: " + contador;
                    });
                });
            });
        });
    });
}

function iniciar(idReserva) {
    iniciarReserva(idReserva, function (ok) {
        if (ok) {
            cargarMenuPrincipal();
        } else {
            alert("Error al retirar el recurso.");
        }
    });
}

function finalizar(idReserva) {
    finalizarReserva(idReserva, function (ok) {
        if (ok) {
            cargarMenuPrincipal();
        } else {
            alert("Error al finalizar la reserva.");
        }
    });
}

function cancelar(idReserva) {
    cancelarReserva(idReserva, function (ok) {
        if (ok) {
            cargarReservasPendientes();
        } else {
            alert("Error al cancelar la reserva.");
        }
    });
}

function cargarFiltrosReserva() {
    var selectCategoria = document.getElementById("categoriaRecurso");
    selectCategoria.innerHTML = "";
    var tiempoRecurso = document.getElementById("tiempoRecurso")
    tiempoRecurso.value = "";
    tiempoRecurso.innerHTML = "";

    var optDefault = document.createElement("option");
    optDefault.value = "0";
    optDefault.textContent = "-- Categoría --";
    optDefault.hidden = true;
    selectCategoria.appendChild(optDefault);

    obtenerCategorias(function (categorias) {
        categorias.forEach(function (cat) {
            var opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.nombre;
            selectCategoria.appendChild(opt);
        });
    });

    document.getElementById("modeloRecurso").innerHTML = "<option value=''>-- Modelo --</option>";
    document.getElementById("cuerpoTRecursos").innerHTML = "";
    document.getElementById("totalRecursos").textContent = "";
}


function filtrarModelos() {
    var selectCategoria = document.getElementById("categoriaRecurso")
    var idCategoria = parseInt(selectCategoria.value);
    var selectModelo = document.getElementById("modeloRecurso");
    selectModelo.innerHTML = "";


    if (!idCategoria) return;

    obtenerModelos(function (modelos) {
       let filtrados = modelos.filter(function (m) { 
            return m.categoria === idCategoria; })
               filtrados.forEach(function (mod) {
                    var opt = document.createElement("option");
                    opt.value = mod.id;
                    opt.textContent = mod.nombre;
                    selectModelo.appendChild(opt);
               });
    });

    document.getElementById("cuerpoTRecursos").innerHTML = "";
    document.getElementById("totalRecursos").textContent = "";
}

function buscarRecursos() {
    var idModelo = parseInt(document.getElementById("modeloRecurso").value);
    if (!idModelo) {
        alert("Selecciona un modelo.");
        return; 
    }

    obtenerRecursos(idModelo, function (recursos) {
        var tbody   = document.getElementById("cuerpoTRecursos");
        var counter = document.getElementById("totalRecursos");
        tbody.innerHTML = "";

        if (recursos.length === 0) {
            counter.textContent = "No hay recursos para ese modelo.";
            return;
        }

        var contador = 0;

        recursos.forEach(function (recurso) {
            tiempoPendiente(recurso.id, function (tiempoEspera) {
                obtenerUbicaciones(function (ubicaciones) {
                    var ubicacion = ubicaciones.find(function (u) { return u.id === recurso.ubicacion; });
                    obtenerResenyas(recurso.id, function (resenyas) {

                        var valoracionMedia = "-";
                        if (resenyas && resenyas.length > 0) {
                            var suma = resenyas.reduce(function (acc, res) { return acc + res.valor; }, 0);
                            valoracionMedia = (suma / resenyas.length).toFixed(1) + " ★";
                        }
                        
                        var fila = document.createElement("tr");

                        var tdSerie = document.createElement("td");
                        tdSerie.textContent = recurso.numero_serie;

                        var tdUbicacion = document.createElement("td");
                        tdUbicacion.textContent = ubicacion ? ubicacion.nombre : "-";

                        var tdTiempo = document.createElement("td");
                        tdTiempo.textContent = tiempoEspera > 0 ? tiempoEspera + "h" : "Disponible";

                        var tdEstado = document.createElement("td");
                        if (tiempoEspera === 0) {
                            tdEstado.innerHTML = '<span class="badge badge-disponible">Disponible</span>';
                        } else {
                            tdEstado.innerHTML = '<span class="badge badge-ocupado">Ocupado</span>';
                        }

                        var tdValoracion = document.createElement("td");
                        tdValoracion.textContent = valoracionMedia;

                        var tdAccion = document.createElement("td");
                        tdAccion.className = "td-acciones";

                        if (tiempoEspera === 0) {
                            var btnRetirar = document.createElement("button");
                            btnRetirar.className = "btn-accion btn-iniciar";
                            btnRetirar.textContent = "Retirar";
                            btnRetirar.onclick = function () {
                               hacerReserva(recurso.id)
                            }
                            tdAccion.appendChild(btnRetirar);
                        } else {
                            var btnReservar = document.createElement("button");
                            btnReservar.className = "btn-accion btn-reservar";
                            btnReservar.textContent = "Reservar";
                            btnReservar.onclick = function () {
                               hacerReserva(recurso.id); 
                            }
                            tdAccion.appendChild(btnReservar);
                        }

                        fila.appendChild(tdSerie);
                        fila.appendChild(tdUbicacion);
                        fila.appendChild(tdTiempo);
                        fila.appendChild(tdEstado);
                        fila.appendChild(tdValoracion);
                        fila.appendChild(tdAccion);

                        tbody.appendChild(fila);
                        contador++;
                        counter.textContent = "Total recursos: " + contador;
                    });
                });
            });
        });
    });
}

function hacerReserva(idRecurso) {
    var horasEstimadas = document.getElementById("tiempoRecurso").value;
    if (!horasEstimadas || horasEstimadas <= 0) {
        alert("Introduce un tiempo estimado de uso.");
        return;
    }
    reservarRecurso(idRecurso, idUsuarioActivo, horasEstimadas, function (id) {
        if (id) {
            cambiarSeccion("menuPrincipal");
            cargarMenuPrincipal();
        } else {
            alert("Error al crear la reserva.");
        }
    });
}

function abrirResenya(idReserva) {
    obtenerReservas(idUsuarioActivo, function (reservas) {
        var reserva = reservas.find(function (r) { return r.id === idReserva; });
        if (!reserva) return;
        idRecursoResenya = reserva.recurso;

        obtenerRecurso(reserva.recurso, function (recurso) {
            document.getElementById("nSeriaRecurso").textContent = recurso.numero_serie;
        });

        var selectVal = document.getElementById("valoracionResenya");
        selectVal.innerHTML = "";
        for (var i = 1; i <= 5; i++) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = "★".repeat(i) + " (" + i + ")";
            selectVal.appendChild(opt);
        }

        document.getElementById("textoResenya").value = "";
        cambiarSeccion("resenya");
    });
}

function guardarResenya() {
    var valoracion  = parseInt(document.getElementById("valoracionResenya").value);
    var descripcion = document.getElementById("textoResenya").value.trim();

    crearResenya(idRecursoResenya, idUsuarioActivo, valoracion, descripcion, function (id) {
        if (id) {
            cambiarSeccion("menuPrincipal");
        } else {
            alert("Error al guardar la reseña.");
        }
    });
}

function cancelarResenya() {
    cambiarSeccion("menuPrincipal");
}

function editarDatos() {
    obtenerSanitario(idUsuarioActivo, function (sanitario) {
        document.getElementById("nameRegistro").value        = sanitario.nombre;
        document.getElementById("apellidosRegistro").value   = sanitario.apellidos;
        document.getElementById("userRegistro").value        = "";
        document.getElementById("passRegistro").value        = "";
        document.getElementById("userRegistro").readOnly     = true;
        document.getElementById("passRegistro").readOnly     = true;
        document.getElementById("errorRegistro").textContent = "";
        cambiarSeccion("registro");
    });
}

// function cambiarArea() {
    
//     var inputcodigopostal = document.getElementById("asignararea");
//     var codigo_postal = inputcodigopostal.value.trim();

//     var confirmar = confirm("Seguro que quieres cambiar tu área de salud a " + codigo_postal);

//     if (confirmar) {
//         asignarArea(idUsuarioActivo, codigo_postal, function (correcto) {
//             console.log(correcto)
//             if (true == correcto) {
//                 alert("Actualizado");
//             } else {
//                 alert("Error actualizando");
//             }
//         });
//     }
// }

function salir() {
    idUsuarioActivo = null;
    document.getElementById("userLogin").value = "";
    document.getElementById("passLogin").value = "";
    cerrarConexion()
    cambiarSeccion("login");
}