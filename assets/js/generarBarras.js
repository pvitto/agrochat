function generateBarcode(itemId) {
    return new Promise((resolve, reject) => {
        try {
            var canvas = document.createElement('canvas');
            JsBarcode(canvas, itemId, {
                format: "CODE128",
                lineColor: "#000000",
                width: 2,
                height: 100,
                displayValue: true
            });
            var imgData = canvas.toDataURL('image/png');
            resolve(imgData);
        } catch (error) {
            reject(error);
        }
    });
}
