from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from surprise import SVD, Dataset, Reader
import requests

app = Flask(__name__)
CORS(app)

def obtener_calificaciones():
    response = requests.get('http://localhost:3000/api/calificaciones')
    return pd.DataFrame(response.json())

def entrenar_svd(df_calificaciones):
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df_calificaciones[['usuario_id', 'producto_id', 'calificacion']], reader)
    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)
    return algo

@app.route('/recomendaciones', methods=['GET'])
def recomendaciones():
    comerciante_id = request.args.get('comercianteId', type=int)
    algo = entrenar_svd(obtener_calificaciones())

    productos = requests.get(f'http://localhost:3000/api/productos?comercianteId={comerciante_id}').json()
    recomendaciones = []

    for producto in productos:
        prediccion = algo.predict(uid='global_user', iid=producto['id']).est
        producto['rating'] = prediccion
        recomendaciones.append(producto)

    recomendaciones = sorted(recomendaciones, key=lambda x: x['rating'], reverse=True)
    return jsonify(recomendaciones[:5])

if __name__ == '__main__':
    print("Servidor Flask SVD iniciado...")
    app.run(port=5002, debug=True)
