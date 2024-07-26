from barcode import Code128
from barcode.writer import ImageWriter
import base64
from io import BytesIO
import sys

def generar_codigo_barras(texto):
    try:
        # Genera el código de barras Code128
        codigo_barras = Code128(texto, writer=ImageWriter())

        # Guarda el código de barras en un objeto BytesIO
        buffer = BytesIO()
        codigo_barras.write(buffer)
        
        # Codifica la imagen en base64
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Imprime la imagen codificada en base64
        print(imagen_base64)
        
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No se proporcionó el texto para el código de barras", file=sys.stderr)
        sys.exit(1)

    texto = sys.argv[1]

    generar_codigo_barras(texto)
