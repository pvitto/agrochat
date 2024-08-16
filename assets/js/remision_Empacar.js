Ext.onReady(function() {
    var socket = io.connect('http://192.168.0.205:4000');
    var url = "/agro/Remision_Empacar/";

    // Obtener los parámetros de la URL
    var queryParams = new URLSearchParams(window.location.search);
    var transid = queryParams.get('transid');
    var piso = queryParams.get('piso');
    var bodega = queryParams.get('bodega');

    // Objeto para almacenar los valores de 'Picked'
    var packedCounts = {};
    // Objeto para guardar los ordenes de las repeteciones de las referencias
    var duplicados = {};

    function actualizarRecogidos(reference) {
        var store = Ext.getCmp('tabla').getStore();
        var found = false;
        var packed = false;

        var value_packed = null;
        var orden_packed = null;
        var referencia_packed = null;
    
        store.each(function(record) {
            var ref = record.get('Referencia');
            var orden = record.get('Orden');
    
            if (ref === reference) {
                found = true;

                if (!packedCounts[orden]) {
                    packedCounts[orden] = {};
                }
                
                if (!packedCounts[orden][ref]) {
                    packedCounts[orden][ref] = record.get('Packed'); 
                }
    
                // Si la referencia ya fue encontrada antes y no está en duplicados, inicializa duplicados[ref]
                if (!duplicados[ref]) {
                    duplicados[ref] = [];
                }
    
                // Añadir la orden si no está en duplicados[ref] y ordenar
                if (!duplicados[ref].includes(orden)) {
                    duplicados[ref].push(orden);
                    duplicados[ref].sort((a, b) => a - b); // Ordenar ascendentemente
                }
    
                // Obtener la orden con el número más pequeño (primera posición del array)
                var menorOrden = duplicados[ref][0];
    
                // Solo actualiza si es la orden más pequeña
                if (orden === menorOrden) {
                    var currentPackedValue = packedCounts[orden][ref];
                    var newPackedValue = currentPackedValue + record.get('Picked');
    
                    // Asegurarse de que 'Picked' no sea mayor que 'Cantidad Pedida' o 'Existencias'
                    if (newPackedValue > record.get('Picked') || newPackedValue > record.get('Existencias')) {
                        record.set('Packed', packedCounts[orden][ref]);
                        duplicados[ref].shift();
                    }
                    else
                    {
                        value_packed = newPackedValue;
                        orden_packed = orden;
                        referencia_packed = ref;

                        packed = true;
                    }
                        
                }
            } else if (packedCounts[record.get('Orden')] && packedCounts[record.get('Orden')][ref]) {
                record.set('Packed', packedCounts[record.get('Orden')][ref]); // Mantén el valor de 'Picked' si ya fue modificado previamente
            }
        });
    
        if (!packed) {
            Ext.Msg.alert('Advertencia', 'No hay más items de esta referencia por empacar.');
        }
        else
        {
            packedCounts[orden_packed][referencia_packed] = value_packed;
            
            enviarCantidad(referencia_packed, value_packed, duplicados[referencia_packed][0]);

            duplicados[referencia_packed].shift();

            store.commitChanges();
            store.reload();
        }
    
        if (!found) {
            Ext.Msg.alert('Error', 'Referencia ingresada no se encuentra en esta remisión.');
        }
    }
    
    function enviarCantidad(reference, newPackedValue, orden) {
        Ext.Ajax.request({
            url: url + 'actualizarPicked', 
            method: 'POST',
            params: {
                referencia: reference,
                cantidadAgregada: newPackedValue,
                orden: orden,
                transid: transid,
                piso: piso
            },
            success: function(response) {
                console.log('Cantidad agregada enviada exitosamente.');
            },
            failure: function(response) {
                console.error('Error al enviar la cantidad agregada.');
            }
        });
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
        { name: 'Picked', type: 'int' },
        { name: 'Packed', type: 'int' }
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
                                    var store = Ext.getCmp('tabla').getStore();
                                    var found = false;
                                    var picked = false;
                                    var full = false;
                                    var siguienteCantidadPedida = null;
                                    var siguienteOrden = null;
                            
                                    store.each(function(record) {
                                        var ref = record.get('Referencia');
                                        var cantidad = record.get('Picked');
                                        var pickedValue = record.get('Packed');
                                        var existenciasValue = record.get('Existencias');
                            
                                        if (ref === reference) {
                                            found = true;
                            
                                            if (pickedValue == 0) {
                                                picked = true;
                                                full = false;
                                            }
                            
                                            if (cantidad <= pickedValue || cantidad > existenciasValue) {
                                                if (!picked) {
                                                    full = true;
                                                }
                                            }
                                        }
                                    });
                            
                                    if (found) {
                                        // Encontrar el siguiente registro a ser actualizado
                                        store.each(function(record) {
                                            var ref = record.get('Referencia');
                                            var orden = record.get('Orden');
                                            var cantidad = record.get('Picked');
                                            var pickedValue = record.get('Packed');
                            
                                            if (ref === reference && pickedValue == 0 && (siguienteCantidadPedida === null || orden < siguienteOrden)) {
                                                siguienteCantidadPedida = cantidad;
                                                siguienteOrden = orden;
                                            }
                                        });
                            
                                        if (!full) {
                            
                                            Ext.Msg.confirm(
                                                'Confirmar Cantidad',
                                                '¿Quiere confirmar ' + siguienteCantidadPedida + ' de la referencia: ' + reference + ' de orden ' + siguienteOrden + '?',
                                                function(buttonId) {
                                                    if (buttonId === 'yes') {
                                                        // Llamar a la función actualizarRecogidos() si el usuario confirma
                                                        actualizarRecogidos(reference);
                                                    }
                                                }
                                            );
                                        } else {
                                            Ext.Msg.alert('Advertencia', 'No hay más items de esta referencia por empacar.');
                                        }
                                    } else {
                                        Ext.Msg.alert('Error', 'Referencia ingresada no se encuentra en esta remisión.');
                                    }
                                }
                            }
                            ,
                            "-",
                                {
                                    xtype: 'button',
                                    minWidth: 80,
                                    text: 'Reiniciar Empacado',
                                    iconCls: 'fas fa-sign-out-alt',
                                    handler: function() {
                                        Ext.Msg.confirm(
                                            'Reiniciar Empacado',
                                            '¿Quieres Reiniciar el Empacado de la orden ' + transid + '?',
                                            function(buttonId) {
                                                if (buttonId === 'yes') {
                                                    Ext.Ajax.request({
                                                        url: url + 'reiniciarPicking',
                                                        method: 'POST',
                                                        params: {
                                                            transid: transid
                                                        },
                                                        success: function(response) {
                                                            var result = Ext.decode(response.responseText);
                                                            if (result.success) {
                                                                window.location.reload();
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
                                        if (record.get('Packed') !== record.get('Picked')) {
                                            allMatched = false;
                                        }
                                    });
                
                                    if (allMatched) {
                                        Ext.Msg.confirm(
                                            'Confirmar Empacado',
                                            '¿Quieres finalizar el empacado de la orden ' + transid + '?',
                                            function(buttonId) {
                                                if (buttonId === 'yes') {
                                                    Ext.Ajax.request({
                                                        url: url + 'finalizarPicking',
                                                        method: 'POST',
                                                        params: {
                                                            transid: transid,
                                                            piso: piso
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
                                        Ext.Msg.alert('Advertencia', 'Empacado incompleto, faltan items por empacar.');
                                    }
                                }
                            },
                            "-",
                        {
                            xtype: 'button',
                            minWidth: 80,
                            text: 'Inicio',
                            iconCls: 'fas fa-home',
                            handler: function() {
                                Ext.Msg.confirm(
                                    'Volver al Menú de Bodega',
                                    '¿Está seguro que desea volver al menú de Bodega?',
                                    function(buttonId) {
                                        if (buttonId === 'yes') {
                                            window.location.href = 'bodegaitem'; 
                                        }
                                    }
                                );
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
                        flex: 1
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
                        text: 'Packed',
                        dataIndex: 'Packed',
                        flex: 1
                    },
                    {
                        text: 'Referencia Equivalente',
                        dataIndex: 'Referencia_Equivalente',
                        flex: 1
                    }
                ]
            }),
        ]
    });
});
