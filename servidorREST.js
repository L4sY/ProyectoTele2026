var express = require("express");
var jwt = require('jwt-simple');
var clave = 'miSecretoMasOscuro'; 

const { createClient } = require('@supabase/supabase-js');


// Configuración de Supabase (usa marcadores falsos para el repositorio)
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-clave-anon-publica-falsa'; 
const supabase = createClient(supabaseUrl, supabaseKey);

var app = express();
app.use("/appCliente", express.static("cliente"));
app.use(express.json());

// ==========================================
// RUTAS PÚBLICAS (NO necesitan token)
// ==========================================

// Login de gestor
app.post("/api/gestores/login", async (req, res) => {
    var usuario = req.body.usuario;
    var contraseña = req.body.password;

    try {
        const { data: gestores, error } = await supabase
            .from('gestores')
            .select('id')
            .eq('usuario', usuario)
            .eq('password', contraseña);

        if (error) return res.status(500).json("Error en el servidor");
        
        if (gestores && gestores.length === 1) {
            var contenido = { 
                usuario: gestores[0].id,
                expira: Date.now() + 60 * 60 * 1000 // 1 hora
            };
            var tokenGenerado = jwt.encode(contenido, clave);
            
            res.status(200).json({ id: gestores[0].id, token: tokenGenerado });
        } else {
            res.status(401).json("Usuario o contraseña incorrectos");
        }
    } catch (err) {
        res.status(500).json("Error interno del servidor");
    }
});

// Registro de un nuevo gestor
app.post("/api/gestores", async (req, res) => {
    var { nombre, apellidos, usuario, password } = req.body;

    try {
        // Comprobar si existe
        const { data: existe, error: errExiste } = await supabase
            .from('gestores')
            .select('id')
            .eq('usuario', usuario);

        if (errExiste) return res.status(500).json("Error en el servidor");
        if (existe && existe.length > 0) return res.status(409).json("El nombre de usuario ya está en uso");

        // Insertar
        const { data: insertado, error: errInsert } = await supabase
            .from('gestores')
            .insert([{ nombre, apellidos, usuario, password }])
            .select(); // Necesario para que devuelva el objeto insertado

        if (errInsert) return res.status(500).json("Error en el servidor al insertar");

        var nuevoId = insertado[0].id;
        
        var contenido = { 
            usuario: nuevoId,
            expira: Date.now() + 60 * 60 * 1000
        };
        var tokenGenerado = jwt.encode(contenido, clave);

        res.status(201).json({ 
            mensaje: "Gestor creado correctamente",
            id: nuevoId,
            token: tokenGenerado 
        });
    } catch (err) {
        res.status(500).json("Error interno del servidor");
    }
});

// ==========================================
// MIDDLEWARE DE SEGURIDAD (Validación JWT)
// ==========================================
app.use("/api", function (req, res, next) {
    var token = req.headers['authorization']; 
    
    if (!token) {
        return res.status(401).json("No se ha encontrado token");
    }

    try {
        var contenidoToken = jwt.decode(token, clave); 
    } catch (error) {
        return res.status(401).json("El token es incorrecto");
    }

    if (!contenidoToken || !contenidoToken.expira || !contenidoToken.usuario) { 
        return res.status(401).json("El formato del token no es adecuado");
    }

    if (contenidoToken.expira < Date.now()) {
        return res.status(401).json("El token ha expirado");
    }
    
    next();
});

// ==========================================
// RUTAS PRIVADAS (SÍ necesitan token)
// ==========================================

