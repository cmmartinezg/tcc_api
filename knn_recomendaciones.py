import pandas as pd
from sqlalchemy import create_engine
from sklearn.neighbors import NearestNeighbors

# Conectar a la base de datos con SQLAlchemy
DATABASE_URL = "postgresql://Click%20Store_owner:zjCRdbrO4cg2@ep-restless-mountain-a5ljzzek.us-east-2.aws.neon.tech/Click%20Store?sslmode=require"
engine = create_engine(DATABASE_URL)

# Cargar los productos de la base de datos
query = "SELECT * FROM productos"
productos = pd.read_sql_query(query, engine)

# Verificar el contenido del DataFrame
print("Columnas en el DataFrame:", productos.columns.tolist())
print("Primeras filas del DataFrame:\n", productos.head())

# Preparar los datos para el algoritmo KNN
X = productos[['precio']].values
knn = NearestNeighbors(n_neighbors=3)  # Usar n_neighbors para el número de recomendaciones
knn.fit(X)

# Probar recomendaciones con un producto específico (por ejemplo, id=1)
producto_id = 1
producto_actual = productos[productos['id'] == producto_id]

if producto_actual.empty:
    print(f"Producto con ID {producto_id} no encontrado.")
else:
    distancia, indices = knn.kneighbors([[producto_actual['precio'].values[0]]])
    productos_recomendados = productos.iloc[indices[0]].to_dict(orient='records')
    print(f"Recomendaciones para el producto {producto_id}:")
    print(productos.iloc[indices[0]])
