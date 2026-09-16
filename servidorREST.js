//Requerimos express y lo añadimos a una variable
var express = require("express");
var app = express();
var ws = require("./servidorWS.js");

//Requerimos los datos de datos.js, los 
//importamos y añadimos a una variable
var datosServidor = require('./datos.js');
var sanitarios=datosServidor.san
var gestores = datosServidor.gest
var ubicaciones = datosServidor.ubic
var categoria = datosServidor.cate
var modelos = datosServidor.mod
var recursos = datosServidor.rec
var reservas = datosServidor.reservas
var reseynas = datosServidor.resenyas

console.log("==========GESTORES==============")
console.log(gestores[0].usuario);
console.log(gestores[0].password);
console.log("---------------------------------")
console.log(gestores[1].usuario);
console.log(gestores[1].password);

app.use("/appCliente", express.static("cliente")); 
app.use(express.static("."));
app.use(express.json());

var siguienteGestor = 5;
var siguienteRecurso = 12;

//Obtener array ubicaciones
app.get("/api/ubicaciones",function (req, res) {
     res.status(200).json(ubicaciones)
});

//Obtener array categorias
app.get("/api/categorias",function(req, res){
    res.status(200).json(categoria)
});

//Obtener array modelos
app.get("/api/modelos", function(req, res){
    res.status(200).json(modelos)
})

app.post("/api/gestores/login", function(req, res) {

    var loginG = req.body.usuario;
    var contraseña = req.body.password;

    var gestorEncontrado = null; // Variable en el scope correcto

    gestores.forEach(function(gestor) {
        if (loginG == gestor.usuario && contraseña == gestor.password) {
            gestorEncontrado = gestor; // Guardamos el objeto entero
        }
    });

    if (gestorEncontrado) {
        return res.status(200).json(gestorEncontrado.id);
    } else {
        return res.status(403).json("Usuario y contraseña incorrectos, vuelva a intentarlo");
    }
});

app.post("/api/gestores", function(req, res){
    //Usar estos nombres para el body de la peticion
    var {nombre, apellidos, usuario, password} = req.body;

    var duplicado = gestores.some(function (g){
        return g.usuario == usuario
    })
    if (duplicado){
        return res.status(409).json("El nombre de usuario: "+usuario +"ya esta en uso ")
    }

    console.log(req.body)
    var gestorNuevo = {
    id: siguienteGestor,
    nombre,
    apellidos,
    usuario,
    password,
    }
    console.log(gestorNuevo)
    gestores.push(gestorNuevo)
    siguienteGestor++;

    res.status(201).json("Gestor creado correctamente")
});

app.put("/api/gestores/:id", function(req, res){
    //Controlar duplicados del usuario
    var idGestor = req.params.id;
    
    var posicionGestor = gestores.findIndex(function (gestor){
        return gestor.id == idGestor;
    });

    var usuarioRepetido = gestores.some(function(gestor){
        return gestor.id != idGestor && gestor.usuario == req.body.usuario 
    })

    if (posicionGestor == -1){
       return res.status(404).json("No existe un gestor con el codigo "+idGestor)
    }
    else if (usuarioRepetido && idGestor!=gestores[posicionGestor].id){
        return res.status(409).json("El usuario ya esta en uso")
    }
    else{
        var {id, ...resto} = req.body;

        gestores[posicionGestor] = {...gestores[posicionGestor], ...resto};
        console.log(gestores[posicionGestor])
        return res.status(200).json("Datos del gestor actualizados correctamente"+gestores[posicionGestor])
    }
    // else{
    // gestores[posicionGestor].nombre = req.body.nombre;
    // gestores[posicionGestor].apellidos = req.body.apellidos;
    // gestores[posicionGestor].usuario = req.body.usuario;
    // gestores[posicionGestor].password = req.body.password;
    //     res.status(200).json("Datos del gestor actualizados correctamente"+gestores[posicionGestor])
    // }
});

app.get("/api/gestores/:id", function(req, res){
    var idGestor = req.params.id;

    var posicionGestor = gestores.findIndex(function (gestor){
        return gestor.id == idGestor;
    });

    if (posicionGestor == -1){
        return res.status(404).json("No existe un gestor con el codigo "+idGestor)
    }
    else{
        var {id,password, ...resto} = gestores[posicionGestor];
        return res.status(200).json(resto);

    }
});