// GET Listas estáticas
app.get("/api/ubicaciones", async (req, res) => {
    const { data, error } = await supabase.from('ubicaciones').select('*');
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

app.get("/api/categorias", async (req, res) => {
    const { data, error } = await supabase
    .from('categorias')
    .select('*');
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

app.get("/api/modelos", async (req, res) => {
    const { data, error } = await supabase.from('modelos').select('*');
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

// GET un gestor
app.get("/api/gestores/:id", async (req, res) => {
    const { data, error } = await supabase
        .from('gestores')
        .select('id, nombre, apellidos, usuario')
        .eq('id', req.params.id);

    if (error) return res.status(500).json("Error en el servidor");
    if (!data || data.length === 0) return res.status(404).json("Gestor no encontrado");
    res.status(200).json(data[0]);
});

// GET un sanitario
app.get("/api/sanitarios/:id", async (req, res) => {
    const { data, error } = await supabase
        .from('sanitarios')
        .select('id, nombre, apellidos, usuario')
        .eq('id', req.params.id);

    if (error) return res.status(500).json("Error en el servidor");
    if (!data || data.length === 0) return res.status(404).json("Sanitario no encontrado");
    res.status(200).json(data[0]);
});

// GET Recursos (con filtros)
app.get("/api/recursos", async (req, res) => {
    var { modelo, ubicacion, estado } = req.query;
    
    let query = supabase.from('recursos').select('*');

    if (modelo) query = query.eq('modelo', modelo);
    if (ubicacion) query = query.eq('ubicacion', ubicacion);
    if (estado) query = query.eq('estado', estado);

    const { data, error } = await query;
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

// GET un recurso
app.get("/api/recursos/:id", async (req, res) => {
    const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', req.params.id);
    if (error) return res.status(500).json("Error en el servidor");
    if (!data || data.length === 0) return res.status(404).json("Recurso no encontrado");
    res.status(200).json(data[0]);
});

// POST Recursos
app.post("/api/recursos", async (req, res) => {
    var { modelo, numSerie, ubicacion, estado } = req.body;
    
    // Comprobar duplicado
    const { data: duplicado } = await supabase
    .from('recursos')
    .select('id')
    .eq('numero_serie', numSerie);
    if (duplicado && duplicado.length > 0) return res.status(409).json("Número de serie ya en uso");

    // Insertar
    const { data, error } = await supabase
        .from('recursos')
        .insert([{ modelo, numero_serie: numSerie, ubicacion, estado }])
        .select();

    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json("Nuevo recurso creado con id: " + data[0].id);
});

// PUT Recursos
app.put("/api/recursos/:id", async (req, res) => {
    var idRecurso = req.params.id;
    var { modelo, numero_serie, ubicacion, estado } = req.body;

    // Comprobar duplicado ignorando el actual
    const { data: duplicado } = await supabase
        .from('recursos')
        .select('id')
        .eq('numero_serie', numero_serie)
        .neq('id', idRecurso);

    if (duplicado && duplicado.length > 0) return res.status(409).json("Número de serie ya en uso");

    // Actualizar
    const { data, error } = await supabase
        .from('recursos')
        .update({ modelo, numero_serie, ubicacion, estado })
        .eq('id', idRecurso)
        .select();

    if (error) return res.status(500).json("Error en el servidor");
    if (!data || data.length === 0) return res.status(404).json("Recurso no encontrado");
    res.status(201).json("Recurso actualizado correctamente");
});

// DELETE Recursos
app.delete("/api/recursos/:id", async (req, res) => {
    const { data, error } = await supabase
        .from('recursos')
        .delete()
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json("Error en el servidor");
    if (!data || data.length === 0) return res.status(404).json("Recurso no encontrado");
    res.status(200).json("Recurso borrado correctamente");
});

// GET Reservas por recurso
app.get("/api/recursos/:id/reservas", async (req, res) => {
    const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('recurso', req.params.id);
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

// GET Reseñas por recurso
app.get("/api/recursos/:id/resenyas", async (req, res) => {
    const { data, error } = await supabase
    .from('resenyas')
    .select('*')
    .eq('recurso', req.params.id);
    if (error) return res.status(500).json("Error en el servidor");
    res.status(200).json(data);
});

app.listen(3000, () => {
    console.log("Servidor iniciado en puerto 3000 con soporte JWT y Supabase nativo");
});