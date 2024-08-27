Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	var url = "/agro/BodegaDespacho/";

	var tipo = 1;

	function restablecer(){
		Ext.getCmp("form").getForm().reset();
		//Ext.getCmp("tabla").getView().setDisabled(false);
		Ext.getCmp('tabpanel').setVisible(false);
		Ext.getCmp("tabla").getStore().reload();
	};

	function actualizarInterfaz() {
		var boton = Ext.getCmp('CambiarTipoButton');
		var exportButton = Ext.getCmp('exportButton');
		var grid = Ext.getCmp('tabla'); 

		var adminColumn = grid.down('[itemId=adminColumn]');
		var operarioColumn = grid.down('[itemId=operarioColumn]');
		var transportadoraColumn = grid.down('[itemId=transportadoraColumn]');
		var ubicacionColumn = grid.down('[itemId=ubicacionColumn]');
		var guiaColumn = grid.down('[itemId=guiaColumn]');
	

		// Ajustar visibiliad de elementos dependientes al tipo de proceso
		exportButton.setDisabled(tipo !== 4);
		adminColumn.setVisible(tipo === 4);
		operarioColumn.setVisible(tipo === 4);
		transportadoraColumn.setVisible(tipo === 4);
		guiaColumn.setVisible(tipo === 4);
		ubicacionColumn.setVisible(tipo === 1);

	
		if (tipo === 1) {
			boton.setText('Mostrar Despachados');
		} else {
			boton.setText('Mostrar No Despachados');
		}
	}
	

	function setVisibilityForm(visible)
	{
		if (visible === false)
		{
			Ext.getCmp("pro2").setVisible(false);
			Ext.getCmp("pro3").setVisible(false);
			Ext.getCmp("proceso").setVisible(false);
			//Ext.getCmp("usuarios").setVisible(false);
			//Ext.getCmp("password").setVisible(false);
			//Ext.getCmp("Operarios").setVisible(false);
			Ext.getCmp("Observacion").setVisible(false);

			Ext.getCmp("proceso").setDisabled(true);
			//Ext.getCmp("usuarios").setDisabled(true);
			//Ext.getCmp("password").setDisabled(true);
			//Ext.getCmp("Operarios").setDisabled(true);
			Ext.getCmp("Observacion").setDisabled(true);
		}
		else if (visible === true)
		{
			Ext.getCmp("pro2").setVisible(true);
			Ext.getCmp("pro3").setVisible(true);
			Ext.getCmp("proceso").setVisible(true);
			//Ext.getCmp("usuarios").setVisible(true);
			//Ext.getCmp("password").setVisible(true);
			//Ext.getCmp("Operarios").setVisible(true);
			Ext.getCmp("Observacion").setVisible(true);

			Ext.getCmp("proceso").setDisabled(false);
			//Ext.getCmp("usuarios").setDisabled(false)
			//Ext.getCmp("password").setDisabled(false)
			//Ext.getCmp("Operarios").setDisabled(false)
			Ext.getCmp("Observacion").setDisabled(false)
		}
	}
	


	var store = Ext.create('Ext.data.Store', {
		autoLoad: true,
		//groupField: "TransId",
		fields: [
			{ name: 'TransId', type: 'string' },
			{ name: 'FechaTransaccion', type: 'string' },
			{ name: 'FechaImpresion', type: 'string' },
			{ name: 'Proceso', type: 'string' },
			{ name: 'IdCliente', type: 'int' },
			{ name: 'Cliente', type: 'string' },
			{ name: 'Rep2id', type: 'string' },
			{ name: 'Vendedor', type: 'string' },
			{ name: 'EstadoTransaccion', type: 'string' },
			{ name: 'Observaciones', type: 'string' },
			{ name: 'TipoEnvio', type: 'string' },
			{ name: 'Ubicacion', type: 'string' },
			{ name: 'Transportadora', type: 'string' },
			{ name: 'Guia', type: 'string' },
			{ name: 'Administrador', type: 'string' },
			{ name: 'Operario', type: 'string' },
			{ name: 'IdDespachado', type: 'int' }
		],
		proxy: {
			timeout: 600000,
			useDefaultXhrHeader: false,
			type: 'ajax',
			url: url+"obtenerPickedList",
			reader: {
				type: 'json',
				rootProperty: 'data'
			},
			extraParams: {
				Tipo: tipo 
			}
		}
	})
	 
	Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
			Ext.create('Ext.grid.Panel', {
				id: 'tabla',
				width: '76%',
				region: 'center',
				iconCls: 'logo',
				title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Admninistracion Bodega - Administrador',
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
								xtype: 'button',
								id: 'CambiarTipoButton',
								text: 'Mostrar Despachados', // Texto inicial
								handler: function() {
									tipo = tipo === 1 ? 4 : 1; // Cambia el valor de tipo
									actualizarInterfaz(); // Actualiza el interfaz entre despachados y no despachados
									Ext.getCmp('tabla').getStore().reload({
										params: { Tipo: tipo } // Recarga la lista con el nuevo valor de tipo
									});
								}
							},
							"->",
							{
								id: 'exportButton', 
								xtype: 'button',
								text: 'Exportar a Excel',
								disabled: tipo != 4,
								iconCls: 'fas fa-caret-down',
								handler: function() {
									try {
										var grid = Ext.getCmp('tabla');
										var store = grid.getStore();
						
							
										// Create a new Excel workbook
										var workbook = XLSX.utils.book_new();
							
										// Convert store data to JSON format for Excel export
										var worksheetData = store.getData().items.map(function(record) {
											var data = record.getData();
											delete data.id; // Eliminar la columna "ID"
											delete data.Ubicacion;
											return data;
										});
							
										// Create a worksheet and append it to the workbook
										var worksheet = XLSX.utils.json_to_sheet(worksheetData);
										XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
							
										// Export the workbook to a file
										XLSX.writeFile(workbook, 'despachados.xlsx');
							
										// Clear the filter after exporting
										store.clearFilter();
							
										Ext.Msg.alert('Éxito', 'El archivo Excel se ha creado correctamente.');
									} catch (error) {
										Ext.Msg.alert('Error', 'Hubo un problema al crear el archivo Excel: ' + error.message);
									}
								}
							}
							
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
						widget: {	
							bind: {
								store: Ext.create('Ext.data.Store', {
									autoLoad: false,
									//groupField: "TransId",
									fields: [
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
								Ext.Ajax.request({
									method: 'GET',
									url: url+"obtenerReferencias",
									params: { TransId: record.data.TransId, Piso: record.data.Piso, Bodega: record.data.Bodega },
									headers:
									{
										'Content-Type': 'application/json'
									},
									success: function(response, opts) {
										var obj = JSON.parse(response.responseText);
										//console.log(obj);
										Ext.getCmp(rowNode.rows[1].childNodes[1].childNodes[0].childNodes[0].id).store.setData(obj.data);
									},
									failure: function(response, opts) {
										console.log('server-side failure with status code ' + response.status);
									}
								});
							//}
						},
						collapsebody: function () {
							//console.log('Main Grid Collapse Body')
						}
					}
				},			
				store: store,	
				columns: [
					
					{
						header: 'Remisión',
						dataIndex: 'TransId',
						width: 100
					}, 
					{
						header: 'Estado',
						dataIndex: 'EstadoTransaccion',
						hidden: true,
						width: 70
					}, 
					{
						header: 'Proceso',
						dataIndex: 'Proceso',
						hidden: false,
						minWidth: 200,
						renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
							var proc = record.get("Proceso");

							switch(proc) {
								case 'POR DESPACHO':
									metaData.tdCls = 'pordespacho';
									return 'Por Despacho';
								case 'UBICADO':
									metaData.tdCls = 'ubicado';
									return 'Ubicado';
								case 'DESPACHADO':
									metaData.tdCls = 'despachado';
									return 'Despachado';

							}

							return value;
						}
					}, 
					{
						header: 'IdCliente',
						dataIndex: 'IdCliente',
						hidden: true,
						width: 100
					},
					{
						header: 'IdDespachado',
						dataIndex: 'IdDespachado',
						hidden: true,
						width: 100
					},  
					{
						header: 'Guia',
						dataIndex: 'Guia',
						itemId: 'guiaColumn',
						hidden: true,
						width: 100
					}, 
					{
						header: 'Rep2id',
						dataIndex: 'Rep2id',
						hidden: true,
						width: 100
					}, 
					{
						header: 'Vendedor',
						dataIndex: 'Vendedor',
						width: 100
					}, 
					{
						header: 'Cliente',
						dataIndex: 'Cliente',
						flex: 1,
						minWidth: 100,
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Transportadora',
						dataIndex: 'Transportadora',
						itemId: 'transportadoraColumn',
						hidden: true,
						width: 100
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Ubicacion',
						dataIndex: 'Ubicacion',
						itemId: 'ubicacionColumn',
						width: 100
					},
					{
						//xtype: 'checkcolumn',
						header: 'Envio',
						dataIndex: 'TipoEnvio',
						width: 100
					},
					{
						header: 'Fecha Impresión',
						dataIndex: 'FechaImpresion',
						groupable: true,
						headerCheckbox: true,
						width: 150
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Fecha Tansación',
						dataIndex: 'FechaTransaccion',
						groupable: true,
						hidden: false,
						headerCheckbox: true,
						width: 150
					},
					{
						//xtype: 'checkcolumn',
						header: 'Observaciones',
						dataIndex: 'Observaciones',
						headerCheckbox: true,
						//headerCheckbox: true,
						width: 190,
						editor: {
							xtype: 'textfield',
							typeAhead: true,
							triggerAction: 'all'
							
						},
						
						listeners: {
							beforeedit: function (editor, context) {
								// Cancelamos el evento de edición para evitar que se inicie el modo de edición
								return false;
							},
							// Manejador del evento de clic en la celda para mostrar el texto completo
							click: function (grid, cell, cellIndex, record, row, rowIndex, e) {
								Ext.Msg.alert('Observaciones', cell.innerHTML.toLowerCase());
							}
						}
						
						
					},
					{
						header: 'Admin',
						dataIndex: 'Administrador',
						itemId: 'adminColumn', // Asigna un itemId
						hidden: true,
						width: 100
					}, 
					{
						header: 'Operario',
						dataIndex: 'Operario',
						itemId: 'operarioColumn', // Asigna un itemId
						hidden: true,
						width: 100
					}					
				],
				
				listeners: {
					afterrender: function(view, eOpts) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp('tabpanel').setVisible(false);
						Ext.getCmp('usuarios').getStore().load();
						Ext.getCmp('Operarios').getStore().load();
					},
					rowdblclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						if (tipo == 1)
						{
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro2").setDisabled(true);
							Ext.getCmp("pro3").setDisabled(true);
							Ext.getCmp('tabpanel').setVisible(true);
							Ext.getCmp("Guia").setVisible(false);
							setVisibilityForm(true);
					
							var proceso = record.get('Proceso');
					
							switch (proceso) {
								case 'POR DESPACHO':
									Ext.getCmp("pro2").setDisabled(false);
									Ext.getCmp("pro3").setDisabled(false);
									break;
								case 'UBICADO':
									Ext.getCmp("pro3").setDisabled(false);
									break;
								case 'DESPACHADO':
									break;
							}
						}
						else
						{
							//Ext.getCmp("form").disable();
							Ext.getCmp('tabpanel').setVisible(true);
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							setVisibilityForm(false);
							Ext.getCmp("Guia").setVisible(true);
						}
						
					},
					rowclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						if (tipo == 1)
						{
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro2").setDisabled(true);
							Ext.getCmp("pro3").setDisabled(true);
							Ext.getCmp("Guia").setVisible(false);
							setVisibilityForm(true);
					
							var proceso = record.get('Proceso');
					
							switch (proceso) {
								case 'POR DESPACHO':
									Ext.getCmp("pro2").setDisabled(false);
									Ext.getCmp("pro3").setDisabled(false);
									break;
								case 'UBICADO':
									Ext.getCmp("pro3").setDisabled(false);
									break;
								case 'DESPACHADO':
									break;
							}
						}
						else
						{
							//Ext.getCmp("form").disable();
							Ext.getCmp('tabpanel').setVisible(true);
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							setVisibilityForm(false);
							Ext.getCmp("Guia").setVisible(true);
							
						}
					}
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
						dockedItems: [
							{
								xtype: 'toolbar',
								dock: 'bottom',
								ui: 'footer',
								layout: {
									pack: 'left'
								},
								items: [
									{
										minWidth: 80,
										text: 'Guardar',
										iconCls: 'fas fa-save',
										hidden: false,
										handler: function () {
											var fila = Ext.getCmp("tabla").getSelection()[0].data;
							
											if (!Ext.getCmp("form").getForm().isValid()) {
												Ext.Msg.show({
													title: 'Atención!',
													message: 'Debe llenar todos los campos obligatorios',
													buttons: Ext.Msg.OK,
													icon: Ext.Msg.WARNING
												});
												return false;
											}
							
											if (Ext.getCmp("usuarios").getSelection().data.Password != Ext.getCmp("password").getValue().trim()) {
												Ext.Msg.show({
													title: 'Atención!',
													message: 'Contraseña Incorrecta',
													buttons: Ext.Msg.OK,
													icon: Ext.Msg.WARNING
												});
												return false;
											}
							
											var datos = {};
											datos.TransId = fila.TransId;
											datos.IdTransTipo = Ext.getCmp("proceso").getValue().IdProceso;
											datos.IdUsuario = Ext.getCmp("usuarios").getValue();
											datos.Idoperario = Ext.getCmp("Operarios").getValue();
											datos.Observaciones = Ext.getCmp("Observacion").getValue().trim();
											datos.FechaDespacho = "";
											datos.IdDespachado = fila.IdDespachado;
											datos.Guia = Ext.getCmp("Guia").getValue();
											datos.Proceso = fila.Proceso;
							
											if (datos.IdTransTipo == 2) {
												datos.BinNum = Ext.getCmp("Localizacion").getValue();
												datos.Transportadora = "";
											} else if (datos.IdTransTipo == 3) {
												datos.Transportadora = Ext.getCmp("Transportadora").getValue();
												datos.BinNum = "";
											} else if (datos.Proceso == "DESPACHADO")
											{
												datos.IdTransTipo = 5;
												datos.BinNum = "";
												datos.Transportadora = "";
											}
											else {
												Ext.Msg.show({
													title: 'Atención!',
													message: 'Debe escoger un estado.',
													buttons: Ext.Msg.OK,
													icon: Ext.Msg.WARNING
												});
												return false;
											}
							
											var dat = Ext.getCmp("tabla").getStore().getDataSource().items.filter(x => x.data.TransId == fila.TransId && x.data.IdProceso !== datos.IdTransTipo && x.data.Piso != fila.Piso);
							
											Ext.Ajax.request({
												url: url + 'guardarHistorialPicked',
												params: {
													datos: JSON.stringify(datos)
												},
												method: 'POST',
												success: function (result, request) {
													console.log(result.responseText);
													try {
													var res = Ext.util.JSON.decode(result.responseText);

													if(res.mensaje.substring(0,2)=='Ok'){
														var confirmMessage = datos.IdTransTipo == 2 ? 'Ubicado confirmado' : 'Despacho confirmado';

                            							Ext.Msg.alert('Confirmación', confirmMessage, function () {
															window.location.reload();
														});
													}
													else
													{
														var errormessage = res.mensaje;

														Ext.Msg.alert('Error', errormessage, function () {
															
														});
													}
												} catch (e) {
													Ext.Msg.alert('Error', 'La respuesta del servidor no es un JSON válido.');
												}
													
												}
											});
										}
									},
									{
										minWidth: 80,
										text: 'Cancelar',
										iconCls: 'fas fa-backspace',
										hidden: false,
										handler: function () {
											Ext.getCmp("form").getForm().reset();
											Ext.getCmp('tabpanel').setVisible(false);
										}
									}
								]
							}							
						],
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
								store: Ext.create('Ext.data.Store', {
									autoLoad: false,
									fields: [
										{ name: 'UserId', type: 'int' },
										{ name: 'UserName', type: 'string' },
										{ name: 'Password', type: 'string' }
									],
									proxy: {
										timeout: 600000,
										useDefaultXhrHeader: false,
										type: 'ajax',
										url: url + "obtenerUsuariosAdmin",
										reader: {
											type: 'json',
											rootProperty: 'data'
										}
									}
								})
							},
							{
								xtype: 'textfield',
								inputType: "password",
								id: 'password',
								anchor: '98%',
								fieldLabel: 'Contraseña',
								allowBlank: false  // requires a non-empty value
							},
							{
								id: 'proceso',
								xtype: 'radiogroup',
								fieldLabel: 'Proceso actual',
								anchor: '98%',
								columns: 1,
								vertical: true,
								allowBlank: false,
								items: [
									{ 
										boxLabel: 'Ubicado', 
										name: 'IdProceso', 
										id: "pro2", 
										inputValue: 2, 
										disabled: true
									},
									{ 
										boxLabel: 'Despachado', 
										name: 'IdProceso', 
										id: "pro3", 
										inputValue: 3, 
										disabled: true
									}
								],
								listeners: {
									change: function(field, newValue, oldValue) {
										// Oculta todos los campos al inicio
										Ext.getCmp('Localizacion').setVisible(false);
										Ext.getCmp('Transportadora').setVisible(false);
							
										// Muestra el campo correspondiente basado en la selección
										if (newValue.IdProceso === 2) {
											Ext.getCmp('Localizacion').setVisible(true);
											Ext.getCmp('Transportadora').setVisible(false);
										} else if (newValue.IdProceso === 3) {
											Ext.getCmp('Transportadora').setVisible(true);
											Ext.getCmp('Localizacion').setVisible(false);
										}
									}
								}
							},
							{
								xtype: 'combo',
								id: 'Operarios',
								typeAhead: true,
								fieldLabel: 'Operario:',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: false,
								anchor: '98%',
								displayField: 'UserName',
								valueField: 'UserId',
								store: Ext.create('Ext.data.Store', {
									autoLoad: false,
									fields: [
										{ name: 'UserId', type: 'int' },
										{ name: 'UserName', type: 'string' },
										{ name: 'Password', type: 'string' }
									],
									proxy: {
										timeout: 600000,
										useDefaultXhrHeader: false,
										type: 'ajax',
										url: url + "obtenerUsuarios",
										reader: {
											type: 'json',
											rootProperty: 'data'
										}
									}
								})
							},
							{
								xtype: 'textareafield',
								id: 'Observacion',
								grow: true,
								fieldLabel: 'Observación',
								anchor: '98%'
							},
							{
								xtype: 'combo',
								id: 'Localizacion',
								typeAhead: true,
								fieldLabel: 'Localizacion',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: true,
								anchor: '98%',
								displayField: 'BinNum',
    							valueField: 'BinNum',
								store: Ext.create('Ext.data.Store', {
									autoLoad: true,
									fields: [
										{ name: 'BinNum', type: 'string' }
									],
									proxy: {
										timeout: 600000,
										useDefaultXhrHeader: false,
										type: 'ajax',
										url: url+"obtenerBinNum",
										reader: {
											type: 'json',
											rootProperty: 'data'
										}
									}
								}),
								hidden: true
							},
							{
								xtype: 'combo',
								id: 'Transportadora',
								typeAhead: true,
								fieldLabel: 'Transportadora',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: true,
								anchor: '98%',
								displayField: 'Descrip', 
								valueField: 'Idtransportadora', 
								store: Ext.create('Ext.data.Store', {
									autoLoad: true,
									fields: [
										{ name: 'Descrip', type: 'string' },
										{ name: 'Idtransportadora', type: 'int' }
									],
									proxy: {
										timeout: 600000,
										useDefaultXhrHeader: false,
										type: 'ajax',
										url: url + "obtenerTransportadoras",
										reader: {
											type: 'json',
											rootProperty: 'data'
										}
									}
								}),
								hidden: true
							},
							{
								xtype: 'textareafield',
								id: 'Guia',
								grow: true,
								fieldLabel: 'Guia',
								anchor: '98%',
								hidden: true
							}
							
						]
						
					}
				]
			})
		]
	});
});
