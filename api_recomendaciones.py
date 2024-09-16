from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/recomendaciones', methods=['GET'])
def get_recommendations():
    # Aquí deberías tener la lógica de tus recomendaciones
    recomendaciones = [
        # Tu lista de productos recomendados
    ]
    return jsonify(recomendaciones)

if __name__ == '__main__':
    app.run(port=3000)  # Asegúrate de que el puerto coincida con tu configuración
