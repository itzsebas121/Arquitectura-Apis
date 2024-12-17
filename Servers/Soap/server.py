import xml.etree.ElementTree as ET
from flask import Flask, Response, request, jsonify
from spyne import Application, rpc, ServiceBase, Unicode, Integer, Boolean
from spyne.protocol.soap import Soap11
from flask_sqlalchemy import SQLAlchemy
from spyne.server.wsgi import WsgiApplication
from xml.etree.ElementTree import Element, SubElement, tostring
from flask_cors import CORS

# Configuración de Flask y base de datos
app = Flask(__name__)
CORS(app, resources={r"/proyectos": {"origins": "http://127.0.0.1:5500"}})

# Configuración de la base de datos (SQLAlchemy)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'mssql+pyodbc://sebas:Itz_sebas121@108.181.157.251:10070/GestionProyectos?'
    'driver=ODBC+Driver+17+for+SQL+Server'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Proyecto(db.Model):
    __tablename__ = 'Proyectos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String)
    fecha_creacion = db.Column(db.DateTime)  
    activo = db.Column(db.Boolean, default=True)

class ProyectoService(ServiceBase):

    @rpc(_returns=Unicode)
    def obtener_proyectos(ctx):
        proyectos = Proyecto.query.all()
        if not proyectos:
            return "No hay proyectos disponibles."
        
        # Crear el contenedor principal del XML
        response = Element('SOAP-ENV:Envelope', xmlns='http://schemas.xmlsoap.org/soap/envelope/')
        body = SubElement(response, 'SOAP-ENV:Body')

        # Crear el nodo para la respuesta de obtener proyectos
        obtener_proyectos_response = SubElement(body, 'obtener_proyectosResponse')

        # Crear la lista de proyectos
        proyectos_list = SubElement(obtener_proyectos_response, 'proyectos')
        for p in proyectos:
            proyecto_elem = SubElement(proyectos_list, 'proyecto')
            SubElement(proyecto_elem, 'ID').text = str(p.id)
            SubElement(proyecto_elem, 'Nombre').text = p.nombre
            SubElement(proyecto_elem, 'Descripcion').text = p.descripcion
            SubElement(proyecto_elem, 'FechaCreacion').text = str(p.fecha_creacion)
            SubElement(proyecto_elem, 'Activo').text = str(p.activo)

        # Convertir el XML a cadena
        return tostring(response, encoding='utf-8', method='xml').decode('utf-8')
    
    # Crear un nuevo proyecto
    @rpc(Unicode, Unicode, Boolean, Unicode, _returns=Unicode)
    def crear_proyecto(ctx, nombre, descripcion, activo, fecha_creacion):
        try:
            from datetime import datetime
            fecha_creacion = datetime.strptime(fecha_creacion, "%Y-%m-%d %H:%M:%S")
            proyecto = Proyecto(nombre=nombre, descripcion=descripcion,  fecha_creacion=fecha_creacion, activo=activo)
            db.session.add(proyecto)
            db.session.commit()
            return f"Proyecto '{nombre}' creado exitosamente."
        except Exception as e:
            return f"Error al crear el proyecto: {str(e)}"
    
    @rpc(Integer, Unicode, Unicode, Boolean, Unicode, _returns=Unicode)
    def actualizar_proyecto(ctx, id, nombre, descripcion, activo, fecha_creacion):
        try:
            from datetime import datetime
            fecha_creacion = datetime.strptime(fecha_creacion, "%Y-%m-%d %H:%M:%S")

            proyecto = Proyecto.query.get(id)
            if not proyecto:
                return f"Proyecto con ID {id} no encontrado."
            
            proyecto.nombre = nombre
            proyecto.descripcion = descripcion
            proyecto.fecha_creacion = fecha_creacion 
            proyecto.activo = activo
            db.session.commit()
            return f"Proyecto {id} actualizado exitosamente."
        except Exception as e:
            return f"Error al actualizar el proyecto: {str(e)}"
        
    @rpc(Integer, _returns=Unicode)
    def eliminar_proyecto(ctx, id):
        try:
            proyecto = Proyecto.query.get(id)
            if not proyecto:
                return f"Proyecto con ID {id} no encontrado."
            db.session.delete(proyecto)
            db.session.commit()
            return f"Proyecto {id} eliminado exitosamente."
        except Exception as e:
            return f"Error al eliminar el proyecto: {str(e)}"


soap_app = Application([ProyectoService], tns='http://localhost:5000/wsdl', in_protocol=Soap11(), out_protocol=Soap11())

wsgi_application = WsgiApplication(soap_app)

@app.route('/wsdl', methods=['GET'])
def wsdl():
    with open('wsdl.xml', 'r') as file:
        wsdl_content = file.read()
    return Response(wsdl_content, mimetype="application/xml")

@app.route('/proyectos', methods=['POST'])
def proyectos():
    try:
        soap_request = request.data
        soap_request_str = soap_request.decode('utf-8')
        root = ET.fromstring(soap_request_str)

        namespaces = {'soapenv': 'http://schemas.xmlsoap.org/soap/envelope/', 'wsdl': 'http://localhost:5000/wsdl'}

        if root.tag.endswith("Envelope"):
            body = root.find('soapenv:Body', namespaces)
            if body is not None:
                obtener_proyectos = body.find('wsdl:obtener_proyectos', namespaces)
                if obtener_proyectos is not None:
                    response = ProyectoService.obtener_proyectos(None)
                    return Response(response, mimetype='application/soap+xml')
                
                crear_proyecto = body.find('wsdl:crear_proyecto', namespaces)
                if crear_proyecto is not None:
                    nombre = crear_proyecto.find('nombre').text
                    descripcion = crear_proyecto.find('descripcion').text
                    activo = crear_proyecto.find('activo').text == 'true'
                    fecha_creacion = crear_proyecto.find('fecha_creacion').text
                    
                    response = ProyectoService.crear_proyecto(None, nombre, descripcion, activo, fecha_creacion)
                    return Response(response, mimetype='application/soap+xml')
                
                actualizar_proyecto = body.find('wsdl:actualizar_proyecto', namespaces)
                if actualizar_proyecto is not None:
                    id = int(actualizar_proyecto.find('id').text)
                    nombre = actualizar_proyecto.find('nombre').text
                    descripcion = actualizar_proyecto.find('descripcion').text
                    activo = actualizar_proyecto.find('activo').text == 'true'
                    fecha_creacion = actualizar_proyecto.find('fecha_creacion').text
                    
                    response = ProyectoService.actualizar_proyecto(None, id, nombre, descripcion, activo, fecha_creacion)
                    return Response(response, mimetype='application/soap+xml')
                
                eliminar_proyecto = body.find('wsdl:eliminar_proyecto', namespaces)
                if eliminar_proyecto is not None:
                    id = int(eliminar_proyecto.find('id').text)
                    response = ProyectoService.eliminar_proyecto(None, id)
                    return Response(response, mimetype='application/soap+xml')
                    
            return jsonify({"error": "Cuerpo del mensaje SOAP no encontrado."}), 400
        return jsonify({"error": "Solicitud SOAP inválida."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
