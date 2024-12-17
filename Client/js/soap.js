document.addEventListener('DOMContentLoaded', () => {
    const loadButton = document.getElementById('loadButton');
    const createButton = document.getElementById('createButton');
    const updateButton = document.getElementById('updateButton');
    const deleteButton = document.getElementById('deleteButton');

    const loadingElement = document.getElementById('loading');
    const tableElement = document.getElementById('proyectosTable');
    const tbodyElement = tableElement.querySelector('tbody');

    const idField = document.getElementById('proyectoID');
    const nombreField = document.getElementById('proyectoNombre');
    const descripcionField = document.getElementById('proyectoDescripcion');
    const fechaField = document.getElementById('proyectoFecha');
    const activoField = document.getElementById('proyectoActivo'); // Campo para 'activo'

    const toggleLoading = (show) => {
        loadingElement.style.display = show ? 'block' : 'none';
        tableElement.style.display = show ? 'none' : 'table';
    };

    loadButton.addEventListener('click', () => {
        toggleLoading(true);

        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://localhost:5000/wsdl">
                <soapenv:Header/>
                <soapenv:Body>
                    <wsdl:obtener_proyectos/>
                </soapenv:Body>
            </soapenv:Envelope>
        `;

        fetch('http://localhost:5000/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
            body: soapRequest,
        })
            .then((response) => response.text())
            .then((data) => {
                toggleLoading(false);
                tbodyElement.innerHTML = '';

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');

                // Verificar si la respuesta contiene los elementos esperados
                const proyectos = xmlDoc.getElementsByTagName('proyecto');
                if (proyectos.length === 0) {
                    alert('No se encontraron proyectos.');
                    return;
                }

                Array.from(proyectos).forEach((proyecto) => {
                    const idElement = proyecto.getElementsByTagName('ID')[0];
                    const nombreElement = proyecto.getElementsByTagName('Nombre')[0];
                    const descripcionElement = proyecto.getElementsByTagName('Descripcion')[0];
                    const activoElement = proyecto.getElementsByTagName('Activo')[0];
                    const fechaElement = proyecto.getElementsByTagName('FechaCreacion')[0];

                    // Comprobar si los elementos existen antes de acceder a su contenido
                    const id = idElement ? idElement.textContent : 'No disponible';
                    const nombre = nombreElement ? nombreElement.textContent : 'No disponible';
                    const descripcion = descripcionElement ? descripcionElement.textContent : 'No disponible';
                    const activo = activoElement ? activoElement.textContent : 'No disponible';
                    const fecha = fechaElement ? fechaElement.textContent : 'No disponible';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${id}</td>
                    <td>${nombre}</td>
                    <td>${descripcion}</td>
                    <td>${fecha}</td>
                    <td>${activo == 'True' ? 'Activo' : 'Inactivo'}</td>
                    <td>
                        <button onclick="selectRow(${id}, '${nombre.replace(/'/g, "\\'")}', '${descripcion.replace(/'/g, "\\'")}', '${activo}', '${fecha}')">
                            Editar
                        </button>
                    </td>
                `;
                    tbodyElement.appendChild(row);
                });
            })
            .catch((error) => {
                console.error('Error al cargar los proyectos:', error);
                toggleLoading(false);
            });
    });

    createButton.addEventListener('click', () => {
        const nombre = nombreField.value.trim();
        const descripcion = descripcionField.value.trim();
        const fecha = fechaField.value;
        const activoValue = activoField.value;  // Obtener el valor del combobox

        // Convertir la fecha en formato 'YYYY-MM-DD HH:MM:SS'
        const fechaObj = new Date(fecha);
        const fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');  // 'YYYY-MM-DD HH:MM:SS'

        // Convertir el valor del combobox 'activo' a true o false
        const activo = (activoValue === 'true') ? 'true' : 'false';  // Asegúrate que el combobox tenga valores 'true' o 'false'

        if (!nombre || !descripcion || !fecha) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://localhost:5000/wsdl">
                <soapenv:Header/>
                <soapenv:Body>
                    <wsdl:crear_proyecto>
                        <nombre>${nombre}</nombre>
                        <descripcion>${descripcion}</descripcion>
                        <fecha_creacion>${fechaFormateada}</fecha_creacion>
                        <activo>${activo}</activo>
                    </wsdl:crear_proyecto>
                </soapenv:Body>
            </soapenv:Envelope>
`;

        console.log(soapRequest);  // Verifica que el XML está correctamente formado

        fetch('http://localhost:5000/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
            body: soapRequest,
        })
            .then((response) => response.text())
            .then(() => {
                alert('Proyecto creado exitosamente.');
                loadButton.click();
            })
            .catch((error) => console.error('Error al crear el proyecto:', error));
    });

    window.selectRow = function (id, nombre, descripcion, activo, fecha) {
    idField.value = id;
    nombreField.value = nombre;
    descripcionField.value = descripcion;
    activoField.checked = activo === 'true'; 
    const fechaObj = new Date(fecha); 
    const fechaFormateada = fechaObj.toISOString().slice(0, 10); 
    fechaField.value = fechaFormateada;

    updateButton.disabled = false;
    deleteButton.disabled = false;
};
    updateButton.addEventListener('click', () => {
        const id = idField.value;
        const nombre = nombreField.value.trim();
        const descripcion = descripcionField.value.trim();
        const fecha = fechaField.value;
        const activoValue = activoField.value;  // Obtener el valor del combobox 'activo'
    
        // Convertir la fecha en formato 'YYYY-MM-DD HH:MM:SS'
        const fechaObj = new Date(fecha);
        const fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');  // 'YYYY-MM-DD HH:MM:SS'
    
        // Convertir el valor del combobox 'activo' a true o false
        const activo = (activoValue === 'true') ? 'true' : 'false';  // Asegúrate que el combobox tenga valores 'true' o 'false'
    
        if (!nombre || !descripcion || !fecha) {
            alert('Por favor, completa todos los campos.');
            return;
        }
    
        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://localhost:5000/wsdl">
                <soapenv:Header/>
                <soapenv:Body>
                    <wsdl:actualizar_proyecto>
                        <id>${id}</id>
                        <nombre>${nombre}</nombre>
                        <descripcion>${descripcion}</descripcion>
                        <fecha_creacion>${fechaFormateada}</fecha_creacion>
                        <activo>${activo}</activo>
                    </wsdl:actualizar_proyecto>
                </soapenv:Body>
            </soapenv:Envelope>
        `;
    
        fetch('http://localhost:5000/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
            body: soapRequest,
        })
            .then((response) => response.text())
            .then(() => {
                alert('Proyecto actualizado exitosamente.');
                loadButton.click();
                updateButton.disabled = true;
                deleteButton.disabled = true;
            })
            .catch((error) => console.error('Error al actualizar el proyecto:', error));
    });

    deleteButton.addEventListener('click', () => {
        const id = idField.value;

        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://localhost:5000/wsdl">
                <soapenv:Header/>
                <soapenv:Body>
                    <wsdl:eliminar_proyecto>
                        <id>${id}</id>
                    </wsdl:eliminar_proyecto>
                </soapenv:Body>
            </soapenv:Envelope>
        `;

        fetch('http://localhost:5000/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
            body: soapRequest,
        })
            .then((response) => response.text())
            .then(() => {
                alert('Proyecto eliminado exitosamente.');
                loadButton.click();
                updateButton.disabled = true;
                deleteButton.disabled = true;
            })
            .catch((error) => console.error('Error al eliminar el proyecto:', error));
    });
});
