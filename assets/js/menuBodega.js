Ext.onReady(function () {
    // Base URL para redirección
    var baseUrl = "/agro/BodegaDespacho";

    // Crear la ventana con opciones de bodega
    var menuWindow = Ext.create('Ext.window.Window', {
        title: 'Seleccionar Bodega',
        modal: true,
        closable: false,
        draggable: false,
        resizable: false,
        width: 500,
        height: 310,
        layout: 'fit',
        items: [{
            xtype: 'form',
            id: 'menuForm',
            bodyPadding: 10,
            defaults: {
                xtype: 'button',
                margin: '10 0',
                width: '100%'
            },
            items: [
                {
                    text: 'Bodega A',
                    height: 100,
                    handler: function () {
                        redirectToBodega('A');
                    }
                },
                {
                    text: 'Bodega P1',
                    height: 100,
                    handler: function () {
                        redirectToBodega('P1');
                    }
                }
            ]
        }]
    });

    // Mostrar la ventana al cargar la página
    menuWindow.show();

    // Función para redirigir a la URL con el parámetro LocId
    function redirectToBodega(locId) {
        var queryParams = new URLSearchParams(window.location.search);
        queryParams.set('LocId', locId);

        // Redirigir a la nueva URL
        window.location.href = baseUrl + '?' + queryParams.toString();
    }
});
