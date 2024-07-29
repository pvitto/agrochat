
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const fs = require('fs');

// Recupera la referencia del primer argumento (pasado por el controlador PHP)
const referencia = process.argv[2];

if (!referencia) {
    console.error('Referencia no proporcionada');
    process.exit(1);
}

// Crea un canvas para dibujar el código de barras
const canvas = createCanvas();
JsBarcode(canvas, referencia, {
    format: "CODE128",
    lineColor: "#000000",
    width: 2,
    height: 100,
    displayValue: true
});

// Obtén la imagen en formato base64
const imgData = canvas.toDataURL('image/png');

// Imprime el resultado (esto se captura en el controlador PHP)
console.log(imgData);
