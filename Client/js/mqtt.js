document.addEventListener('DOMContentLoaded', () => {

    // Configuración de la conexión al broker MQTT
    const client = mqtt.connect('ws://test.mosquitto.org:8081/mqtt');  // Usamos WebSocket para la conexión
    
    client.on('connect', () => {
        console.log('Conectado al broker MQTT');
        client.subscribe('proyectos/respuesta', (err) => {
            if (!err) {
                    console.log('Suscrito a proyectos/respuesta');
                }
            });
        });
        
        // Manejar la recepción de mensajes desde el broker MQTT
        client.on('message', (topic, message) => {
            console.log('Mensaje recibido en el topic', topic);
            const response = JSON.parse(message.toString());
            
            // Mostrar los proyectos recibidos en la tabla
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = '';  // Limpiar la tabla antes de mostrar nuevos proyectos
            
            response.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.nombre}</td>
                    <td>${project.descripcion}</td>
                    <td>${project.fechaCreacion}</td>
                    <td>${project.activo ? 'Sí' : 'No'}</td>
                    <td>
                        <button onclick="editProject('${project.id}', '${project.nombre}', '${project.descripcion}', '${project.fechaCreacion}', ${project.activo})">Editar</button>
                    </td>
                    `;
                projectsList.appendChild(row);
            });
            
            // Mostrar la respuesta en el área de respuestas
            document.getElementById('response').textContent = JSON.stringify(response, null, 2);
        });
        
        // Cargar proyectos desde la API HTTP y MQTT
        document.getElementById('loadProjectsButton').addEventListener('click', () => {
            fetch('http://localhost:3000/proyectos')
                .then(response => response.json())
                .then(data => {
                    const projectsList = document.getElementById('projectsList');
                    projectsList.innerHTML = '';  // Limpiar la tabla antes de mostrarla
                    
                    data.forEach(project => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${project.nombre}</td>
                            <td>${project.descripcion}</td>
                            <td>${project.fechaCreacion}</td>
                            <td>${project.activo ? 'Sí' : 'No'}</td>
                            <td>
                            <button onclick="editProject('${project.id}', '${project.nombre}', '${project.descripcion}', '${project.fechaCreacion}', ${project.activo})">Editar</button>
                            </td>
                            `;
                        projectsList.appendChild(row);
                    });
                })
                .catch(err => {
                    console.error('Error al cargar proyectos:', err);
                });

                // Solicitar los proyectos desde MQTT
            const mqttMessage = { action: 'getAllProjects' };  // Acción para obtener todos los proyectos
            client.publish('proyectos/crud', JSON.stringify(mqttMessage));  // Publicar mensaje en el topic 'proyectos/crud'
        });

        // Función para cargar datos en el formulario de edición
        function editProject(id, name, description, creationDate, active) {
            document.getElementById('projectName').value = name;
            document.getElementById('projectDescription').value = description;
            document.getElementById('projectCreationDate').value = creationDate;
            document.getElementById('projectActive').checked = active;
            
            // Añadir el ID del proyecto a un campo oculto o almacenarlo para su posterior uso
            document.getElementById('createUpdateButton').setAttribute('data-id', id);
        }

        // Crear o actualizar proyecto
        document.getElementById('createUpdateButton').addEventListener('click', () => {
            const projectName = document.getElementById('projectName').value;
            const projectDescription = document.getElementById('projectDescription').value;
            const projectCreationDate = document.getElementById('projectCreationDate').value;
            const projectActive = document.getElementById('projectActive').checked;
            const projectId = document.getElementById('createUpdateButton').getAttribute('data-id');
            
            if (!projectName || !projectDescription || !projectCreationDate) {
                alert("Por favor, complete el nombre, la descripción y la fecha de creación del proyecto.");
                return;
            }

            const projectData = { 
                nombre: projectName, 
                descripcion: projectDescription, 
                fechaCreacion: projectCreationDate,
                activo: projectActive 
            };

            const createUpdateMessage = {
                action: 'createOrUpdateProject',
                project: projectData,
                id: projectId
            };

            client.publish('proyectos/crud', JSON.stringify(createUpdateMessage));
            console.log('Creando o actualizando proyecto:', projectData);
        });

        // Eliminar proyecto por ID
        document.getElementById('deleteButton').addEventListener('click', () => {
            const projectId = document.getElementById('deleteProjectId').value;
            
            if (!projectId) {
                alert("Por favor, ingrese el ID del proyecto a eliminar.");
                return;
            }

            const deleteMessage = {
                action: 'deleteProject',
                projectId: projectId
            };

            // Enviar mensaje para eliminar el proyecto en MQTT
            client.publish('proyectos/crud', JSON.stringify(deleteMessage));
            console.log('Eliminando proyecto con ID:', projectId);
        });

        // Enviar consulta MQTT
        document.getElementById('sendQueryButton').addEventListener('click', () => {
            const query = document.getElementById('mqttQuery').value;

            if (!query) {
                alert("Por favor, ingrese una consulta MQTT.");
                return;
            }

            const queryMessage = { action: 'mqttQuery', query: query };

            // Publicar consulta MQTT
            client.publish('proyectos/crud', JSON.stringify(queryMessage));
            console.log('Consulta MQTT enviada:', query);
        });

        client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    client.subscribe('proyectos/respuesta', (err) => {
        if (!err) {
            console.log('Suscrito a proyectos/respuesta');
        }
    });
});

client.on('message', async (topic, message) => {
    console.log('Mensaje recibido en el topic', topic);
    const messageContent = JSON.parse(message.toString());

    if (topic === 'proyectos/crud') {
        const { action, project, projectName } = messageContent;

        try {
            if (action === 'createOrUpdateProject') {
                // Crear o actualizar proyecto
                const { nombre, descripcion, activo, fecha_creacion } = project;
                let query = '';

                if (project.id) {
                    // Actualizar proyecto
                    query = `
                        UPDATE Proyectos
                        SET nombre = @nombre, descripcion = @descripcion, activo = @activo, fecha_creacion = @fecha_creacion
                        WHERE id = @id
                    `;
                } else {
                    // Crear proyecto
                    query = `
                        INSERT INTO Proyectos (nombre, descripcion, activo, fecha_creacion)
                        VALUES (@nombre, @descripcion, @activo, SYSDATETIMEOFFSET())
                    `;
                }

                const pool = await connectToDatabase();
                await pool.request()
                    .input('id', sql.Int, project.id)
                    .input('nombre', sql.NVarChar(100), nombre)
                    .input('descripcion', sql.NVarChar(sql.MAX), descripcion)
                    .input('activo', sql.Bit, activo)
                    .input('fecha_creacion', sql.DateTimeOffset, fecha_creacion)
                    .query(query);

                console.log('Proyecto procesado en MQTT:', project);
            }

            if (action === 'deleteProject') {
                // Eliminar proyecto
                const pool = await connectToDatabase();
                await pool.request()
                    .input('projectName', sql.NVarChar(100), projectName)
                    .query('DELETE FROM Proyectos WHERE nombre = @projectName');

                console.log('Proyecto eliminado en MQTT:', projectName);
            }
        } catch (err) {
            console.error('Error al procesar acción en MQTT:', err);
        }
    }
});
})
