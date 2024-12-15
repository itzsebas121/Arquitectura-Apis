Database name = "GestionProyectos"

CREATE TABLE Proyectos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX),
    fecha_creacion DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    activo BIT DEFAULT 1
);

CREATE TABLE Tareas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    proyecto_id INT NOT NULL,
    titulo NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(MAX),
    estado NVARCHAR(50) NOT NULL CHECK (estado IN ('pendiente', 'en progreso', 'completada')),
    prioridad NVARCHAR(50) NOT NULL CHECK (prioridad IN ('baja', 'media', 'alta')),
    fecha_creacion DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    fecha_vencimiento DATETIMEOFFSET,
    CONSTRAINT FK_Tareas_Proyectos FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id)
);

CREATE TABLE Comentarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tarea_id INT NOT NULL,
    contenido NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_Comentarios_Tareas FOREIGN KEY (tarea_id) REFERENCES Tareas(id)
);

-- Inserción de datos en la tabla Proyectos
INSERT INTO Proyectos (nombre, descripcion, fecha_creacion, activo)
VALUES 
('Proyecto de Web', 'Página para gestionar pedidos de gas', '2024-12-01T00:00:00.000+00:00', 1);

-- Inserción de datos en la tabla Tareas
INSERT INTO Tareas (proyecto_id, titulo, descripcion, estado, prioridad, fecha_creacion, fecha_vencimiento)
VALUES 
(1, 'Requerimientos', 'Analizar requerimientos del proyecto', 'pendiente', 'alta', '2024-12-01T00:00:00.000+00:00', '2024-12-08T00:00:00.000+00:00'),
(1, 'Creación del servicio', 'Crear el servicio con los métodos necesarios para la implementación', 'en progreso', 'media', '2024-12-01T00:00:00.000+00:00', '2024-12-15T00:00:00.000+00:00');

-- Inserción de datos en la tabla Comentarios
INSERT INTO Comentarios (tarea_id, contenido)
VALUES 
(1, 'Primer comentario en la tarea 1'),
(2, 'Comentario sobre la tarea 2');

