import subprocess

def ejecutar_knn():
    print("Ejecutando KNN...")
    subprocess.Popen([r".\venv_knn\Scripts\python", "recomendaciones_knn.py"])

def ejecutar_svd():
    print("Ejecutando SVD...")
    subprocess.Popen([r".\venv_svd\Scripts\python", "recomendaciones_svd.py"])

if __name__ == "__main__":
    ejecutar_knn()
    ejecutar_svd()
