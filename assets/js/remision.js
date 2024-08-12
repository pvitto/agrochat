Ext.onReady(function() {
    var socket = io.connect('http://192.168.0.205:4000');
    var url = "/agro/Remision/";

    // Obtener los parámetros de la URL
    var queryParams = new URLSearchParams(window.location.search);
    var transid = queryParams.get('transid');
    var piso = queryParams.get('piso');
    var bodega = queryParams.get('bodega');

    // Objeto para almacenar los valores de 'Picked'
    var pickedCounts = {};

    function actulizarRecogidos(reference) {
        var store = Ext.getCmp('tabla').getStore(); // Obtén la tienda asociada a la tabla
        var found = false;

        store.each(function(record) {
            var ref = record.get('Referencia');
            if (ref === reference) {
                found = true; // Se encontró la referencia
                var currentPickedValue = pickedCounts[ref] || record.get('Picked');
                var newPickedValue = currentPickedValue + 1;  

                // Asegurarse de que 'Picked' no sea mayor que 'Cantidad Pedida'
                if (newPickedValue > record.get('Cantidad_Pedida') || newPickedValue > record.get('Disp')) {
                    Ext.Msg.alert('Advertencia', 'No se puede agregar mas items de esta referencia a la remisión.');
                    record.set('Picked', pickedCounts[ref]);
                } else {
                    pickedCounts[ref] = newPickedValue;
                    record.set('Picked', newPickedValue); // Actualiza el valor de 'Picked' en la fila

                    Ext.Ajax.request({
                        url: url + 'actualizarPicked', // URL del controlador
                        method: 'POST',
                        params: {
                            referencia: reference,
                            cantidadAgregada: 1 // Puedes ajustar este valor según sea necesario
                        },
                        success: function(response) {
                            console.log('Cantidad agregada enviada exitosamente.');
                        },
                        failure: function(response) {
                            console.error('Error al enviar la cantidad agregada.');
                        }
                    });
                }
            } else if (pickedCounts[ref]) {
                record.set('Picked', pickedCounts[ref]); // Mantén el valor de 'Picked' si ya fue modificado previamente
            }
        });

        // Mostrar mensaje si no se encontró la referencia
        if (!found) {
            Ext.Msg.alert('Error', 'Referencia ingresada no se encuentra en esta remisión.');
        }
    }

    // Crear la tienda con los parámetros de la URL
    var store = Ext.create('Ext.data.Store', {
        autoLoad: false,
        fields: [
            { name: 'Ruta', type: 'int' },
            { name: 'Referencia', type: 'string' },
            { name: 'Localizacion', type: 'string' },
            { name: 'Descr', type: 'string' },
            { name: 'Cantidad_Pedida', type: 'int' },
            { name: 'Disp', type: 'int' },
            { name: 'Referencia_Equivalente', type: 'string' },
            { name: 'Picked', type: 'int' }  // Nueva columna para "Picked"
        ],
        proxy: {
            timeout: 600000,
            useDefaultXhrHeader: false,
            type: 'ajax',
            url: url + "obtenerReferencias",
            extraParams: {
                TransId: transid,
                Piso: piso,
                Bodega: bodega
            },
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    });

    Ext.create('Ext.container.Viewport', {
        layout: 'border',
        items: [
            Ext.create('Ext.grid.Panel', {
                id: 'tabla',
                width: '76%',
                region: 'center',
                iconCls: 'logo',
                title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Administración Bodega - Administrador',
                layout: 'fit',
                rowLines: true,
                split: true,
                columnLines: true,
                frame: true,
                features: [{ ftype: 'grouping' }],
                dockedItems: [
                    {
                        xtype: 'toolbar',
                        dock: 'top',
                        ui: 'footer',
                        layout: {
                            pack: 'left'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                labelWidth: 190,
                                id: 'fecha',
                                fieldLabel: 'Referencia:',
                                value: '',
                                editable: true,
                                width: 285
                            },
                            "-",
                            { 
                                minWidth: 80, 
                                text: 'Confirmar', 
                                iconCls: 'fas fa-sync-alt', 
                                hidden: false, 
                                handler: function() {
                                    var reference = Ext.getCmp('fecha').getValue();
                                    // Limpiar filtro y recargar la tienda
                                    Ext.getCmp('tabla').getStore().reload({
                                        callback: function() {
                                            // Actualizar los conteos después de recargar los datos
                                            actulizarRecogidos(reference);
                                        }
                                    });
                                } 
                            },
                            "->",
                            {
                                minWidth: 80,
                                text: 'Finalizar',
                                iconCls: 'fas fa-check',
                                hidden: false,
                                handler: function() {
                                    var store = Ext.getCmp('tabla').getStore();
                                    var allMatched = true;
                
                                    store.each(function(record) {
                                        if (record.get('Picked') !== record.get('Cantidad_Pedida')) {
                                            allMatched = false;
                                        }
                                    });
                
                                    if (allMatched) {
                                        Ext.Msg.confirm(
                                            'Confirmar Picking',
                                            '¿Quieres finalizar el picking de la orden ' + transid + '?',
                                            function(buttonId) {
                                                if (buttonId === 'yes') {
                                                    Ext.Ajax.request({
                                                        url: '/agro/BodegaItem/recibirConfirmacion',
                                                        method: 'POST',
                                                        params: {
                                                            transid: transid,
                                                        },
                                                        success: function(response) {
                                                            var result = Ext.decode(response.responseText);
                                                            if (result.success) {
                                                                window.location.href = 'bodegaitem';
                                                            } else {
                                                                Ext.Msg.alert('Error', result.message);
                                                            }
                                                        },
                                                        failure: function(response) {
                                                            Ext.Msg.alert('Error', 'No se pudo completar la solicitud.');
                                                        }
                                                    });
                                                }
                                            });
                                    } else {
                                        Ext.Msg.alert('Advertencia', 'Picking incompleto, cantidad de items recogidos no coincide con los pedidos.');
                                    }
                                }
                            }
                        ]
                    }
                ],
                store: store,
                columns: [
                    {
                        text: 'Ruta',
                        dataIndex: 'Ruta',
                        flex: 1
                    },
                    {
                        text: 'Referencia',
                        dataIndex: 'Referencia',
                        flex: 1
                    },
                    {
                        text: 'Localizacion',
                        dataIndex: 'Localizacion',
                        flex: 1
                    },
                    {
                        text: 'Descr',
                        dataIndex: 'Descr',
                        flex: 1
                    },
                    {
                        text: 'Disp',
                        dataIndex: 'Disp',
                        flex: 1
                    },
                    {
                        text: 'Cantidad Pedida',
                        dataIndex: 'Cantidad_Pedida',
                        flex: 1
                    },
                    {
                        text: 'Picked',
                        dataIndex: 'Picked',
                        flex: 1
                    },
                    {
                        text: 'Referencia Equivalente',
                        dataIndex: 'Referencia_Equivalente',
                        flex: 1
                    }
                ],
                listeners: {            
                    afterrender: function(view, eOpts) {
                        store.load({
                            callback: function() {
                                // Después de cargar, restaura los valores de 'Picked' desde el objeto pickedCounts
                                store.each(function(record) {
                                    var ref = record.get('Referencia');
                                    if (pickedCounts[ref]) {
                                        record.set('Picked', pickedCounts[ref]);
                                    }
                                });
                            }
                        });
                    }
                }
            }),
        ]
    });
});
