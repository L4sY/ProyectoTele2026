var sanitarios = [
  {"id":1, "nombre":"Marcos", "apellidos":"Polo", "usuario":"mpolo", "password":"mp1"},
  {"id":2, "nombre":"Patricia", "apellidos":"Peich", "usuario":"ppeich", "password":"pp2"},
  {"id":3, "nombre":"Ines", "apellidos":"Perrilla", "usuario":"iperrilla", "password":"ip3"},
  {"id":4, "nombre":"Irene", "apellidos":"Vaquez", "usuario":"ivaquez", "password":"iv4"}
];

var gestores = [
  {"id":1, "nombre":"Carlos", "apellidos":"Martín", "usuario":"cmartin", "password":"cm1"},
  {"id":2, "nombre":"María", "apellidos":"Rodríguez", "usuario":"mrodriguez", "password":"mr2"},
  {"id":3, "nombre":"Antonio", "apellidos":"Fernández", "usuario":"afernandez", "password":"af3"},
  {"id":4, "nombre":"Laura", "apellidos":"Sánchez", "usuario":"lsanchez", "password":"ls4"}
];

var ubicaciones = [
  {"id":1, "nombre":"Sala de Operaciones 1"},
  {"id":2, "nombre":"Almacén Central"},
  {"id":3, "nombre":"Laboratorio A"},
  {"id":4, "nombre":"UCI Principal"},
  {"id":5, "nombre":"Sala de Emergencias"},
  {"id":6, "nombre":"Almacén Quirófano"}
];

var categorias = [
  {"id":1, "nombre":"Termómetros"},
  {"id":2, "nombre":"Estetoscopios"},
  {"id":3, "nombre":"Sillas de ruedas"},
  {"id":4, "nombre":"Monitores cardíacos"},
  {"id":5, "nombre":"Electrocirujanos"},
  {"id":6, "nombre":"Infusores"},
  {"id":7, "nombre":"Ventiladores"}
];

var modelos = [
  {"id":1, "nombre":"Termómetro Digital Pro", "categoria":1, "horas_maximas":24},
  {"id":2, "nombre":"Estetoscopio Lite", "categoria":2, "horas_maximas":8},
  {"id":3, "nombre":"Silla Ruedas Standard", "categoria":3, "horas_maximas":48},
  {"id":4, "nombre":"Monitor cardíaco MC-2000", "categoria":4, "horas_maximas":72},
  {"id":5, "nombre":"Monitor cardíaco Portatil", "categoria":4, "horas_maximas":24},
  {"id":6, "nombre":"Electrocirujano ES-500", "categoria":5, "horas_maximas":12},
  {"id":7, "nombre":"Infusor IV-300", "categoria":6, "horas_maximas":168},
  {"id":8, "nombre":"Ventilador V-900", "categoria":7, "horas_maximas":24}
];

var recursos = [
  // Categoría 1: Termómetros (2 recursos)
  {"id":1, "modelo":1, "ubicacion":1, "numero_serie":"TSN001", "estado":0},
  {"id":2, "modelo":1, "ubicacion":2, "numero_serie":"TSN002", "estado":0},
  
  // Categoría 2: Estetoscopios (1 recurso)
  {"id":3, "modelo":2, "ubicacion":6, "numero_serie":"ESL001", "estado":1},
  
  // Categoría 3: Sillas de ruedas (2 recursos)
  {"id":4, "modelo":3, "ubicacion":3, "numero_serie":"SR001", "estado":0},
  {"id":5, "modelo":3, "ubicacion":2, "numero_serie":"SR002", "estado":0},
  
  // Categoría 4: Monitores cardíacos (2 recursos)
  {"id":6, "modelo":4, "ubicacion":1, "numero_serie":"MC2000-01", "estado":0},
  {"id":7, "modelo":5, "ubicacion":3, "numero_serie":"MC2000-02", "estado":2},
  
  // Categoría 5: Electrocirujanos (1 recurso)
  {"id":8, "modelo":6, "ubicacion":4, "numero_serie":"ES500-01", "estado":0},
  
  // Categoría 6: Infusores (1 recurso)
  {"id":9, "modelo":7, "ubicacion":2, "numero_serie":"IV300-01", "estado":0},
  
  // Categoría 7: Ventiladores (2 recursos)
  {"id":10, "modelo":8, "ubicacion":5, "numero_serie":"V900-01", "estado":0},
  {"id":11, "modelo":8, "ubicacion":3, "numero_serie":"V900-02", "estado":1}
];


var reservas = [
  {"id":1, "recurso":1, "sanitario":1, "horas_estimadas":4, "fecha_peticion":"2026-02-01T10:00:00", "fecha_inicio":"2026-02-01T14:00:00", "fecha_fin":"2026-02-01T18:00:00"},
  {"id":2, "recurso":2, "sanitario":2, "horas_estimadas":12, "fecha_peticion":"2026-02-03T09:00:00", "fecha_inicio":null, "fecha_fin":null},
  {"id":3, "recurso":4, "sanitario":3, "horas_estimadas":24, "fecha_peticion":"2026-02-02T15:00:00", "fecha_inicio":"2026-02-03T08:00:00", "fecha_fin":null}
];

var resenyas = [
  {"id":1, "recurso":1, "sanitario":1, "fecha":"2026-02-01T18:30:00", "valor":5, "descripcion":"Muy buen equipo"},
  {"id":2, "recurso":1, "sanitario":2, "fecha":"2026-02-02T10:00:00", "valor":4, "descripcion":"Genial"},
  {"id":3, "recurso":4, "sanitario":3, "fecha":"2026-02-03T12:00:00", "valor":3, "descripcion":"Magnifico"}
];

module.exports.san=sanitarios
module.exports.gest=gestores
module.exports.ubic=ubicaciones
module.exports.cate=categorias
module.exports.mod=modelos
module.exports.rec=recursos
module.exports.reservas=reservas
module.exports.resenyas=resenyas