var rpc = require("./rpc.js");
// let ws = require("./servidorWS.js")

var conexionBD = require("./conexion_mysql.js");


rpc.debug = true

var servidor = rpc.server();
var app = servidor.createApp("gestion_pacientes");

let idUsuario = null;

// console.log("Servidor iniciado correctamente");
// console.log("===========SANITARIOS============")
// console.log(sanitarios[0].usuario)
// console.log(sanitarios[0].password)
// console.log("---------------------------------")
// console.log(sanitarios[1].usuario)
// console.log(sanitarios[1].password)

// CAMBIO: función auxiliar para fecha local en formato "YYYY-MM-DD HH:MM:SS"
function fechaLocal() {
    return new Date().toLocaleString("sv-SE");
}

function obtenerCategorias(callback) {
    conexionBD.query("SELECT * FROM categorias", function (error, datos) {
        if (error) {
            console.log("Error obtenerCategorias:", error);
            return callback(null);
        }
        return callback(datos);
    });
}
 
function obtenerModelos(callback) {
    conexionBD.query("SELECT * FROM modelos", function (error, datos) {
        if (error) {
            console.log("Error obtenerModelos:", error);
            return callback(null);
        }
        return callback(datos);
    });
}
 
function obtenerUbicaciones(callback) {
    conexionBD.query("SELECT * FROM ubicaciones", function (error, datos) {
        if (error) {
            console.log("Error obtenerUbicaciones:", error);
            return callback(null);
        }
        return callback(datos);
    });
}

function loginSanitario(usuario, password, callback) {

    conexionBD.query("SELECT id FROM sanitarios WHERE usuario = ? AND password = ?",
        [usuario, password],
        function(error,datos){
        if (error){
            console.log("Error en el login:"+error)
            return callback(null);
        } else if (datos.length == 0){
            console.log("Sanitario no encontrado")
            return callback(null) 
        } else {
            return callback(datos[0].id)
        }
    })
}

function crearSanitario(datosSanitario, callback) {
    var { nombre, apellidos, usuario, password } = datosSanitario;
    if (!nombre || !apellidos || !usuario || !password) {
        return callback(null);
    }

    conexionBD.query("SELECT id FROM sanitarios WHERE usuario = ?", [usuario],
        function (error, datos) {
            if (error) {
                console.log("Error crearSanitario (comprobación):", error);
                return callback(null);
            }
            if (datos.length > 0) {
                return callback(null); // usuario repetido
            }
            conexionBD.query(
                "INSERT INTO sanitarios (nombre, apellidos, usuario, password) VALUES (?, ?, ?, ?)",
                [nombre, apellidos, usuario, password],
                function (error, resultado) {
                    if (error) {
                        console.log("Error al crear sanitario:", error);
                        return callback(null);
                    }
                    return callback(resultado.insertId);
                }
            );
        }
    );
}

function actualizarSanitario(idSanitario, datosSanitario, callback) {
    var { nombre, apellidos } = datosSanitario;
    if (!nombre || !apellidos) {
        return callback(null);
    }

    conexionBD.query("UPDATE sanitarios SET nombre = ?, apellidos = ? WHERE id = ?",
        [nombre, apellidos, idSanitario],
        function (error, resultado) {
            if (error) {
                console.log("Error al actualizar el sanitario:", error);
                return callback(null);
            }
            if (resultado.affectedRows == 0) {
                return callback(null); // no existe
            }
            conexionBD.query("SELECT id, nombre, apellidos FROM sanitarios WHERE id = ?",
                [idSanitario],
                function (error, datos) {
                    if (error || datos.length == 0) {
                        console.log("Error mostrando los datos del sanitario:", error);
                        return callback(null);
                    }
                    return callback(datos[0]);
                }
            );
        }
    );
}

function obtenerSanitario(idSanitario, callback) {
    conexionBD.query("SELECT id, nombre, apellidos FROM sanitarios WHERE id = ?",
        [idSanitario],
        function(error,datos){
        if (error){
            callback(null);
        } else {
            if (datos.length == 0) {
                callback(null);
            } else {
                callback(datos[0])
            }
        }
    })
}

function obtenerRecursos(idModelo, callback) {
    conexionBD.query("SELECT * FROM recursos WHERE modelo = ? AND estado = 0",
        [idModelo],
        function (error, datos) {
            if (error) {
                console.log("Error obtenerRecursos:", error);
                return callback(null);
            }
            return callback(datos);
        }
    );
}

function tiempoPendiente(idRecurso, callback) {
    conexionBD.query("SELECT COALESCE(SUM(horas_estimadas), 0) AS tiempoEspera FROM reservas " +
        "WHERE recurso = ? AND fecha_fin IS NULL AND fecha_inicio IS NOT NULL",
        [idRecurso],
        function (error, datos) {
            if (error) {
                console.log("Error tiempoPendiente:", error);
                return callback(null);
            }
            return callback(Number(datos[0].tiempoEspera));
        }
    );
}

