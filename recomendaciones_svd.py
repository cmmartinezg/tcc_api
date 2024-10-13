from flask import Flask, jsonify, request
from flask_cors import CORS
from surprise import SVD, Dataset, Reader
import pandas as pd
import requests

app = Flask(__name__)
CORS(app)

# Función para obtener las calificaciones desde tu API de Node.js
def obtener_calificaciones():
    try:
        response = requests.get('http://localhost:3000/api/calificaciones')
        response.raise_for_status()  # Levanta un error si la solicitud falla
        calificaciones = response.json()

        # Convertir los resultados en un DataFrame de pandas
        df_calificaciones = pd.DataFrame(calificaciones)

        return df_calificaciones
    except Exception as e:
        print(f"Error al obtener las calificaciones desde la API de Node.js: {e}")
        return None

# Función para obtener los productos de un comerciante desde tu API de Node.js
def obtener_productos_comerciante(comerciante_id):
    try:
        response = requests.get(f'http://localhost:3000/api/productos?comercianteId={comerciante_id}')
        response.raise_for_status()
        productos = response.json()

        # Obtener solo los IDs de los productos
        productos_ids = [producto['id'] for producto in productos]
        return productos_ids
    except Exception as e:
        print(f"Error al obtener los productos del comerciante {comerciante_id}: {e}")
        return []

# Obtener las calificaciones desde la API de Node.js
calificaciones_df = obtener_calificaciones()

# Verificar que se han obtenido las calificaciones correctamente
if calificaciones_df is not None:
    print("Columnas en el DataFrame:", calificaciones_df.columns.tolist())
    print("Primeras filas del DataFrame:\n", calificaciones_df.head())
else:
    print("Error: No se pudieron cargar las calificaciones desde la base de datos.")
    exit()

# Preparar los datos para Surprise SVD
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(calificaciones_df[['usuario_id', 'producto_id', 'calificacion']], reader)

# Entrenar el modelo SVD
trainset = data.build_full_trainset()
algo = SVD()
algo.fit(trainset)

# Función para obtener detalles del producto desde tu API de Node.js
def obtener_detalles_producto(producto_id):
    try:
        response = requests.get(f'http://localhost:3000/api/productos/{producto_id}')
        response.raise_for_status()
        producto = response.json()

        # Devolver los detalles relevantes del producto
        return {
            'id': producto['id'],
            'nombre': producto['nombre'],
            'descripcion': producto['descripcion'],
            'precio': producto['precio'],
            'foto_url': producto.get('foto_url', 'default_image.jpg')  # Asegurarnos de que siempre haya una imagen
        }
    except Exception as e:
        print(f"Error al obtener detalles del producto {producto_id}: {e}")
        return None

# Definir la ruta de recomendaciones
@app.route('/recomendaciones', methods=['GET'])
def get_recommendations():
    comerciante_id = request.args.get('comercianteId', type=int)  # Obtener el ID del comerciante desde la solicitud

    # Obtener todos los productos del comerciante para no recomendarlos
    productos_comerciante = obtener_productos_comerciante(comerciante_id)

    # Obtener todos los productos para los cuales hacer recomendaciones
    all_product_ids = calificaciones_df['producto_id'].unique()

    recomendaciones = []
    for producto_id in all_product_ids:
        # Saltar los productos que ya están en el inventario del comerciante
        if producto_id in productos_comerciante:
            continue
        
        prediccion = algo.predict(uid='global_user', iid=producto_id)
        
        # Obtener detalles del producto desde la API de Node.js
        detalles_producto = obtener_detalles_producto(producto_id)
        
        if detalles_producto:
            # Adjuntar la calificación predicha
            detalles_producto['rating'] = float(prediccion.est)
            recomendaciones.append(detalles_producto)
    
    # Ordenar las recomendaciones por calificación predicha
    recomendaciones = sorted(recomendaciones, key=lambda x: x['rating'], reverse=True)[:10]
    
    return jsonify(recomendaciones)

if __name__ == '__main__':
    print("Servidor Flask iniciado con SVD...")
    app.run(port=5002, debug=True)
