from flask import Flask, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder
import os

os.environ["LOKY_MAX_CPU_COUNT"] = "1"  # Evita conflictos con múltiples hilos

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

        # Asegurarnos de que el precio sea numérico
        df_productos['precio'] = pd.to_numeric(df_productos['precio'], errors='coerce')

        # Codificar las categorías a valores numéricos
        label_encoder = LabelEncoder()
        df_productos['categoria_encoded'] = label_encoder.fit_transform(df_productos['categoria'])

        return df_productos
    except Exception as e:
        print(f"Error al obtener los productos desde la API de Node.js: {e}")
        return None

# Cargar los productos desde la API
productos = obtener_productos()

# Verificar el contenido del DataFrame
if productos is not None:
    print("Columnas en el DataFrame:", productos.columns.tolist())
    print("Primeras filas del DataFrame:\n", productos.head())
else:
    print("Error: No se pudieron cargar los productos.")
    exit()

# Preparar los datos para KNN
X = productos[['precio', 'categoria_encoded']].values
knn = NearestNeighbors(n_neighbors=5)
knn.fit(X)

# Ruta para obtener recomendaciones basadas en un producto específico
@app.route('/recomendaciones_knn/<int:producto_id>', methods=['GET'])
def get_recommendations(producto_id):
    producto_actual = productos[productos['id'] == producto_id]

    if producto_actual.empty:
        return jsonify({"mensaje": f"Producto con ID {producto_id} no encontrado."}), 404

    categoria_actual = producto_actual['categoria'].values[0]
    productos_categoria = productos[productos['categoria'] == categoria_actual]

    if len(productos_categoria) <= 1:
        return jsonify({"mensaje": f"No hay suficientes productos en la categoría: {categoria_actual}."}), 404

    X_categoria = productos_categoria[['precio', 'categoria_encoded']].values
    knn = NearestNeighbors(n_neighbors=min(5, len(X_categoria)))
    knn.fit(X_categoria)

    distancia, indices = knn.kneighbors([[producto_actual['precio'].values[0], 
                                          producto_actual['categoria_encoded'].values[0]]])

    productos_recomendados = productos_categoria.iloc[indices[0]].to_dict(orient='records')
    productos_recomendados = [p for p in productos_recomendados if p['id'] != producto_id]

    return jsonify(productos_recomendados)

# Ruta para obtener recomendaciones basadas en una categoría específica
@app.route('/recomendaciones_categoria/<categoria>', methods=['GET'])
def get_recommendaciones_categoria(categoria):
    productos_categoria = productos[productos['categoria'].str.lower() == categoria.lower()]

    if productos_categoria.empty:
        return jsonify({"mensaje": f"No se encontraron productos para la categoría: {categoria}."}), 404

    productos_recomendados = productos_categoria.to_dict(orient='records')

    return jsonify(productos_recomendados)

if __name__ == '__main__':
    print("Servidor Flask KNN iniciado...")
    app.run(port=5001, debug=True)
