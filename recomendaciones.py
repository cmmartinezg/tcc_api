# from flask import Flask, jsonify, request
# from surprise import Dataset, Reader, SVD
# import pandas as pd
# import numpy as np

# app = Flask(__name__)

# # Cargar los datos y entrenar el modelo de recomendaciones
# productos_df = pd.read_csv('productos.csv')
# np.random.seed(42)
# productos_df['rating'] = np.random.randint(1, 6, size=len(productos_df))

# reader = Reader(rating_scale=(1, 5))
# data = Dataset.load_from_df(productos_df[['id_comerciante', 'id', 'rating']], reader)

# trainset = data.build_full_trainset()
# algo = SVD()
# algo.fit(trainset)

# @app.route('/recomendaciones', methods=['GET'])
# def get_recommendations():
#     # Obtener todas las recomendaciones basadas en productos similares sin filtrar por comerciante
#     # Ajusta según cómo hayas implementado la lógica de recomendación
#     all_product_ids = productos_df['id'].unique()
    
#     # Ejemplo básico de predicción de rating para todos los productos
#     top_recommendations = []
#     for producto_id in all_product_ids:
#         prediccion = algo.predict(uid='global_user', iid=producto_id)  # 'global_user' es un marcador genérico
#         top_recommendations.append({'id': producto_id, 'rating': prediccion.est})
    
#     # Ordenar las recomendaciones por calificación predicha (descendente) y seleccionar los mejores
#     top_recommendations = sorted(top_recommendations, key=lambda x: x['rating'], reverse=True)[:10]
    
#     return jsonify(top_recommendations)

# if __name__ == '__main__':
#     app.run(port=5000)
