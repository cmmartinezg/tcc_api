from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from surprise import SVD, Dataset, Reader
import requests

app = Flask(__name__)
CORS(app)

# Función para obtener las calificaciones desde la API
def obtener_calificaciones():
    try:
        response = requests.get('http://localhost:3000/api/calificaciones')
        response.raise_for_status()  # Asegura que la respuesta sea correcta (status code 200)
        # Imprimir el texto de la respuesta para depurar posibles problemas de JSON
        print("Respuesta de /api/calificaciones:", response.text)
        return pd.DataFrame(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener calificaciones: {e}")
        return pd.DataFrame()  # Retorna un DataFrame vacío en caso de error
    except ValueError:
        print("Error al decodificar JSON en /api/calificaciones")
        return pd.DataFrame()  # Retorna un DataFrame vacío si el JSON es inválido

# Entrenamiento del algoritmo SVD
def entrenar_svd(df_calificaciones):
    if df_calificaciones.empty:
        print("DataFrame de calificaciones vacío. No se puede entrenar el modelo.")
        return None
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df_calificaciones[['usuario_id', 'producto_id', 'calificacion']], reader)
    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)
    return algo

# Ruta para obtener recomendaciones excluyendo productos del comerciante
@app.route('/recomendaciones', methods=['GET'])
def recomendaciones():
    comerciante_id = request.args.get('comercianteId', type=int)
    df_calificaciones = obtener_calificaciones()
    algo = entrenar_svd(df_calificaciones)
    
    if algo is None:
        return jsonify({"error": "No se pudo entrenar el modelo debido a datos insuficientes"}), 500

    # Verificar si comerciante_id es None
    if comerciante_id is None:
        return jsonify({"error": "comercianteId no proporcionado"}), 400

    # Obtener productos del comerciante específico para excluir
    try:
        response = requests.get(f'http://localhost:3000/api/productos?comercianteId={comerciante_id}')
        response.raise_for_status()
        productos_comerciante = {producto['id'] for producto in response.json()}
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener productos del comerciante: {e}")
        return jsonify({"error": "Error al obtener productos del comerciante"}), 500
    except ValueError:
        print("Error al decodificar JSON en productos del comerciante.")
        return jsonify({"error": "Respuesta inválida de productos del comerciante"}), 500

    # Obtener todos los productos disponibles
    try:
        response = requests.get('http://localhost:3000/api/productos')
        response.raise_for_status()
        productos = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener productos: {e}")
        return jsonify({"error": "Error al obtener productos"}), 500
    except ValueError:
        print("Error al decodificar JSON en productos.")
        return jsonify({"error": "Respuesta inválida de productos"}), 500

    recomendaciones = []
    for producto in productos:
        if producto['id'] in productos_comerciante:
            continue
        prediccion = algo.predict(uid='global_user', iid=producto['id']).est
        producto['rating'] = prediccion
        recomendaciones.append(producto)

    # Ordenar las recomendaciones de mayor a menor rating
    recomendaciones = sorted(recomendaciones, key=lambda x: x['rating'], reverse=True)
    return jsonify(recomendaciones[:5])

# Ruta para obtener recomendaciones según categorías preferidas
@app.route('/recomendaciones_por_gustos', methods=['GET'])
def recomendaciones_por_gustos():
    usuario_id = request.args.get('usuarioId', type=int)
    df_calificaciones = obtener_calificaciones()
    algo = entrenar_svd(df_calificaciones)

    if algo is None:
        return jsonify({"error": "No se pudo entrenar el modelo debido a datos insuficientes"}), 500

    if usuario_id is None:
        return jsonify({"error": "usuarioId no proporcionado"}), 400

    # Obtener categorías preferidas del usuario
    gustos_url = f'http://localhost:3000/api/gustos?usuarioId={usuario_id}'
    try:
        response = requests.get(gustos_url)
        response.raise_for_status()
        categoria_ids = [gusto['categoria_id'] for gusto in response.json()]

        # Obtener los nombres de las categorías correspondientes a los IDs
        categorias_url = 'http://localhost:3000/api/categorias'
        response_categorias = requests.get(categorias_url)
        response_categorias.raise_for_status()
        categorias_data = {categoria['id']: categoria['nombre'] for categoria in response_categorias.json() if categoria['id'] in categoria_ids}
        categorias_preferidas = [nombre.lower() for nombre in categorias_data.values()]
        print("Categorías preferidas obtenidas:", categorias_preferidas)
        
    except requests.RequestException as e:
        print(f"Error al obtener gustos del usuario o categorías: {e}")
        return jsonify({"error": "Error al obtener gustos del usuario o categorías"}), 500
    except ValueError:
        print("Error al decodificar JSON en gustos o categorías.")
        return jsonify({"error": "Respuesta inválida de gustos o categorías"}), 500

    if not categorias_preferidas:
        return jsonify({"error": "No se encontraron gustos para este usuario"}), 404

    # Obtener productos que pertenecen a las categorías preferidas
    productos_url = 'http://localhost:3000/api/productos'
    try:
        response = requests.get(productos_url)
        response.raise_for_status()
        productos = [producto for producto in response.json() if producto['categoria'].lower() in categorias_preferidas]
        print("Productos filtrados:", productos)
        
    except requests.RequestException as e:
        print(f"Error al obtener productos: {e}")
        return jsonify({"error": "Error al obtener productos"}), 500
    except ValueError:
        print("Error al decodificar JSON en productos.")
        return jsonify({"error": "Respuesta inválida de productos"}), 500

    recomendaciones = []
    for producto in productos:
        prediccion = algo.predict(uid=usuario_id, iid=producto['id']).est
        producto['rating'] = prediccion
        recomendaciones.append(producto)

    recomendaciones = sorted(recomendaciones, key=lambda x: x['rating'], reverse=True)
    return jsonify(recomendaciones[:10])

if __name__ == '__main__':
    print("Servidor Flask SVD iniciado...")
    app.run(port=5002, debug=True)