app.get("/api/sanitarios/:id", function(req, res){
    var idSanitario = req.params.id;

    var posicionSanitario = sanitarios.findIndex(function (sanitario){
        return sanitario.id == idSanitario;
    });

    if (posicionSanitario == -1){
        return res.status(404).json("No existe un sanitario con el codigo "+idSanitario)
    }
    else{
        var {password, ...resto} = sanitarios[posicionSanitario];
        return res.status(200).json(resto);

    }
});

app.get("/api/recursos", function(req, res) {
  var { categoria, modelo, ubicacion, estado } = req.query;

  var filtrados = recursos.filter(function(r) {
   if (categoria){
      var mod = modelos.find(function(m){
        return m.id == r.modelo;
      }); 

      if (!mod) return false; //Comprueba que no se devuelva undefined
      if (mod.categoria != categoria) return false;
    }
    //Comprobar que el dato no es null/undefined y la condicion
    if (modelo && r.modelo != modelo) return false;
    if (ubicacion && r.ubicacion != ubicacion) return false;
    if (estado && r.estado != estado) return false;

    return true;
  });

  return res.status(200).json(filtrados);
});


app.get("/api/recursos/:id", function(req, res){
    var idRecurso = req.params.id;

    //Recorremos el array de recursos hasta que la comparacion del ID sea true
    //cuando lo encuentra devuelve ese INDEX
    var posicionRecurso = recursos.findIndex(function(recurso){
        return recurso.id == idRecurso;
    });

    if (posicionRecurso == -1){
        return res.status(404).json("Recurso no encontrado");
    }

    return res.status(200).json(recursos[posicionRecurso]);
    
})

app.post("/api/recursos", function(req, res){
    var {categoria, modelo, numSerie, ubicacion, estado, idGestor} = req.body;

    var duplicado = recursos.some(function(recurso){
        return recurso.numero_serie == numSerie;
    })
    if (duplicado){
        return res.status(409).json("Numero de serie: "+numSerie+" ya en uso")
    }
    var nuevoRecurso = {
        id: siguienteRecurso,
        modelo,
        ubicacion,
        numSerie,
        estado
    }
    recursos.push(nuevoRecurso)
    res.status(200).json("Nuevo recurso creado: "+recursos[recursos.length-1])
    ws.notificarNuevoRecurso(categoria, modelo, numSerie, idGestor, siguienteRecurso)
    siguienteRecurso++;
})


app.put("/api/recursos/:id", function(req,res){
    var idRecurso = req.params.id;

    var recurso = recursos.findIndex(function(r){
        return idRecurso == r.id
    })

    var nSerieRepetido = recursos.some(function(rNumS){
        return  idRecurso != rNumS.id && req.body.numero_serie == rNumS.numero_serie
    })

    if(recurso == -1){
        return res.status(404).json("Recurso no encontrado")
    } else if (nSerieRepetido) {
        return res.status(409).json("Numero de serie ya en uso")
    } else{
        var {id, ...resto} = req.body
        recursos[recurso] = {...recursos[recurso], ...resto};
        console.log(recursos[recurso])
        return res.status(201).json("Recurso actualizado correctamente")
    }
    
})

app.delete("/api/recursos/:id", function(req, res){
  var idRecurso = req.params.id;

  var posicionRecurso = recursos.findIndex(function(r){
    return r.id == idRecurso;
  });

  if (posicionRecurso == -1){
    return res.status(404).json("Recurso no encontrado");
  }

  recursos.splice(posicionRecurso, 1); 

  return res.status(200).json("Recurso borrado correctamente");
});

app.get("/api/recursos/:id/reservas", function(req, res){
  var idRecurso = req.params.id;

  var posicionRecurso = recursos.findIndex(function(r){
    return r.id == idRecurso;
  });

  if (posicionRecurso == -1){
    return res.status(404).json("Recurso no encontrado");
  }

  var reservasRecurso = reservas.filter(function(rv){
    return rv.recurso == idRecurso;
  }); 

  return res.status(200).json(reservasRecurso);
});


app.get("/api/recursos/:id/resenyas", function(req, res){
  var idRecurso = req.params.id;

  var posicionRecurso = recursos.findIndex(function(r){
    return r.id == idRecurso;
  });

  if (posicionRecurso == -1){
    return res.status(404).json("Recurso no encontrado");
  } 

  var resenyasRecurso = reseynas.filter(function(rs){
    return rs.recurso == idRecurso;
  });

  return res.status(200).json(resenyasRecurso);
});



app.listen(3000)