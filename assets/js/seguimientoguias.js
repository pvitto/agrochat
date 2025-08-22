//depurar

Ext.onReady(function () {
    var socket = io.connect('http://192.168.0.205:4000');//dudas
    // URL base declarando 
    var url = "/agro/BodegaGuias/";

    // tipo de consulta (4 representa guias despachadas, esto nos sirve para los filtros)
    const tipo = 4;

    // store principal que carga todas las guias de despacho
    var storeGuias = Ext.create('Ext.data.Store', {
        autoLoad: true, // se carga automaticamente al iniciar
        fields: [
            "TransId", "FechaTransaccion", "FechaImpresion", "IdCliente",
            "Cliente", "Rep2id", "Vendedor", "EstadoTransaccion", "Observaciones",
            "TipoEnvio",  "Transportadora", "Guia", "Administrador",
            "Operario", "Id", "Fecha", "TipoGuia","Flete", "ValorFlete", "Proceso","Bodega", "Piso"
        ],
        proxy: {
            type: "ajax",
            url: url + "obtenerPickedList",
            extraParams: {
                Tipo: tipo,
                Fecha: Ext.Date.format(new Date(), 'd/m/Y'), // filtra inicialmente por la fecha actual
                Bodega: 'Todos' // todas las bodegas inicialmente
            },
            reader: {
                type: "json",
                rootProperty: "data" // ruta del JSON donde vienen los datos
            }
        },
        /**/ //contador para saber cuantas tengo, si borro esto se quita
      // listener que se ejecuta cuando el store (la tabla) termina de cargar los datos

/**/
    });

    // enlace de rastreo dependiendo de la transportadora
     //si la transportadora no soporta enlace directo, devuelve la URL principal
    function obtenerLinkTransportadora(nombre, guia) {
        let url = "";
        let nombreLower = nombre.toLowerCase();

        if (nombreLower.includes("chevalier")) {
            url = `https://chevalier.fivesoft.com.co/tag_detail_v1.html?d=${guia}`;
        } else if (nombreLower.includes("tcc")) {
            url = `https://tcc.com.co/courier/mensajeria/rastrear-envio/`;
        } else if (nombreLower.includes("servientrega")) {
            url = `https://www.servientrega.com/wps/portal/rastreo-envio`;
        } else if (nombreLower.includes("coordinadora")) {
            url = `https://coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${guia}`;
        } else if (nombreLower.includes("interrapidisimo")) {
            url = `https://interrapidisimo.com/sigue-tu-envio/`;
        } else if (nombreLower.includes("deprisa")) {
            url = `https://www.deprisa.com/Tracking/?track=${guia}`;
        } else if (nombreLower.includes("berlinas")) {
            url = `https://transcargaberlinas.gelotra.com/rastreo?guia=${guia}`;
        } else if (nombreLower.includes("encoexpress")) {
            url = `https://seguimientoguias.encoexpres.co/?numerog=${guia}`;
        } else if (nombreLower.includes("rapido ochoa")) {
            url = `https://rapidoochoa.tmsolutions.com.co/tmland/faces/public/tmland-carga/cotizador_envios.xhtml?parametroInicial=cmFwaWRvb2Nob2E=`;
        }
        return url;
    }

    // construccion del viewport principal con su grid
    Ext.create('Ext.container.Viewport', {//inst a class, method, de extJS
        layout: 'fit',
        items: [{
            xtype: 'grid',
            id: 'tabla',
            title: '<img src="/agro/assets/img/logo.png" style="height:20px; vertical-align:middle; margin-right:8px;"> Guias Despachadas - Vista para Asesores',
            frame: true,
            store: storeGuias,
            selModel: { selType: 'cellmodel' }, // 
            columnLines: true, 
            viewConfig: {
                listeners: {
                    // al expandir una fila, se carga su detalle (sub-grid)
                    expandbody: function (rowNode, record) {
                        Ext.Ajax.request({
                            method: 'GET',
                            url: url + "obtenerReferencias",
                            params: {
                                TransId: record.get('TransId'),
                                Bodega: record.get('Bodega'),
                                Piso: record.get('Piso')
                            },
                            success: function (response) {
                                var obj = JSON.parse(response.responseText);
                                Ext.getCmp(rowNode.rows[1].childNodes[1].childNodes[0].childNodes[0].id).store.setData(obj.data);
                            },
                            failure: function (response) {
                                console.error('Error al cargar items:', response.status);
                            }
                        });
                    }
                },
                enableTextSelection: true, // permite copiar contenido (clic derecho, doble clic)
                loadMask: { msg: 'Cargando guias despachadas...' } 
            },
            features: [{ ftype: 'grouping' }], 
            plugins: [{
                ptype: 'rowwidget', // plugin para mostrar detalles expandibles
                widget: {
                    xtype: 'grid',
                    bind: {
                        store: Ext.create('Ext.data.Store', {
                            autoLoad: false,
                            fields: [
                                { name: 'Referencia', type: 'string' },
                                { name: 'Descr', type: 'string' },
                                { name: 'Cantidad_Pedida', type: 'int' },
                                { name: 'Referencia_Equivalente', type: 'string' }
                            ],
                            data: []
                        })
                    },
                    columns: [
                        { text: 'Referencia', dataIndex: 'Referencia', flex: 1 },
                        { text: 'Descr', dataIndex: 'Descr', flex: 1 },
                        {
                            text: 'Cantidad Pedida',
                            dataIndex: 'Cantidad_Pedida',
                            flex: 1,
                            renderer: function (val) {
                                // transforma el numero quitandole los 0 de mas que tenia para ahora verse mas estetico
                                return parseFloat(val).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                            }
                        }
                    ]
                }
            }],
            columns: [ //aqui vemos como esta construida cada columna del grid principal.
                { header: 'Remision', dataIndex: 'TransId', width: 120 },
                {
                    header: 'Bodega',
                    dataIndex: 'Bodega',
                    width: 80,
                    renderer: function (value) {
                        let val = (value || '').toString().trim().toUpperCase();
                        let clase = '';
                        let texto = val;
                        if (val === 'P1') clase = 'bodega-P1';
                        else if (val === 'A') clase = 'bodega-A';
                        else { clase = 'bodega-null'; texto = ' '; }
                        return `<span class="${clase}">${texto}</span>`;
                    }
                },
                {
                    header: 'Proceso',
                    dataIndex: 'Proceso',
                    minWidth: 110,
                    renderer: function () {
                        return '<span class="despachado">Despachado</span>';
                    }
                    
                },
                    /*{
                    header: 'Proceso',
                    dataIndex: 'Proceso',
                    minWidth: 140,
                    renderer: function (value, metaData) {
                        switch (value) {
                            case 1:
                                metaData.tdCls = 'pordespacho';
                                return 'Por Despacho';
                            case 2:
                                metaData.tdCls = 'despachado';
                                return 'Despachado';
                            case 3:
                                metaData.tdCls = 'ubicado';
                                return 'Ubicado';
                            default:
                                return 'Desconocido';
                        }
                    }*/
                
                    
                { header: 'Cliente', dataIndex: 'Cliente', flex: 1, minWidth: 250 },
                { header: 'Vendedor', dataIndex: 'Vendedor', minWidth: 100 },
                { header: 'Guia', dataIndex: 'Guia', minWidth: 160 },
                {
                    header: 'Transportadora',
                    dataIndex: 'Transportadora',
                    minWidth: 200,
                    renderer: function (val, meta, record) {//modifico como se ve
                        const guia = record.get('Guia');
                        const nombre = val.toLowerCase();
                        let clase = '';
                        if (nombre.includes("servientrega")) clase = 'color-servientrega';
                        else if (nombre.includes("coordinadora")) clase = 'color-coordinadora';
                        else if (nombre.includes("chevalier")) clase = 'color-chevalier';
                        else if (nombre.includes("tcc")) clase = 'color-tcc';
                        else if (nombre.includes("rapido ochoa")) clase = 'color-rapidoochoa';
                        else if (nombre.includes("berlinas")) clase = 'color-berlinas';
                        else if (nombre.includes("deprisa")) clase = 'color-deprisa';
                        else if (nombre.includes("encoexpress")) clase = 'color-encoexpress';
                        else if (nombre.includes("interrapidisimo")) clase = 'color-interrapidisimo';
                        const link = obtenerLinkTransportadora(val, guia);
                        return link ? `<a href="${link}" target="_blank" class="${clase}">${val}</a>` : `<span>${val}</span>`;
                    }
                },
                { header: 'TipoGuia', dataIndex: 'TipoGuia', minWidth: 140 },
                { header: 'Flete', dataIndex: 'Flete', minWidth: 140 },
                {
                    header: 'Valor Flete',
                    dataIndex: 'ValorFlete',
                    minWidth: 130,
                    renderer: val => (val ? parseInt(val).toLocaleString('es-CO') : '0') //colocando estetico el campo colocando decimales donde corresponde en valores COP
                },
               
                { header: 'Observaciones', dataIndex: 'Observaciones', flex: 1, minWidth: 240 },
                {
                    header: 'Fecha Despacho',
                    dataIndex: 'Fecha',
                    minWidth: 200,
                    renderer: function (val) {
                        if (!val) return '';
                        let fecha = val.split(' ')[0];
                        let hora = val.split(' ')[1] || '00:00:00';
                        return fecha + ' ' + hora;
                    }
                },
                { header: 'Fecha Impresion', dataIndex: 'FechaImpresion', minWidth: 160 },
                { header: 'Operario', dataIndex: 'Operario', minWidth: 150 },
                { header: 'Administrador', dataIndex: 'Administrador', minWidth: 150 }
           
                
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Fecha',
                        id: 'fechaFiltro',
                        editable: false,
                        value: new Date(),
                        format: 'd/m/Y',
                        listeners: {
                            change: function () {
                                // al cambiar fecha, limpiamos campo de remision
                                Ext.getCmp('remisionFiltro').setValue('');
                                recargarStore();
                            }
                        }
                    },

                   /* {
                        xtype: 'textfield',
                        id: 'remisionFiltro',
                        fieldLabel: 'Buscar Remisión',
                        emptyText: 'Escribe la remisión...',
                        width: 280,
                        listeners: {
                            change: function (field, newValue) {
                                if (newValue && !/^(\*\d{1,8}|\d{1,8}-\d|\d{1,8})$/.test(newValue)) {
                                    Ext.Msg.alert('Error', 'Formato inválido. Por favor, intenta de nuevo.');
                                    field.setValue('');
                                }
                            }
                        }
                    }*/
                    
                    {//-----------------------
                        xtype: 'combo',//'textfield'
                        fieldLabel: 'Buscar Remision',
                        id: 'remisionFiltro',
                        minChars: 1, // empieza a buscar desde 1 #
                        queryMode: 'remote',
                        forceSelection: false, // el usuario puede escribir aunque no exista
                        editable: true,
                        hideTrigger: true,
                        emptyText: 'Busca aqui...',
                        displayField: 'TransId', //
                        valueField: 'TransId',
                        width: 280,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['TransId'],
                            proxy: {
                                type: 'ajax',
                                url: url + 'buscarRemisiones',
                                reader: { type: 'json', rootProperty: 'data' }
                            }
                        }),
                        listeners: {
                            change: function (field, newValue) {
                                if (newValue && !/^(\*\d{1,8}|\d{1,8}-\d|\d{1,8})$/.test(newValue)) {
                                    Ext.Msg.alert('Error', 'Formato inválido. Por favor, intenta de nuevo.');
                                    field.setValue('');
                                }
                            },
                            
                            select: function () {
                                recargarStore(true);
                            }
                        }
                        
                    },//-----------
   {
                        xtype: 'button',
                        text: 'Buscar Remision',
                        handler: function () {
                            recargarStore(true); //se llama a la funcion recargarStore() para que se ejecute y actualice los datos del store
                        }
                    },

{
                    
                        xtype: 'button', 
                        text: 'Actualizar',
                        iconCls: 'fas fa-sync-alt',
                        handler: function () {
                            Ext.getCmp('remisionFiltro').setValue(''); // limpiamos el campo de busqueda
                            recargarStore(); //igual que buscar remision
                        }
                    }
                ]
            }]
        }]
    });

    //funcion auxiliar para recargar el store con parametros filtrados
     //puede recargar por fecha o por numero de remision
     
   function recargarStore(filtrarPorRemision = false, filtrarPorGuia = false) {
    const fecha = Ext.Date.format(Ext.getCmp('fechaFiltro').getValue(), 'd/m/Y');
    const remision = Ext.getCmp('remisionFiltro').getValue();
    

    const params = { Tipo: tipo };

    if (filtrarPorRemision && remision) {
        params.Remision = remision.padStart(8, '0');
    
    } else {
        params.Fecha = fecha;
    }

    storeGuias.getProxy().extraParams = params;
    storeGuias.load({
        callback: function (records, operation, success) {
            if ((filtrarPorRemision || filtrarPorGuia) && (!records || records.length === 0)) {
                Ext.Msg.alert('Sin resultados', 'No se encontraron resultados.');
            }
        }
    });
}



});
