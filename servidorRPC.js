var rpc = require("./rpc.js");
let ws = require("./servidorWS.js")
var datosServidor = require("./datos.js")

var sanitarios  = datosServidor.san
var gestores    = datosServidor.gest
var ubicaciones = datosServidor.ubic
var categoria   = datosServidor.cate
var modelos     = datosServidor.mod
var recursos    = datosServidor.rec
var reservas    = datosServidor.reservas
var reseynas    = datosServidor.resenyas

var siguienteIDSanitario = 5;
var siguienteIDResenya   = 4;
var siguienteIDReserva   = 4;
let idUsuario = null;

console.log("Servidor iniciado correctamente");
console.log("===========SANITARIOS============")
console.log(sanitarios[0].usuario)
console.log(sanitarios[0].password)
console.log("---------------------------------")
console.log(sanitarios[1].usuario)
console.log(sanitarios[1].password)

// CAMBIO: función auxiliar para fecha local en formato "YYYY-MM-DD HH:MM:SS"
function fechaLocal() {
    return new Date().toLocaleString("sv-SE");
}

function obtenerCategorias(callback) {
    return callback(categoria);
}

function obtenerModelos(callback) {
    return callback(modelos);
}

function obtenerUbicaciones(callback) {
    return callback(ubicaciones);
}

function loginSanitario(usuario, password, callback) {
    let indiceLogin = sanitarios.findIndex(function (sanitario) {
        return usuario == sanitario.usuario;
    });

    if (indiceLogin == -1 || sanitarios[indiceLogin].password != password) {
        return callback(null);
    } else {
        return callback(sanitarios[indiceLogin].id);
    }
}

function crearSanitario(datosSanitario, callback) {
    var { nombre, apellidos, usuario, password } = datosSanitario;
    var repetido = sanitarios.some(function (sanitario) {
        return sanitario.usuario == usuario;
    });
    if (!nombre || !apellidos || !usuario || !password || repetido) {
        return callback(null);
    } else {
        var sanitarioNuevo = {
            id: siguienteIDSanitario,
            nombre,
            apellidos,
            usuario,
            password
        };
        sanitarios.push(sanitarioNuevo);
        siguienteIDSanitario++;
        return callback(sanitarioNuevo.id);        
    }
}

function actualizarSanitario(idSanitario, datosSanitario, callback) {
    var { nombre, apellidos} = datosSanitario;

    if (!nombre || !apellidos) {
        return callback(null);
    }

    var indice = sanitarios.findIndex(function (s) {
        return s.id == idSanitario;
    });

    if (indice == -1) return callback(null);

    sanitarios[indice].nombre    = nombre;
    sanitarios[indice].apellidos = apellidos;

    return callback(sanitarios[indice]);
}

function obtenerSanitario(idSanitario, callback) {
    let sanitario = sanitarios.find(function (sanitarioBuscado) {
        return idSanitario == sanitarioBuscado.id;
    });

    if (!sanitario) return callback(null);

    var { password, ...sanitarioSinPassword } = sanitario; 
    return callback(sanitarioSinPassword);
}

function obtenerRecursos(idModelo, callback) {
    let arrayRecursos = recursos.filter(function (recurso) {
        return idModelo == recurso.modelo && recurso.estado === 0; 
    });
    return callback(arrayRecursos);
}

var servidor = rpc.server();
var app = servidor.createApp("gestion_pacientes");

function tiempoPendiente(idRecurso, callback) {
    let tiempoEspera = 0;

    let cola = reservas.filter(function (r) {
        return r.recurso == idRecurso && !r.fecha_fin;
    });

    cola.forEach(function (r) {
        if (r.fecha_inicio) {
            tiempoEspera += Number(r.horas_estimadas);
        }
    });

    return callback(tiempoEspera);
}

function obtenerReservas(idSanitario, callback) {
    let reservasSanitario = reservas.filter(function (r) {
        return r.sanitario == idSanitario;
    });
    return callback(reservasSanitario);
}

function obtenerResenyas(idRecurso, callback) {
    let resenyasRecurso = reseynas.filter(function (r) {
        return r.recurso == idRecurso;
    });
    return callback(resenyasRecurso);
}

function crearResenya(idRecurso, idSanitario, valoracion, descripcion, callback) {
    let nuevaResenya = {
        id:          siguienteIDResenya,
        recurso:     idRecurso,
        sanitario:   idSanitario,
        fecha:       fechaLocal(),           
        valor:       valoracion,
        descripcion: descripcion
    };
    reseynas.push(nuevaResenya);
    siguienteIDResenya++;
    ws.notificarNuevaResenya(idRecurso, valoracion, idSanitario, descripcion) //IMPORTAR METODO
    return callback(nuevaResenya.id);
}

function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback) {
    
    if (!horasEstimadas){
        return callback(null)
    }
    let nuevaReserva = {
        id:              siguienteIDReserva,
        recurso:         idRecurso,
        sanitario:       idSanitario,
        horas_estimadas: horasEstimadas,
        fecha_peticion:  fechaLocal(),          
        fecha_inicio:    null,
        fecha_fin:       null
    };
    reservas.push(nuevaReserva);
    siguienteIDReserva++;
    return callback(nuevaReserva.id);
}

function cancelarReserva(idReserva, callback) {
    let indexReserva = reservas.findIndex(function (r) {
        return idReserva == r.id;
    });

    if (indexReserva != -1) {
        reservas.splice(indexReserva, 1);
        return callback(true);
    } else {
        return callback(false);
    }
}

function iniciarReserva(idReserva, callback) {
    let reservaBuscada = reservas.findIndex(function (r) {
        return idReserva == r.id;
    });

    let reserva = reservas.find(function(r){ return r.id == idReserva})
    

    if (reservaBuscada == -1) {                             
        return callback(false);
    } else {
        reservas[reservaBuscada].fecha_inicio = fechaLocal(); 
        ws.notificarCambioReserva("inicio", idReserva, reserva.sanitario)
        return callback(true);
    }
}

function finalizarReserva(idReserva, callback) {
    let reservaBuscada = reservas.findIndex(function (r) {
        return idReserva == r.id;
    });

    let reserva = reservas[reservaBuscada];

    if (reservaBuscada == -1) {                             
        return callback(false);
    } else {
        reservas[reservaBuscada].fecha_fin = fechaLocal(); 
        ws.notificarCambioReserva("fin",reserva.id, reserva.sanitario)   
        return callback(true);
    }
}

function obtenerRecurso(idRecurso, callback) {
    let recurso = recursos.find(function (r) {
        return idRecurso == r.id;
    });
    return callback(recurso);
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