function obtenerReservas(idSanitario, callback) {
    conexionBD.query("SELECT * FROM reservas WHERE sanitario = ?",
        [idSanitario],
        function (error, datos) {
            if (error) {
                console.log("Error obtenerReservas:", error);
                return callback(null);
            }
            return callback(datos);
        }
    );
}

function obtenerResenyas(idRecurso, callback) {
    conexionBD.query("SELECT * FROM resenyas WHERE recurso = ?",
        [idRecurso],
        function (error, datos) {
            if (error) {
                console.log("Error obtenerResenyas:", error);
                return callback(null);
            }
            return callback(datos);
        }
    );
}

function crearResenya(idRecurso, idSanitario, valoracion, descripcion, callback) {
    var fecha = fechaLocal();
 
    conexionBD.query(
        "INSERT INTO resenyas (recurso, sanitario, fecha, valor, descripcion) VALUES (?, ?, ?, ?, ?)",
        [idRecurso, idSanitario, fecha, valoracion, descripcion],
        function (error, resultado) {
            if (error) {
                console.log("Error crearResenya:", error);
                return callback(null);
            }
            // ws.notificarNuevaResenya(idRecurso, valoracion, idSanitario, descripcion);
            return callback(resultado.insertId);
        }
    );
}
 
function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback) {
    if (!horasEstimadas) {
        return callback(null);
    }
 
    var fechaPeticion = fechaLocal();
 
    conexionBD.query("INSERT INTO reservas (recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin) " +
        "VALUES (?, ?, ?, ?, NULL, NULL)",
        [idRecurso, idSanitario, horasEstimadas, fechaPeticion],
        function (error, resultado) {
            if (error) {
                console.log("Error reservarRecurso:", error);
                return callback(null);
            }
            return callback(resultado.insertId);
        }
    );
}
 
function cancelarReserva(idReserva, callback) {
    conexionBD.query("DELETE FROM reservas WHERE id = ?",
        [idReserva],
        function (error, resultado) {
            if (error) {
                console.log("Error cancelarReserva:", error);
                return callback(false);
            }
            return callback(resultado.affectedRows > 0);
        }
    );
}
 
function iniciarReserva(idReserva, callback) {
    // Necesitamos el sanitario de la reserva para la notificación WS,
    // así que primero consultamos y luego actualizamos.
    conexionBD.query("SELECT sanitario FROM reservas WHERE id = ?",
        [idReserva],
        function (error, datos) {
            if (error || datos.length == 0) {
                if (error) console.log("Error iniciarReserva (select):", error);
                return callback(false);
            }
 
            var idSanitarioReserva = datos[0].sanitario;
            var fechaInicio = fechaLocal();
 
            conexionBD.query("UPDATE reservas SET fecha_inicio = ? WHERE id = ?",
                [fechaInicio, idReserva],
                function (error, resultado) {
                    if (error || resultado.affectedRows == 0) {
                        if (error) console.log("Error iniciarReserva (update):", error);
                        return callback(false);
                    }
                    // ws.notificarCambioReserva("inicio", idReserva, idSanitarioReserva);
                    return callback(true);
                }
            );
        }
    );
}
 
function finalizarReserva(idReserva, callback) {
    conexionBD.query("SELECT sanitario FROM reservas WHERE id = ?",
        [idReserva],
        function (error, datos) {
            if (error || datos.length == 0) {
                if (error) console.log("Error finalizarReserva (select):", error);
                return callback(false);
            }
 
            var idSanitarioReserva = datos[0].sanitario;
            var fechaFin = fechaLocal();
 
            conexionBD.query("UPDATE reservas SET fecha_fin = ? WHERE id = ?",
                [fechaFin, idReserva],
                function (error, resultado) {
                    if (error || resultado.affectedRows == 0) {
                        if (error) console.log("Error finalizarReserva (update):", error);
                        return callback(false);
                    }
                    // ws.notificarCambioReserva("fin", idReserva, idSanitarioReserva);
                    return callback(true);
                }
            );
        }
    );
}
 
function obtenerRecurso(idRecurso, callback) {
    conexionBD.query("SELECT * FROM recursos WHERE id = ?",
        [idRecurso],
        function (error, datos) {
            if (error) {
                console.log("Error obtenerRecurso:", error);
                return callback(null);
            }
            if (datos.length == 0) {
                return callback(null);
            }
            return callback(datos[0]);
        }
    );
}

app.registerAsync(obtenerCategorias);
app.registerAsync(obtenerModelos);
app.registerAsync(obtenerUbicaciones);
app.registerAsync(loginSanitario);
app.registerAsync(crearSanitario);
app.registerAsync(actualizarSanitario);
app.registerAsync(obtenerSanitario);
app.registerAsync(obtenerRecursos);
app.registerAsync(tiempoPendiente);
app.registerAsync(obtenerReservas);
app.registerAsync(obtenerResenyas);
app.registerAsync(crearResenya);
app.registerAsync(reservarRecurso);
app.registerAsync(cancelarReserva);
app.registerAsync(iniciarReserva);
app.registerAsync(finalizarReserva);
app.registerAsync(obtenerRecurso);