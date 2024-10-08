from flask import Flask, jsonify
from flask_cors import CORS  # Importar CORS
import pandas as pd
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Cargar los datos del CSV
data = pd.read_csv('productos_actualizados.csv')

# Imprimir las columnas para verificar
print("Columnas encontradas en el CSV:", data.columns)

# Convertir el ID del producto a entero
data['id'] = data['id'].astype(int)

# Extraer las características necesarias
features = ['precio']  # Puedes agregar más características si es necesario

# Inicializar el modelo KNN
knn = NearestNeighbors(n_neighbors=5, metric='euclidean')
knn.fit(data[features])

@app.route('/recomendaciones_knn/<int:product_id>', methods=['GET'])
def get_recommendations(product_id):
    # Obtener el producto correspondiente por ID
    product_idx = data.index[data['id'] == product_id].tolist()
    
    if not product_idx:
        return jsonify([]), 404  # Retornar una lista vacía si no se encuentra el ID

    product_idx = product_idx[0]

    # Calcular las recomendaciones
    distances, indices = knn.kneighbors([data.iloc[product_idx][features]])
    
    # Obtener los productos recomendados
    recommended_products = data.iloc[indices[0]].to_dict(orient='records')

    # Eliminar el producto original de las recomendaciones
    recommended_products = [p for p in recommended_products if p['id'] != product_id]

    # Imprimir los productos recomendados en la consola para verificar
    print(f"Recomendaciones para el producto con ID {product_id}:")
    for prod in recommended_products:
        print(f"ID: {prod['id']}, Nombre: {prod['nombre']}, Precio: {prod['precio']}")

    # Devolver las recomendaciones como JSON
    return jsonify(recommended_products)

if __name__ == '__main__':
    print("Servidor Flask iniciado. Probando recomendaciones en el servidor...")
    app.run(port=5001)
