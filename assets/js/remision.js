Ext.onReady(function() {
    var socket = io.connect('http://192.168.0.205:4000');
    var url = "/agro/Remision/";

    // Obtener los parámetros de la URL
    var queryParams = new URLSearchParams(window.location.search);
    var transid = queryParams.get('transid');
    var piso = queryParams.get('piso');
    var bodega = queryParams.get('bodega');
    var observaciones = queryParams.get('observaciones');
    var id = queryParams.get('id');

    // Objeto para almacenar los valores de 'Picked'
    var pickedCounts = {};
    // Objeto para guardar los ordenes de las repeteciones de las referencias
    var duplicados = {};

    function actulizarRecogidos(reference) {
        var store = Ext.getCmp('tabla').getStore(); // Obtén la tienda asociada a la tabla
        var found = false;
        var repetido_agregado = false;
        var error = false;
    
        store.each(function(record) {
            var ref = record.get('Referencia');
            var orden = record.get('Orden');
            if (ref === reference) {
                if (found && !duplicados[ref])  // Primera referencia repetida
                {
                    duplicados[ref] = [];
                    duplicados[ref].push(orden);
                }
                else if (found && duplicados[ref])
                {
                    // Condicional para asegurar que en caso de referencias repetidas, estas sean actualizadas una a la vez
                    if (!duplicados[ref].includes(orden) && !repetido_agregado) // Preparar la siguiente referencia repetida a ser actualizada
                    {
                        duplicados[ref].push(orden);
                        repetido_agregado = true;
                    }
                    else if (duplicados[ref].includes(orden))
                    {
                        var currentPickedValue = pickedCounts[orden][ref];
                        var newPickedValue = currentPickedValue + record.get('Cantidad_Pedida');
            
                        // Asegurarse de que 'Picked' no sea mayor que 'Cantidad Pedida'
                        if (newPickedValue > record.get('Cantidad_Pedida') || newPickedValue > record.get('Existencias')) {
                            error = true;
                            record.set('Picked', pickedCounts[orden][ref]);
                        } else {
                            pickedCounts[orden][ref] = newPickedValue;
                            record.set('Picked', newPickedValue);
                            
                            Ext.Ajax.request({
                                url: url + 'actualizarPicked', 
                                method: 'POST',
                                params: {
                                    referencia: reference,
                                    cantidadAgregada: newPickedValue,
                                    orden: orden,
                                    transid: transid,
                                    piso: piso,
                                    observaciones: observaciones,
                                    id: id
                                },
                                success: function(response) {
                                    console.log('Cantidad agregada enviada exitosamente.');
                                },
                                failure: function(response) {
                                    console.error('Error al enviar la cantidad agregada.');
                                }
                            });

                            error = false;
                        }
                    }
                }
                else
                {
                    found = true; // Se encontró la referencia
        
                    var currentPickedValue = pickedCounts[orden][ref];
                    var newPickedValue = currentPickedValue + record.get('Cantidad_Pedida');
        
                    // Asegurarse de que 'Picked' no sea mayor que 'Cantidad Pedida'
                    if (newPickedValue > record.get('Cantidad_Pedida') || newPickedValue > record.get('Existencias')) {
                        error = true;
                        record.set('Picked', pickedCounts[orden][ref]);
                    } else {
                        pickedCounts[orden][ref] = newPickedValue;
                        record.set('Picked', newPickedValue);

                        Ext.Ajax.request({
                            url: url + 'actualizarPicked', // URL del controlador
                            method: 'POST',
                            params: {
                                referencia: reference,
                                cantidadAgregada: newPickedValue,
                                orden: orden,
                                transid: transid,
                                piso: piso,
                                observaciones: observaciones,
                                id: id
                            },
                            success: function(response) {
                                console.log('Cantidad agregada enviada exitosamente.');
                            },
                            failure: function(response) {
                                console.error('Error al enviar la cantidad agregada.');
                            }
                        });

                        error = false;
                    }
                } 
            } else if (pickedCounts[record.get('Orden')] && pickedCounts[record.get('Orden')][ref]) {
                record.set('Picked', pickedCounts[record.get('Orden')][ref]); // Mantén el valor de 'Picked' si ya fue modificado previamente
            }
        });

    
        if (error)
        {
            Ext.Msg.alert('Advertencia', 'No se puede agregar más items de esta referencia a la remisión.');
        }
    
        // Mostrar mensaje si no se encontró la referencia
        if (!found) {
            Ext.Msg.alert('Error', 'Referencia ingresada no se encuentra en esta remisión.');
        }

        
    }
    


var store = Ext.create('Ext.data.Store', {
    autoLoad: true, 
    fields: [
        { name: 'Orden', type: 'int'},
        { name: 'Ruta', type: 'int' },
        { name: 'Referencia', type: 'string' },
        { name: 'Localizacion', type: 'string' },
        { name: 'Descr', type: 'string' },
        { name: 'Cantidad_Pedida', type: 'int' },
        { name: 'Existencias', type: 'int' },
        { name: 'Referencia_Equivalente', type: 'string' },
        { name: 'Picked', type: 'int' }
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
    },
    listeners: {
        load: function(store) {
            // Iterar sobre los registros cargados
            store.each(function(record) {
                var referencia = record.get('Referencia');
                var orden = record.get('Orden');

                if (!pickedCounts[orden]) {
                    pickedCounts[orden] = {};
                }
                if (!pickedCounts[orden][referencia]) {
                    pickedCounts[orden][referencia] = record.get('Picked'); 
                }

                // Realizar una solicitud AJAX para obtener el valor de 'Picked'
                Ext.Ajax.request({
                    url: url + 'obtenerPicked', // URL del controlador
                    method: 'GET',
                    params: {
                        referencia: referencia,
                        orden: orden,
                        transid: transid
                    },
                    success: function(response) {
                        var data = Ext.decode(response.responseText);

                        // Si la consulta fue exitosa, asigna el valor de 'Picked'
                        if (data && data.picked) {
                            record.set('Picked', data.picked);
                        } else {
                            record.set('Picked', 0); 
                        }

                        if (!pickedCounts[orden]) {
                            pickedCounts[orden] = {};
                        }
                        
                        if (!pickedCounts[orden][referencia]) {
                            pickedCounts[orden][referencia] = record.get('Picked'); 
                        }
                    },
                    failure: function(response) {
                        console.error('Error al obtener el valor de Picked para la referencia:', referencia);
                    }
                });


            });
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
                                                        url: url + 'finalizarPicking',
                                                        method: 'POST',
                                                        params: {
                                                            transid: transid,
                                                            piso: piso,
                                                            observaciones: observaciones,
                                                            id: id
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
                        text: 'Orden',
                        dataIndex: 'Orden',
                        flex: 1,
                        hidden: true
                    },
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
                        text: 'Existencias',
                        dataIndex: 'Existencias',
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
                                    var referencia = record.get('Referencia');
                                    var orden = record.get('Orden');
                                    Ext.Ajax.request({
                                        url: url + 'obtenerPicked', // URL del controlador
                                        method: 'GET',
                                        params: {
                                            referencia: referencia,
                                            orden: orden,
                                            transid: transid
                                        },
                                        success: function(response) {
                                            var data = Ext.decode(response.responseText);
                    
                                            // Si la consulta fue exitosa, asigna el valor de 'Picked'
                                            if (data && data.picked) {
                                                record.set('Picked', data.picked);
                                            } else {
                                                record.set('Picked', 0); 
                                            }
                    
                                            if (!pickedCounts[orden]) {
                                                pickedCounts[orden] = {};
                                            }
                                            
                                            if (!pickedCounts[orden][referencia]) {
                                                pickedCounts[orden][referencia] = record.get('Picked'); 
                                            }
                                        },
                                        failure: function(response) {
                                            console.error('Error al obtener el valor de Picked para la referencia:', referencia);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            }),
        ]
    });
});
