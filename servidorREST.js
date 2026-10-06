//Requerimos express y lo añadimos a una variable
var express = require("express");
var app = express();
// var ws = require("./servidorWS.js");
var conexionBD = require("./conexion_mysql.js");

var datosServidor = require('./datos.js');
const conexion = require("./conexion_mysql.js");
var gestores = datosServidor.gest


// console.log("==========GESTORES==============")
// console.log(gestores[0].usuario);
// console.log(gestores[0].password);
// console.log("---------------------------------")
// console.log(gestores[1].usuario);
// console.log(gestores[1].password);

app.use("/appCliente", express.static("cliente"));
app.use(express.static("."));
app.use(express.json());

function fechaLocal() {
    return new Date().toLocaleString("sv-SE");
}

//Obtener array ubicaciones
app.get("/api/ubicaciones", function (req, res) {
    conexionBD.query("SELECT * FROM ubicaciones", function (error, datos) {
        if (error) {
            console.log("Error GET /api/ubicaciones:", error);
            return res.status(500).json("Error en el servidor");
        }
        return res.status(200).json(datos);
    });
});

//Obtener array categorias
app.get("/api/categorias", function (req, res) {
    conexionBD.query("SELECT * FROM categorias", function (error, datos) {
        if (error) {
            console.log("Error GET /api/categorias:", error);
            return res.status(500).json("Error en el servidor");
        }
        return res.status(200).json(datos);
    });
});

//Obtener array modelos
app.get("/api/modelos", function (req, res) {
    conexionBD.query("SELECT * FROM modelos", function (error, datos) {
        if (error) {
            console.log("Error GET /api/modelos:", error);
            return res.status(500).json("Error en el servidor");
        }
        return res.status(200).json(datos);
    });
});

