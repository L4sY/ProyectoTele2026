
let http = require("http");
let httpServer = http.createServer();

var datosServidor = require("./datos.js")



let WebSocketServer = require("websocket").server;
let wsServer = new WebSocketServer({
    httpServer: httpServer
});

var datosServidor = require('./datos.js');
const console = require("console");
var sanitarios=datosServidor.san
var gestores = datosServidor.gest
var ubicaciones = datosServidor.ubic
var categorias = datosServidor.cate
var modelos = datosServidor.mod
var recursos = datosServidor.rec
var reservas = datosServidor.reservas
var reseynas = datosServidor.resenyas

let puerto = 4444;
httpServer.listen(puerto, function () {
    console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});

let usuarios = [];


wsServer.on('request', function(request){
    let connection = request.accept("saludos", request.origin);
    let usuario = {
        connection: connection,
        id: null,
        rol: null
    };
    usuarios.push(usuario);
    console.log('Usuario conectado: '+usuarios.length+' en linea');
    connection.on("message", function(mensaje){
        if (mensaje.type === "utf8"){
            console.log("Mensaje recibido con exito: " + mensaje.utf8Data);
            let msj = JSON.parse(mensaje.utf8Data);
            switch (msj.operacion) {
                case "identificar":
                    usuario.rol = msj.rol;
                    usuario.id  = msj.id; 
                    console.log("Usuario identificado:", msj.rol, msj.id);
                    break;
                case "nuevoRecurso":
                    notificarNuevoRecurso(msj.categoria, msj.modelo, msj.num_serie, msj.gestor)
                    console.log("Nuevo recurso creado")
                    break;
                
                case "nuevoResenya":
                    notificarNuevaResenya(msj.recurso, msj.valoracion, msj.valoracion, msj.descripcion)
                    console.log("Nueva reseña creada");
                    break;

                case "cambioReserva":
                    notificarCambioReserva(msj.estado, msj.idReserva, msj.sanitario);
                    console.log("Ha habido un cambio en una reserva")
                    break;

                case "notificarInformacion":
                    notificarInformacion(msj.idResena, msj.gestor)
                    console.log("Reunion concertada")
            
                default:
                    console.log("PROCESO NO DETECTADO")
                    break;
            }
        }
    })

    connection.on("close", function(){
        console.log("Usuario desconectado: " + usuario.rol + " con id " + usuario.id);
        usuarios.forEach(function(u){
            if (u === usuario){
                usuarios.splice(usuarios.indexOf(u),1)
            }
        })
    })
})

function notificarNuevaResenya(idRecurso, valoracion, idSanitario, descripcion){
   let gestores = obtenerGestores();

    let recurso = obtenerRecurso(idRecurso);
    let modelo = modelos.find(function(m){ return m.id == recurso.modelo });
    let categoria = categorias.find(function(c){ return c.id == modelo.categoria });
    var sanitario = sanitarios.find(function(s){ return s.id == idSanitario });
    var nombreSanitario = sanitario ? sanitario.nombre + " " + sanitario.apellidos : idSanitario;

    gestores.forEach(function(g){
        g.connection.sendUTF(JSON.stringify({
            operacion: "nuevaResenya",
            categoria: categoria.nombre,
            modelo: modelo.nombre,
            num_serie: recurso.numero_serie,
            puntuacion: valoracion,
            sanitario: nombreSanitario,
            descripcion: descripcion
        }))
    })
}


function notificarNuevoRecurso(categoria, modelo, num_serie, idGestor, idRecurso){
    var sanitarios = obtenerSanitarios();
    var recurso = recursos.find(function(r){ return r.id == idRecurso});
    var modelo = modelos.find(function(m){ return m.id == recurso.modelo });
    var categoria = categorias.find(function(c){ return c.id == modelo.categoria });
    var gestor = gestores.find(function(g){ return g.id == idGestor });
    var nombreGestor = gestor ? gestor.nombre + " " + gestor.apellidos : idGestor;

    console.log("idGestor recibido:", idGestor);
console.log("gestores array:", gestores);
console.log("gestor encontrado:", gestor);

    sanitarios.forEach(function(s){
        s.connection.sendUTF(JSON.stringify({
            operacion: "nuevoRecurso",
            categoria: categoria.nombre,
            modelo: modelo.nombre,
            num_serie: num_serie,
            gestor: nombreGestor
        }))
    })
}

function notificarCambioReserva(estado, idReserva, idSanitario){
    var reserva = reservas.find(function(r){
        return r.id == idReserva;
    });

    if (!reserva) return;

    var recurso = recursos.find(function(r){
        return r.id == reserva.recurso;
    });

    var modelo = modelos.find(function(m){
         return m.id == recurso.modelo 
        });

    var categoria = categorias.find(function(c){
         return c.id == modelo.categoria 
        });
    
    var sanitario = sanitarios.find(function(s){
         return s.id == idSanitario 
        });

    var nombreSanitario = sanitario ? sanitario.nombre + " " + sanitario.apellidos : idSanitario;

    // Sanitarios con reserva activa (no finalizada) del mismo recurso
    var reservasActivas = reservas.filter(function(r){
        return r.recurso == reserva.recurso && !r.fecha_fin;
    });

    reservasActivas.forEach(function(r){
        var usuarioWS = usuarios.find(function(u){
            return u.id == r.sanitario && u.rol == "sanitario";
        });
        if (usuarioWS){
            usuarioWS.connection.sendUTF(JSON.stringify({
                operacion: "cambioReserva",
                categoria: categoria.nombre,
                modelo: modelo.nombre,
                num_serie: recurso.numero_serie,
                sanitario: nombreSanitario,
                estado: estado
            }));
        }
    });
}

function notificarInformacion(idResenya, idGestor){
    var resena = reseynas.find(function(r){
        return r.id == idResenya;
    })

    var gestor = gestores.find(function(g){ return g.id == idGestor });
    var nombreGestor = gestor ? gestor.nombre + " " + gestor.apellidos : idGestor;

    var sanitarioResena = usuarios.find(function(u){
        return u.id == resena.sanitario && u.rol == "sanitario"
    })

    if (sanitarioResena){
        sanitarioResena.connection.sendUTF(JSON.stringify({
            operacion: "notificarInformacion",
            idResena: idResenya,
            gestor: nombreGestor
        }));
    }
}

//Funciones auxiliares
function obtenerGestores(){
    var gestores = usuarios.filter(function(u){
        return u.rol == "gestor"
    })
    return gestores
}

function obtenerSanitarios(){
    var sanitarios = usuarios.filter(function(u){
        return u.rol == "sanitario"
    })
    return sanitarios
}

function obtenerRecurso(idRecurso){
        var recurso = recursos.find(function(r){
        return idRecurso == r.id
    })
    return recurso
}

module.exports = {notificarCambioReserva, notificarNuevaResenya, notificarNuevoRecurso}