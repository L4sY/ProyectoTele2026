function formatearFecha(fecha) {
    if (!fecha) return "-";
    var d = new Date(fecha);
    return d.toLocaleString("es-ES");
}

var usuarios = [];
var conexion = null;

function crearConexion(id, rol) {
    conexion = new WebSocket("ws://localhost:4444", "saludos");
    
    conexion.addEventListener("open", function() {
        conexion.send(JSON.stringify({
            operacion: "identificar",
            id: id,
            rol: rol
        }));

        var tabla = document.getElementById("cuerpoTAvisos");

        conexion.addEventListener("message", function(msj) {
            console.log("Mensaje recibido del servidor:", msj.data);
            msj = JSON.parse(msj.data);

            switch (msj.operacion) {
                case "identificar":{
                    alert("Gestor con id " + id + " conectado");
                    break;
                }

                case "nuevaResenya":{
                    var ahora = new Date();
                    var texto = "SE HA CREADO UNA RESEÑA PARA EL " + msj.categoria + " MODELO " + msj.modelo + " CON UN CODIGO " + msj.num_serie + " Y PUNTUACION " + msj.puntuacion;
                    
                    var fila = document.createElement("tr");
                    fila.style.backgroundColor = "lightgreen";

                    var tdFecha = document.createElement("td");
                    tdFecha.innerText = formatearFecha(ahora);

                    var tdSanitario = document.createElement("td");
                    tdSanitario.innerText = msj.sanitario;

                    var tdTexto = document.createElement("td");
                    tdTexto.innerText = texto;

                    fila.appendChild(tdFecha);
                    fila.appendChild(tdSanitario);
                    fila.appendChild(tdTexto);
                    tabla.appendChild(fila);
                    break;
                }

                case "nuevoRecurso":{
                    var ahora = new Date();
                    var texto = "SE HA CREADO UN NUEVO RECURSO " + msj.categoria + " MODELO " + msj.modelo + " CON CODIGO " + msj.num_serie;
                    
                    var fila = document.createElement("tr");
                    fila.style.backgroundColor = "lightblue";

                    var tdFecha = document.createElement("td");
                    tdFecha.innerText = formatearFecha(ahora);

                    var tdGestor = document.createElement("td");
                    tdGestor.innerText = msj.gestor;

                    var tdTexto = document.createElement("td");
                    tdTexto.innerText = texto;

                    fila.appendChild(tdFecha);
                    fila.appendChild(tdGestor);
                    fila.appendChild(tdTexto);
                    tabla.appendChild(fila);
                    break;
                }

                case "cambioReserva":{
                    var ahora = new Date();
                    var texto;

                    if (msj.estado == "inicio"){
                        texto = "SE HA INICIADO LA RESERVA DEL " + msj.categoria + " MODELO " + msj.modelo + " CON CODIGO " + msj.num_serie;
                    } else if (msj.estado == "fin"){
                        texto = "SE HA FINALIZADO LA RESERVA DEL " + msj.categoria + " MODELO " + msj.modelo + " CON CODIGO " + msj.num_serie;
                    }
                    
                    var fila = document.createElement("tr");
                    fila.style.backgroundColor = "lightcoral";

                    var tdFecha = document.createElement("td");
                    tdFecha.innerText = formatearFecha(ahora);

                    var tdSanitario = document.createElement("td");
                    tdSanitario.innerText = msj.sanitario;

                    var tdTexto = document.createElement("td");
                    tdTexto.innerText = texto;

                    fila.appendChild(tdFecha);
                    fila.appendChild(tdSanitario);
                    fila.appendChild(tdTexto);
                    tabla.appendChild(fila);
                    break;
                }

                case "notificarInformacion":{
                    var ahora = new Date();
                    var texto;

                    texto = "CONCERTAR LA REVISION DE LA RESEÑA CON EL GESTOR CORRESPONDIENTE"
                    
                    var fila = document.createElement("tr");
                    fila.style.backgroundColor = "pink";

                    var tdFecha = document.createElement("td");
                    tdFecha.innerText = formatearFecha(ahora);

                    var tdGestor = document.createElement("td");
                    tdGestor.innerText = msj.gestor;

                    var tdTexto = document.createElement("td");
                    tdTexto.innerText = texto;

                    fila.appendChild(tdFecha);
                    fila.appendChild(tdGestor);
                    fila.appendChild(tdTexto);
                    tabla.appendChild(fila);
                    break;
                }
            } 
        }); 
    });
}

function notificarInformacion(idResena, idGestor){
    conexion.send(JSON.stringify({
            operacion: "notificarInformacion",
            idResena: idResena,
            gestor: idGestor
        }))
}

function cerrarConexion(){
    if (conexion) {
        conexion.close();
        conexion = null;
        document.getElementById("cuerpoTAvisos").innerHTML = "" 
    }
}