app.post("/api/gestores/login", function (req, res) {
    var loginG = req.body.usuario;
    var contraseña = req.body.password;

    conexionBD.query(
        "SELECT id FROM gestores WHERE usuario = ? AND password = ?",
        [loginG, contraseña],
        function (error, datos) {
            if (error) {
                console.log("Error POST /api/gestores/login:", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datos.length == 0) {
                return res.status(403).json("Usuario y contraseña incorrectos, vuelva a intentarlo");
            }
            return res.status(200).json(datos[0].id);
        }
    );
});

app.post("/api/gestores", function (req, res) {
    //Usar estos nombres para el body de la peticion
    var { nombre, apellidos, usuario, password } = req.body;

    conexionBD.query(
        "SELECT id FROM gestores WHERE usuario = ?",
        [usuario],
        function (error, datos) {
            if (error) {
                console.log("Error POST /api/gestores (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datos.length > 0) {
                return res.status(409).json("El nombre de usuario: " + usuario + " ya esta en uso ");
            }

            conexionBD.query(
                "INSERT INTO gestores (nombre, apellidos, usuario, password) VALUES (?, ?, ?, ?)",
                [nombre, apellidos, usuario, password],
                function (error, resultado) {
                    if (error) {
                        console.log("Error POST /api/gestores (insert):", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    console.log("Usuario creado correctamente " + resultado[0])
                    return res.status(201).json("Gestor "+usuario+" creado correctamente");
                }
            );
        }
    );
});

app.put("/api/gestores/:id", function (req, res) {
    var idGestor = req.params.id;
    var { nombre, apellidos, usuario, password } = req.body;

    conexionBD.query(
        "SELECT id FROM gestores WHERE usuario = ? AND id != ?",
        [usuario, idGestor],
        function (error, datosDuplicado) {
            if (error) {
                console.log("Error PUT /api/gestores (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datosDuplicado.length > 0) {
                return res.status(409).json("El usuario ya esta en uso");
            }

            conexionBD.query(
                "UPDATE gestores SET nombre = ?, apellidos = ?, usuario = ?, password = ? WHERE id = ?",
                [nombre, apellidos, usuario, password, idGestor],
                function (error, resultado) {
                    if (error) {
                        console.log("Error PUT /api/gestores (update):", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    if (resultado.affectedRows == 0) {
                        return res.status(404).json("No existe un gestor con el codigo " + idGestor);
                    }
                    return res.status(200).json("Datos del gestor actualizados correctamente");
                }
            );
        }
    );
});

app.get("/api/gestores/:id", function (req, res) {
    var idGestor = req.params.id;

    conexionBD.query(
        "SELECT id, nombre, apellidos, usuario FROM gestores WHERE id = ?",
        [idGestor],
        function (error, datos) {
            if (error) {
                console.log("Error GET /api/gestores/:id:", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datos.length == 0) {
                return res.status(404).json("No existe un gestor con el codigo " + idGestor);
            }
            return res.status(200).json(datos[0]);
        }
    );
});

app.get("/api/sanitarios/:id", function (req, res) {
    var idSanitario = req.params.id;

    conexionBD.query(
        "SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = ?",
        [idSanitario],
        function (error, datos) {
            if (error) {
                console.log("Error GET /api/sanitarios/:id:", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datos.length == 0) {
                return res.status(404).json("No existe un sanitario con el codigo " + idSanitario);
            }
            return res.status(200).json(datos[0]);
        }
    );
});

app.get("/api/recursos", function (req, res) {
    var { categoria, modelo, ubicacion, estado } = req.query;

    var sql = "SELECT recursos.* FROM recursos";
    var condiciones = [];
    var valores = [];

    if (categoria) {
        sql += " INNER JOIN modelos ON recursos.modelo = modelos.id";
        condiciones.push("modelos.categoria = ?");
        valores.push(categoria);
    }
    if (modelo) {
        condiciones.push("recursos.modelo = ?");
        valores.push(modelo);
    }
    if (ubicacion) {
        condiciones.push("recursos.ubicacion = ?");
        valores.push(ubicacion);
    }
    if (estado) {
        condiciones.push("recursos.estado = ?");
        valores.push(estado);
    }

    if (condiciones.length > 0) {
        sql += " WHERE " + condiciones.join(" AND ");
    }

    conexionBD.query(sql, valores, function (error, datos) {
        if (error) {
            console.log("Error GET /api/recursos:", error);
            return res.status(500).json("Error en el servidor");
        }
        return res.status(200).json(datos);
    });
});

app.get("/api/recursos/:id", function (req, res) {
    var idRecurso = req.params.id;

    conexionBD.query(
        "SELECT * FROM recursos WHERE id = ?",
        [idRecurso],
        function (error, datos) {
            if (error) {
                console.log("Error GET /api/recursos/:id:", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datos.length == 0) {
                return res.status(404).json("Recurso no encontrado");
            }
            return res.status(200).json(datos[0]);
        }
    );
});

app.post("/api/recursos", function (req, res) {
    var { categoria, modelo, numSerie, ubicacion, estado, idGestor } = req.body;

    conexionBD.query(
        "SELECT id FROM recursos WHERE numero_serie = ?",
        [numSerie],
        function (error, datosDuplicado) {
            if (error) {
                console.log("Error POST /api/recursos (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datosDuplicado.length > 0) {
                return res.status(409).json("Numero de serie: " + numSerie + " ya en uso");
            }

            conexionBD.query(
                "INSERT INTO recursos (modelo, ubicacion, numero_serie, estado) VALUES (?, ?, ?, ?)",
                [modelo, ubicacion, numSerie, estado],
                function (error, resultado) {
                    if (error) {
                        console.log("Error POST /api/recursos (insert):", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    res.status(200).json("Nuevo recurso creado con id: " + resultado.insertId);
                    // ws.notificarNuevoRecurso(categoria, modelo, numSerie, idGestor, resultado.insertId);
                }
            );
        }
    );
});

app.put("/api/recursos/:id", function (req, res) {
    var idRecurso = req.params.id;
    var { modelo, numero_serie, ubicacion, estado } = req.body;

    conexionBD.query(
        "SELECT id FROM recursos WHERE numero_serie = ? AND id != ?",
        [numero_serie, idRecurso],
        function (error, datosDuplicado) {
            if (error) {
                console.log("Error PUT /api/recursos (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datosDuplicado.length > 0) {
                return res.status(409).json("Numero de serie ya en uso");
            }

            conexionBD.query(
                "UPDATE recursos SET modelo = ?, numero_serie = ?, ubicacion = ?, estado = ? WHERE id = ?",
                [modelo, numero_serie, ubicacion, estado, idRecurso],
                function (error, resultado) {
                    if (error) {
                        console.log("Error PUT /api/recursos (update):", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    if (resultado.affectedRows == 0) {
                        return res.status(404).json("Recurso no encontrado");
                    }
                    return res.status(201).json("Recurso actualizado correctamente");
                }
            );
        }
    );
});

app.delete("/api/recursos/:id", function (req, res) {
    var idRecurso = req.params.id;

    conexionBD.query(
        "DELETE FROM recursos WHERE id = ?",
        [idRecurso],
        function (error, resultado) {
            if (error) {
                console.log("Error DELETE /api/recursos/:id:", error);
                return res.status(500).json("Error en el servidor");
            }
            if (resultado.affectedRows == 0) {
                return res.status(404).json("Recurso no encontrado");
            }
            return res.status(200).json("Recurso borrado correctamente");
        }
    );
});

app.get("/api/recursos/:id/reservas", function (req, res) {
    var idRecurso = req.params.id;

    conexionBD.query(
        "SELECT id FROM recursos WHERE id = ?",
        [idRecurso],
        function (error, datosRecurso) {
            if (error) {
                console.log("Error GET /api/recursos/:id/reservas (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datosRecurso.length == 0) {
                return res.status(404).json("Recurso no encontrado");
            }

            conexionBD.query(
                "SELECT * FROM reservas WHERE recurso = ?",
                [idRecurso],
                function (error, datos) {
                    if (error) {
                        console.log("Error GET /api/recursos/:id/reservas:", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    return res.status(200).json(datos);
                }
            );
        }
    );
});

app.get("/api/recursos/:id/resenyas", function (req, res) {
    var idRecurso = req.params.id;

    conexionBD.query(
        "SELECT id FROM recursos WHERE id = ?",
        [idRecurso],
        function (error, datosRecurso) {
            if (error) {
                console.log("Error GET /api/recursos/:id/resenyas (comprobación):", error);
                return res.status(500).json("Error en el servidor");
            }
            if (datosRecurso.length == 0) {
                return res.status(404).json("Recurso no encontrado");
            }

            conexionBD.query(
                "SELECT * FROM resenyas WHERE recurso = ?",
                [idRecurso],
                function (error, datos) {
                    if (error) {
                        console.log("Error GET /api/recursos/:id/resenyas:", error);
                        return res.status(500).json("Error en el servidor");
                    }
                    return res.status(200).json(datos);
                }
            );
        }
    );
});

// app.post("/api/area_salud", function (req, res) {
//     var { Codigo_postal, nombre, gestor, sanitario } = req.body;

//     if (!Codigo_postal || !nombre || !gestor) {
//         return res.status(400).json("Faltan datos (codigo postal, nombre o gestor)");
//     }

//     conexionBD.query("SELECT * FROM salud WHERE Codigo_postal = ?",
//         [Codigo_postal],
//         function (error, datos) {
//             if (error) {
//                 console.log("Error POST /api/area_salud (comprobación):", error);
//                 return res.status(500).json("Error en el servidor");
//             }

//             if (datos.length > 0) {
//                 return res.status(409).json("Ya existe un área de salud con el código postal " + Codigo_postal);
//             }

//             conexionBD.query(
//                 "INSERT INTO salud (Codigo_postal, nombre, gestor, sanitario) VALUES (?, ?, ?, ?)",
//                 [Codigo_postal, nombre, gestor, sanitario],
//                 function (error, resultado) {
//                     if (error) {
//                         console.log("Error POST /api/area_salud (insert):", error);
//                         return res.status(500).json("Error en el servidor");
//                     }
//                     console.log("Zona de salud creada correctamente " + resultado.insertId);
//                     return res.status(201).json("Area " + nombre + " creada correctamente");
//                 }
//             );
//         }
//     );
// });


app.listen(3000);