import subprocess
import time

try:
    # Iniciar el servidor de Node.js
    print("Iniciando el servidor de Node.js...")
    node_process = subprocess.Popen(['node', 'app.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Esperar un momento para asegurarse de que el servidor esté en funcionamiento
    time.sleep(5)

    # Ejecutar los scripts de Python en paralelo
    print("Ejecutando recomendaciones_knn.py...")
    knn_process = subprocess.Popen([r'C:\Users\carlo\tcc_api\venv\Scripts\python.exe', 'recomendaciones_knn.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    print("Ejecutando recomendaciones_svd.py...")
    svd_process = subprocess.Popen([r'C:\Users\carlo\tcc_api\venv\Scripts\python.exe', 'recomendaciones_svd.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Esperar a que terminen los procesos de Python y obtener su salida
    knn_stdout, knn_stderr = knn_process.communicate()
    svd_stdout, svd_stderr = svd_process.communicate()

    # Imprimir la salida de los scripts
    print("Salida de recomendaciones_knn.py:")
    print(knn_stdout.decode())
    print("Errores de recomendaciones_knn.py:")
    print(knn_stderr.decode())

    print("Salida de recomendaciones_svd.py:")
    print(svd_stdout.decode())
    print("Errores de recomendaciones_svd.py:")
    print(svd_stderr.decode())

except Exception as e:
    print(f"Ocurrió un error: {e}")

finally:
    # Terminar el proceso del servidor de Node.js
    if 'node_process' in locals():
        print("Terminando el servidor de Node.js...")
        node_process.terminate()