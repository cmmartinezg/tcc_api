from flask import Flask, jsonify, request
from flask_cors import CORS
from surprise import SVD, Dataset, Reader
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Permitir todas las solicitudes CORS

# Cargar los datos y entrenar el modelo
productos_df = pd.read_csv('productos.csv')
np.random.seed(42)
productos_df['rating'] = np.random.randint(1, 6, size=len(productos_df))

reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(productos_df[['id_comerciante', 'id', 'rating']], reader)

trainset = data.build_full_trainset()
algo = SVD()
algo.fit(trainset)

def obtener_productos_existentes(comerciante_id):
    productos_existentes = productos_df[productos_df['id_comerciante'] == comerciante_id]['id'].tolist()
    return productos_existentes

@app.route('/recomendaciones', methods=['GET'])
def get_recommendations():
    comerciante_id = request.args.get('comercianteId', type=int)
    
    # Obtener productos existentes del comerciante
    productos_existentes_ids = obtener_productos_existentes(comerciante_id)
    
    # Obtener recomendaciones iniciales
    recomendaciones = [
        {'id': int(row['id']), 'nombre': row['nombre'], 'precio': row['precio'], 'rating': float(row['rating'])}
        for index, row in productos_df.iterrows()
    ]
    
    # Filtrar recomendaciones para no incluir productos ya almacenados
    recomendaciones_filtradas = [
        rec for rec in recomendaciones if rec['id'] not in productos_existentes_ids
    ]
    
    # Mostrar en la consola la cantidad de recomendaciones y detalles del algoritmo
    print(f"Total de recomendaciones generadas: {len(recomendaciones_filtradas)}")
    print(f"Algoritmo utilizado: SVD")
    print(f"Total de productos en la base de datos: {len(productos_df)}")
    print(f"Productos existentes del comerciante (ID {comerciante_id}): {productos_existentes_ids}")
    print("Recomendaciones generadas:")
    for rec in recomendaciones_filtradas:
        print(f"Producto ID: {rec['id']}, Nombre: {rec['nombre']}, Precio: {rec['precio']}, Calificación: {rec['rating']}")

    return jsonify(recomendaciones_filtradas)

if __name__ == '__main__':
    app.run(debug=True)
