from flask import Flask, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# Función para obtener productos desde la API de Node.js
def obtener_productos():
    try:
        response = requests.get('http://localhost:3000/api/productos')
        response.raise_for_status()
        productos = response.json()

        # Convertir los productos a un DataFrame de pandas
        df_productos = pd.DataFrame(productos)

        # Asegurarnos de que el precio es numérico
        df_productos['precio'] = pd.to_numeric(df_productos['precio'], errors='coerce')

        # Codificar las categorías a valores numéricos
        label_encoder = LabelEncoder()
        df_productos['categoria_encoded'] = label_encoder.fit_transform(df_productos['categoria'])

        return df_productos
    except Exception as e:
        print(f"Error al obtener los productos desde la API de Node.js: {e}")
        return None

# Cargar los productos desde la API de Node.js
productos = obtener_productos()

# Verificar el contenido del DataFrame
if productos is not None:
    print("Columnas en el DataFrame:", productos.columns.tolist())
    print("Primeras filas del DataFrame:\n", productos.head())
else:
    print("Error: No se pudieron cargar los productos desde la base de datos.")
    exit()

# Preparar los datos utilizando tanto el precio como la categoría codificada
X = productos[['precio', 'categoria_encoded']].values

# Inicializar el modelo KNN con más vecinos cercanos 
knn = NearestNeighbors(n_neighbors=5)
knn.fit(X)

@app.route('/recomendaciones_knn/<int:producto_id>', methods=['GET'])
def get_recommendations(producto_id):
    # Obtener el producto específico basado en el ID
    producto_actual = productos[productos['id'] == producto_id]

    if producto_actual.empty:
        return jsonify({"mensaje": f"Producto con ID {producto_id} no encontrado."}), 404

    # Calcular las recomendaciones basadas en el precio y la categoría
    distancia, indices = knn.kneighbors([[producto_actual['precio'].values[0], producto_actual['categoria_encoded'].values[0]]])

    # Obtener los productos recomendados
    productos_recomendados = productos.iloc[indices[0]].to_dict(orient='records')

    # Eliminar el producto actual de las recomendaciones (si está presente)
    productos_recomendados = [p for p in productos_recomendados if p['id'] != producto_id]

    # Imprimir las recomendaciones para verificar en la consola
    print(f"Recomendaciones para el producto {producto_id}:")
    for prod in productos_recomendados:
        print(f"ID: {prod['id']}, Nombre: {prod['nombre']}, Precio: {prod['precio']}, Categoría: {prod['categoria']}")

    # Devolver las recomendaciones como JSON
    return jsonify(productos_recomendados)

@app.route('/recomendaciones_categoria/<categoria>', methods=['GET'])
def get_recommendaciones_categoria(categoria):
    # Filtrar productos por categoría
    productos_categoria = productos[productos['categoria'].str.lower() == categoria.lower()]

    if productos_categoria.empty:
        return jsonify({"mensaje": f"No se encontraron productos para la categoría: {categoria}."}), 404

    # Convertir productos recomendados a JSON
    productos_recomendados = productos_categoria.to_dict(orient='records')

    return jsonify(productos_recomendados)

if __name__ == '__main__':
    print("Servidor Flask iniciado...")
    app.run(port=5001)
