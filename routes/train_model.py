import pandas as pd
import psycopg2
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate

# Conectar a la base de datos y obtener las valoraciones
# Reemplaza esto con el código para obtener tus datos
# por ejemplo, utilizando pandas para leer desde tu base de datos
data = pd.read_csv('ruta_a_tus_valoraciones.csv')

# Preparar los datos para Surprise
reader = Reader(rating_scale=(1, 5))
dataset = Dataset.load_from_df(data[['user_id', 'item_id', 'rating']], reader)

# Dividir los datos en conjuntos de entrenamiento y prueba
trainset, testset = train_test_split(dataset, test_size=0.25)

# Utilizar SVD para entrenar el modelo
algo = SVD()
algo.fit(trainset)

# Evaluar el modelo
predictions = algo.test(testset)
accuracy.rmse(predictions)

# Guardar el modelo entrenado
# Conectar a la base de datos
conn = psycopg2.connect(
    host="tu-host",
    database="Click Store",
    user="tu-usuario",
    password="tu-contraseña"
)

# Ejecutar la consulta para obtener los datos de valoraciones
query = "SELECT user_id, item_id, rating FROM valoraciones"
data = pd.read_sql_query(query, conn)

# Cerrar la conexión
conn.close()

# Preparar los datos para Surprise
reader = Reader(rating_scale=(1, 5))
dataset = Dataset.load_from_df(data[['user_id', 'item_id', 'rating']], reader)
# Usar SVD para entrenar el modelo
algo = SVD()
cross_validate(algo, dataset, measures=['RMSE', 'MAE'], cv=5, verbose=True)

# Entrenar el modelo en todo el conjunto de datos
trainset = dataset.build_full_trainset()
algo.fit(trainset)

# Guardar el modelo entrenado para su uso posterior
import pickle
with open('svd_model.pkl', 'wb') as f:
    pickle.dump(algo, f)
