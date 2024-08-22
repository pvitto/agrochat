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

	function actualizarTextoBoton() {
		var boton = Ext.getCmp('CambiarTipoButton');
		if (tipo === 1) {
			boton.setText('Mostrar Despachados');
		} else {
			boton.setText('Mostrar No Despachados');
		}
	}


	var store = Ext.create('Ext.data.Store', {
		autoLoad: false,
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
			{ name: 'Guia', type: 'string' }
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
				Tipo: tipo  // Aquí se envía el valor de "tipo"
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
								xtype: 'combo',
								typeAhead: true,
								id: 'pisos',
								width: 225,
								labelWidth: 130,
								fieldLabel: 'Seleccione Bodega',
								triggerAction: 'all',
								value: 0,
								editable: false,
								store: [
									[0,'Todos'],
									[1,'P1'],
									[2,'A'],
									//[3,'A']
								],
								listeners: {
									select: function( combo, record, eOpts ) {
										Ext.getCmp("form").getForm().reset();
										//Ext.getCmp("tabla").getView().setDisabled(false);
										Ext.getCmp('tabpanel').setVisible(false);
										if(combo.getValue() == 0){
											Ext.getCmp('tabla').getStore().clearFilter();
										}else{
											Ext.getCmp('tabla').getStore().filter("Bodega",combo.getRawValue());
										}	
									}
								}
							},
							"-",
							{
								xtype: 'datefield',
								labelWidth: 120,
								//anchor: '100%',
								id: 'fecha',
								fieldLabel: 'Seleccione fecha',
								value: new Date(),
								format: "d/m/Y",
								editable: false,
								width: 245,
								listeners:{
									select: function( field, value, eOpts ) {
										Ext.getCmp('tabla').getStore().clearFilter();
										Ext.getCmp("form").getForm().reset();
										//Ext.getCmp("tabla").getView().setDisabled(false);
										Ext.getCmp('tabpanel').setVisible(false);
										Ext.getCmp('tabla').getStore().load({params: {FechaTransaccion: field.getRawValue()}});
									}
								},
								maxValue: new Date()  // limited to the current date or prior
							},
							"-",
							{ 	
								minWidth: 80, text: 'Actualizar', iconCls: 'fas fa-sync-alt', hidden: false, handler: function(){
									Ext.getCmp('tabla').getStore().clearFilter();
									Ext.getCmp("pisos").setValue(0);
									Ext.getCmp("form").getForm().reset();
									Ext.getCmp('tabpanel').setVisible(false);
									Ext.getCmp('tabla').getStore().reload();
								} 
							},
							{
								xtype: 'button',
								id: 'CambiarTipoButton',
								text: 'Mostrar Despachados', // Texto inicial
								handler: function() {
									tipo = tipo === 1 ? 4 : 1; // Cambia el valor de tipo
									actualizarTextoBoton(); // Actualiza el texto del botón
									Ext.getCmp('tabla').getStore().reload({
										params: { Tipo: tipo } // Recarga la lista con el nuevo valor de tipo
									});
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
						width: 100
					}, 
					{
						header: 'Proceso',
						dataIndex: 'Proceso',
						hidden: false,
						width: 100
					}, 
					{
						header: 'IdCliente',
						dataIndex: 'IdCliente',
						hidden: true,
						width: 100
					}, 
					{
						header: 'Guia',
						dataIndex: 'Guia',
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
						minWidth: 200,
						align: 'center',
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Transportadora',
						dataIndex: 'Transportadora',
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
						
						
					}
				],
				
				listeners: {
					afterrender: function(view, eOpts) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp('tabpanel').setVisible(false);
						var fe = Ext.getCmp("fecha").getRawValue();
						view.getStore().load({ params: { FechaTransaccion: fe } });
						Ext.getCmp('usuarios').getStore().load();
						Ext.getCmp('Operarios').getStore().load();
					},
					rowdblclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp("pro2").setDisabled(true);
						Ext.getCmp("pro3").setDisabled(true);
						Ext.getCmp('tabpanel').setVisible(true);
				
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
					},
					rowclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp("pro2").setDisabled(true);
						Ext.getCmp("pro3").setDisabled(true);
				
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
									{ minWidth: 80, text: 'Guardar', iconCls: 'fas fa-save', hidden: false, handler: function(){
										var fila = Ext.getCmp("tabla").getSelection()[0].data;


										if(!Ext.getCmp("form").getForm().isValid()){
											Ext.Msg.show({
												title:'Atención!',
												message: 'Debe llenar todos los campos obligatorios',
												buttons: Ext.Msg.OK,
												icon: Ext.Msg.WARNING
											});
											return false;
										}
										if(Ext.getCmp("usuarios").getSelection().data.Password != Ext.getCmp("password").getValue().trim()){
											Ext.Msg.show({
												title:'Atención!',
												message: 'Contraseña Incorrecta',
												buttons: Ext.Msg.OK,
												icon: Ext.Msg.WARNING
											});
											return false;
										}
										else{
											var datos = {};
											datos.TransId = fila.TransId;
											datos.IdTransTipo = Ext.getCmp("proceso").getValue().IdProceso;
											datos.IdPiso = fila.Piso;
											datos.IdUsuario = Ext.getCmp("usuarios").getValue();
											datos.Idoperario = Ext.getCmp("Operarios").getValue();
											datos.Observaciones = Ext.getCmp("Observacion").getValue().trim();
											
											
											if (datos.IdTransTipo == 2)
											{
												datos.BinNum = Ext.getCmp("Localizacion").getValue();
												datos.Transportadora = ""
											}
											else if (datos.IdTransTipo == 3){
												datos.Transportadora = Ext.getCmp("Transportadora").getValue();
												datos.BinNum = "";
											}
											else
											{
												Ext.Msg.show({
													title:'Atención!',
													message: 'Debe escoger un estado.',
													buttons: Ext.Msg.OK,
													icon: Ext.Msg.WARNING
												});
												return false;
											}

											var dat = Ext.getCmp("tabla").getStore().getDataSource().items.filter(x => x.data.TransId == fila.TransId && x.data.IdProceso !== datos.IdTransTipo && x.data.Piso != fila.Piso);

											Ext.Ajax.request({
												url : url+'guardarHistorialPicked',
												params : {
													datos : JSON.stringify(datos)									
												},
												method : 'POST',
												success : function(result, request) {
													var res = Ext.util.JSON.decode(result.responseText);

													//console.log(res);
													//if(res.mensaje == 'Ok'){
													if(res.mensaje.substring(0,2)=='Ok'){
														Ext.Msg.show({
															title:'Atención!',
															message: 'Registro guardado con éxito',
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.INFO
														});

														if(res.mensaje=='Ok-recogido'){

															
															Ext.defer(function(){
																Ext.Msg.show({
																	title:'Atención!',
																	message: 'Este Pedido fue recogido anteriormente, Verifica si ya ha sido despachado',
																	buttons: Ext.Msg.OK,
																	icon: Ext.Msg.INFO
																});

															},1000);

															console.log("ENTRAAA EN RECOGIDO YA");	

														}

														restablecer();
														if(dat.length == 1){ 
															console.log("NO SE ENVÍA NADA");		
															//socket.emit('message', datos);											
														} else{
															console.log("SE ENVÍA");
															socket.emit('message', datos);	
														}
														return false;
													}else if(res.mensaje == "Error"){
														Ext.Msg.show({
															title:'Atención!',
															message: 'Se presentó on error en el sistema. <br> Favor comunicarse con el departamento de sistemas.',
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.ERROR
														});

														return false;
													}else{
														Ext.Msg.show({
															title:'Atención!',
															message: res.mensaje,
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.WARNING
														});
														return false;
													}					
												}
											});	
										}
									} },
									{ minWidth: 80, text: 'Cancelar', iconCls: 'fas fa-backspace', hidden: false, handler: function(){
										Ext.getCmp("form").getForm().reset();
										Ext.getCmp('tabpanel').setVisible(false);
										//Ext.getCmp("tabla").getView().setDisabled(false);
									} }
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
							}
							
						]
						
					}
				]
			})
		]
	});
});
