Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	//new Date().toJSON().split("T")[0].split("-").reverse().join("/")
	/**
	 * This example shows how to enable inline editing of grid cells.
	 *
	 * Note that cell editing is ideal for mouse/keyboard users and is not
	 * recommended on touch devices.
	 */
	//var url = "http://192.168.0.251/agro/bodega/";
	 if (!localStorage.getItem('auth')) {
        window.location.href = 'Login';
        return;
    }

    var socket = io.connect('http://192.168.0.205:4000');
    var url = "/agro/historico/";
    var sessionTimeout;

    function startSessionTimer() {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(function() {
            Ext.Msg.alert('Sesión expirada', 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.', function() {
                localStorage.removeItem('auth');
                window.location.href = 'Login'; // Redirigir a la página de inicio de sesión
            });
        }, 30 * 60 * 1000);  // 30 minutos en milisegundos
    }

	createMainViewport();

	function createMainViewport() {
	startSessionTimer();
	Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
			Ext.create('Ext.grid.Panel', {
				id: 'tabla',
				width: '76%',
				region: 'center',
				iconCls: 'logo',
				title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Historico Bodega',
				layout: 'fit',
				rowLines: true,
				split: true,
				columnLines: true,
				//autoLoad: true,
				frame: true,
				features: [{ftype:'grouping'}],
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
                                id: 'transIdField',
                                width: 200,
                                fieldLabel: 'TransId',
                                labelWidth: 50
                            },
							"-",
							{ xtype: 'button',
								minWidth: 80,
								text: 'Actualizar',
								iconCls: 'fas fa-sync-alt',
								hidden: false,
								handler: function() {
									var transIdValue = Ext.getCmp('transIdField').getValue();  // Captura el valor de TransId
									Ext.getCmp('tabpanel').setVisible(false);
									startSessionTimer();
							
									// Recargar el store con el nuevo parámetro TransId
									Ext.getCmp('tabla').getStore().load({
										params: {
											TransId: transIdValue,
											//FechaTransaccion: Ext.getCmp('fecha').getRawValue()  // Puedes agregar más parámetros si es necesario
										}
									});
								} }
						]
					}
				],
				plugins: [
					{
						ptype: 'cellediting',
						clicksToEdit: 1
					},
					{
						ptype: 'rowwidget',			

						// The widget definition describes a widget to be rendered into the expansion row.
						// It has access to the application's ViewModel hierarchy. Its immediate ViewModel
						// contains a record and recordIndex property. These, or any property of the record
						// (including association stores) may be bound to the widget.
						//
						// See the Order model definition with the association declared to Company.
						// Every Company record will be decorated with an "orders" method which,
						// when called yields a store containing associated orders.
						widget: {	
							bind: {
								store: Ext.create('Ext.data.Store', {
									autoLoad: false,
									//groupField: "TransId",
									fields: [
										//{ name: 'TransId', type: 'string' },
										//{ name: 'Piso', type: 'string' },
										{ name: 'Ruta', type: 'int' },
										{ name: 'Referencia', type: 'string' },
										{ name: 'Localizacion', type: 'string' },
										{ name: 'Descr', type: 'string' },
										{ name: 'Cantidad_Pedida', type: 'int' },
										{ name: 'Existencias', type: 'int' },
										{ name: 'Comprt', type: 'int' },
										{ name: 'Disp', type: 'int' },
										{ name: 'Referencia_Equivalente', type: 'string' }
									],
									data: []
								})
							},
							xtype: 'grid',
							header: false,
							columns: [{
								text: 'Ruta',
								dataIndex: 'Ruta',
								flex: 1
							}, {
								flex: 1,
								text: 'Referencia',
								dataIndex: 'Referencia'
							}, {
								text: 'Localizacion',
								dataIndex: 'Localizacion',
								flex: 1
							}, {
								text: 'Descr',
								dataIndex: 'Descr',
								flex: 1
							}, {
								text: 'Cantidad Pedida',
								dataIndex: 'Cantidad_Pedida',
								flex: 1
							}, {

								text: 'Existencias',
								dataIndex: 'Existencias',
								flex: 1
							},{

								text: 'Comprt',
								dataIndex: 'Comprt',
								flex: 1

							},{

								text: 'Disp',
								dataIndex: 'Disp',
								flex: 1

							},{

								text: 'Referencia Equivalente',
								dataIndex: 'Referencia_Equivalente',
								flex: 1
							}]
						}
					}
				],
				viewConfig: {
					listeners: {
						expandbody: function (rowNode, record, expandRow, e) {

							
							if(Ext.getCmp(rowNode.rows[1].childNodes[1].childNodes[0].childNodes[0].id).getStore().count() === 0){
								Ext.Ajax.request({
									method: 'GET',
									url: url+"obtenerReferencias",
									params: { TransId: record.data.TransId, Piso: record.data.Piso },
									headers:
									{
										'Content-Type': 'application/json'
									},
									success: function(response, opts) {
										var obj = JSON.parse(response.responseText);
										//console.log(obj);
										Ext.getCmp(rowNode.rows[1].childNodes[1].childNodes[0].childNodes[0].id).store.setData(obj.data);
										startSessionTimer();
									},
									failure: function(response, opts) {
										console.log('server-side failure with status code ' + response.status);
										startSessionTimer();
									}
								});
							}
						},
						collapsebody: function () {
							//console.log('Main Grid Collapse Body')
						}
					}
				},				
				store: Ext.create('Ext.data.Store', {
					autoLoad: false,
					//groupField: "TransId",
					fields: [
						{ name: 'TransId', type: 'string' },
						{ name: 'IdProceso', type: 'int' },
						{ name: 'Orden', type: 'int' },
						{ name: 'TransType', type: 'string' },
						{ name: 'CustName', type: 'string' },
						{ name: 'Name', type: 'string' },
						{ name: 'HoraInicial', type: 'string' },
						{ name: 'HoraFinal', type: 'string' },
						{ name: 'Piso', type: 'string' },
						{ name: 'FechaTransaccion', type: 'string' },
						{ name: 'FechaImpresion', type: 'string' },
						{ name: 'NombreUsuario', type: 'string' },
						{ name: 'Observaciones', type: 'string' },
						{ name: 'Localizacion', type: 'string' },
						{ name: 'Transportista', type: 'string' }
					],
					proxy: {
						timeout: 600000,
						useDefaultXhrHeader: false,
						type: 'ajax',
						url: url+"obtenerPickedList",
						reader: {
							type: 'json',
							rootProperty: 'data'
						}
					}
				}),
				columns: [
					{
						header: 'Fecha Tansación',
						dataIndex: 'FechaTransaccion',
						groupable: true,
						hidden: true,
						headerCheckbox: true,
						width: 150
					},
					{
						header: 'Remisión',
						dataIndex: 'TransId',
						width: 100//,
						//editor: {
							//allowBlank: false
						//}
					}, 
					{
						header: 'Id Proceso',
						dataIndex: 'IdProceso',
						hidden: true,
						width: 100,
						editor: {
							xtype: 'combo',
							typeAhead: true,
							triggerAction: 'all',
						}
					}, 
					{
						header: 'Proceso',
						dataIndex: 'TransType',
						width: 140,
						editor: {
							xtype: 'combo',
							typeAhead: true,
							triggerAction: 'all',
						},
						renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
							var proc = record.get("IdProceso"); 

							switch(proc) {
								case 0:
									metaData.tdCls = 'picked';
									break;
								case 1:
									metaData.tdCls = 'recogiendo';
									break;
								case 2:
									metaData.tdCls = 'recogiendo';
									break;
								case 3:
									metaData.tdCls = 'empacando';
									break;
								case 4:
									metaData.tdCls = 'empacado';
									break;
							}

							return value;
						}
					}, 
					{
						header: 'Orden Proceso',
						dataIndex: 'Orden',
						hidden: true,
						width: 100/*,
						editor: {
							xtype: 'combo',
							typeAhead: true,
							triggerAction: 'all',
							store: [
								['Shade','Shade'],
								['Mostly Shady','Mostly Shady'],
								['Sun or Shade','Sun or Shade'],
								['Mostly Sunny','Mostly Sunny'],
								['Sunny','Sunny']
							]
						}*/
					},
					{
						header: 'Piso',
						dataIndex: 'Piso',
						//headerCheckbox: true,
						width: 100
					}, 
					{
						header: 'Cliente',
						dataIndex: 'CustName',
						flex: 1,
						minWidth: 200,
						align: 'center',
					}, 
					{
						header: 'Vendedor',
						dataIndex: 'Name',
						refenence: 'Name',
						width: 200
					}, 
					{
						header: 'Fecha Impresión',
						dataIndex: 'FechaImpresion',
						groupable: true,
						headerCheckbox: true,
						width: 150
					}, 
					{
						header: 'Fecha Inicial',
						dataIndex: 'HoraInicial',
						
						width: 190
					}, 
					{
						header: 'Fecha Final',
						dataIndex: 'HoraFinal',
						
						width: 190
					}, 
					{
						header: 'Responsable',
						dataIndex: 'NombreUsuario',
						width: 130
					},
					{
						header: 'Observaciones',
						dataIndex: 'Observaciones',
						headerCheckbox: true,
						width: 190
					}
				],
				listeners: {			
					afterrender: function( view, eOpts ){
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp('tabpanel').setVisible(false);
						//Ext.getCmp("tabla").getView().setDisabled(false);					
						Ext.getCmp('usuarios').getStore().load();
					},
					
				}
			}),
			Ext.create('Ext.panel.Panel',{
				hidden: true,
				split: true,
				id: 'tabpanel',
				title: 'Administrar estado de procesos',
				region: 'east',
				layout: 'fit',
				width: "24%",
				items: [
					{
						id: 'form',
						xtype: 'form',
						//bodyStyle: 'margin: 10px',						
						fieldDefaults: {
							msgTarget: 'side'
						},
						header: false,						
						items: [
							{
								xtype: 'combo',
								id: 'usuarios',
								typeAhead: true,
								fieldLabel: 'Usuario',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: false,
								anchor: '98%',
								displayField: 'UserName',
    							valueField: 'UserId',
							},
						]
					}
				]
			})
		]
	});
}
});

