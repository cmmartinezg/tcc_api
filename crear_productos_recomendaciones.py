# import csv

# # Datos de ejemplo para el archivo CSV
# productos = [
#     {'id': 1, 'nombre': 'Producto A', 'precio': 100.0, 'categoria': 'Electrónica'},
#     {'id': 2, 'nombre': 'Producto B', 'precio': 150.5, 'categoria': 'Juguetes'},
#     {'id': 3, 'nombre': 'Producto C', 'precio': 99.9, 'categoria': 'Hogar'},
#     {'id': 4, 'nombre': 'Producto D', 'precio': 200.0, 'categoria': 'Electrónica'},
#     {'id': 5, 'nombre': 'Producto E', 'precio': 50.0, 'categoria': 'Libros'}
# ]

# # Definir el nombre del archivo
# archivo_csv = 'productos_recomendaciones.csv'

# # Definir las cabeceras del CSV
# cabeceras = ['id', 'nombre', 'precio', 'categoria']

# # Crear el archivo CSV y escribir los datos
# with open(archivo_csv, 'w', newline='', encoding='utf-8') as archivo:
#     writer = csv.DictWriter(archivo, fieldnames=cabeceras)
#     writer.writeheader()  # Escribir las cabeceras
#     writer.writerows(productos)  # Escribir los datos de los productos

# print(f"El archivo {archivo_csv} ha sido generado exitosamente.")
import pandas as pd

# Definir los datos de los productos
data = {
    "id": list(range(1, 21)),  # IDs del 1 al 20
    "nombre": [
        "Iphone", "Camara", "impresora", "Tv", "telefono 1234", "Monitor", 
        "Teclado", "Mouse", "Laptop Lenovo", "Tablet Samsung", 
        "Auriculares", "Smartwatch", "Silla Gamer", "Microfono", 
        "Cámara Web", "Router", "Proyector", "Parlante", "Disco Duro", "Memoria USB"
    ],
    "descripcion": [
        "Iphone pro", "Camara Canon", "impresora hp", "Samsung", "usado", 
        "LG 24 '' Monitor LG LED Full HD IPS con AMD", "Teclado mecánico RGB", "Mouse gaming", 
        "Laptop Lenovo i7", "Tablet Samsung Galaxy", "Auriculares Bluetooth", 
        "Smartwatch Samsung", "Silla Gamer Ergonómica", "Microfono condensador", 
        "Cámara Web HD", "Router Wifi 6", "Proyector 4K", "Parlante portátil", 
        "Disco Duro Externo 1TB", "Memoria USB 32GB"
    ],
    "precio": [
        900000000.00, 2000000.00, 4000000.00, 1000000.00, 500000000.00, 
        309.75, 150.00, 200.00, 4500000.00, 3000000.00, 
        1000.00, 5000.00, 200000.00, 15000.00, 10000.00, 
        2500.00, 50000.00, 30000.00, 400000.00, 250.00
    ],
    "id_comerciante": [51] * 20,
    "fecha_agregado": [
        "2024-08-03T17:38:56.215Z", "2024-08-03T17:40:27.057Z", "2024-08-03T17:42:58.291Z", 
        "2024-08-03T17:44:07.978Z", "2024-08-05T22:31:05.158Z", "2024-08-06T00:26:05.696Z", 
        "2024-08-07T12:31:00.123Z", "2024-08-08T14:20:15.234Z", "2024-08-09T16:15:25.987Z", 
        "2024-08-10T11:42:48.567Z", "2024-08-11T13:20:27.123Z", "2024-08-12T15:30:19.456Z", 
        "2024-08-13T09:45:31.789Z", "2024-08-14T17:15:42.987Z", "2024-08-15T19:22:55.234Z", 
        "2024-08-16T21:33:13.456Z", "2024-08-17T18:45:22.234Z", "2024-08-18T20:55:17.567Z", 
        "2024-08-19T22:10:35.123Z", "2024-08-20T23:12:48.789Z"
    ],
    "foto_url": [
        "https://th.bing.com/th/id/OIP.HoodR7IQkD-iz80js0kYxQHaEK?rs=1&pid=ImgDetMain",
        "https://i1.adis.ws/i/canon/3011C001AA_EOS-4000D-EF-S18-55-III-BK/3011c001aa_eos-4000d-ef-s18-55-iii-bk?w=1500&bg=gray95",
        "https://th.bing.com/th/id/OIP.VRcDupN-tX6Ad9waOXJmsQHaEa?rs=1&pid=ImgDetMain",
        "https://th.bing.com/th/id/R.589e7a200de60bff26b7b4845f3cc144?rik=07UReMUvrij8Iw&riu=http%3a%2f%2fimages.samsung.com%2fis%2fimage%2fsamsung%2fau_UA55HU7000WXXY_013_R-Perspective_black%3f%24TM-Gallery%24&ehk=ASsaKNW696b%2fHI0KAvP0sGGQv0BGdmi9Jp6mz%2fiUa6Y%3d&risl=&pid=ImgRaw&r=0",
        "https://static1.pocketlintimages.com/wordpress/wp-content/uploads/wm/2023/09/apple-iphone-15-pro-4.jpg",
        "https://www.lg.com/ec/images/monitores/md06248939/gallery/dm-1.jpg",
        "https://assets3.razerzone.com/Y3ynI5Iwy7gN7bAkmh2owQAEMvQ=/1500x1500/https%3A%2F%2Fdl.razer.com%2Fapplication%2Fimages%2Fproducts%2Fteclado.png",
        "https://cdn.mos.cms.futurecdn.net/vz4pRbXEKiP3CpkT6Sz2MH.jpg",
        "https://m.media-amazon.com/images/I/71AJK1DhzOS._AC_SL1500_.jpg",
        "https://images.samsung.com/is/image/samsung/p6pim/latin/galaxy-tab-a8/latin-feature----tablets-samsung-530x530-530x530.jpg",
        "https://th.bing.com/th/id/OIP.F0I8Lrh-3qaX8ICCNyA_1gHaHa?pid=ImgDet&rs=1",
        "https://images.samsung.com/is/image/samsung/p6pim/es/samsung-smartwatch-530x530.jpg",
        "https://cdn.mos.cms.futurecdn.net/ZGGib9GS45fKnD9NEcijFN-1200-80.jpg",
        "https://th.bing.com/th/id/OIP.PpTEw4msFmhZyNInQZoUTwHaFF?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP.9OmhA3hz5v_ezB5kg8u-KwHaFV?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP.KUGzJPM4LLw9AWZwEjIgMgHaFM?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP.WxJ3ZGqAcmcJeI1m7mZq8QHaD4?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP._NZZ7uvJxS7MsrAE-9g1YQHaGv?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP.0WXtxoBtQkL1bG23OG6j5AHaEc?pid=ImgDet&rs=1",
        "https://th.bing.com/th/id/OIP.RVzUuM-Vw13G1HeOb5HsJwHaHa?pid=ImgDet&rs=1"
    ]
}

# Crear el DataFrame
productos_df = pd.DataFrame(data)

# Guardar como CSV
productos_df.to_csv("productosknn_ampliado.csv", index=False)
print("Archivo CSV generado con éxito.")
