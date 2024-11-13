Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	var url = "/agro/BodegaItem_Admin/";

	function restablecer(){
		Ext.getCmp("form").getForm().reset();
		//Ext.getCmp("tabla").getView().setDisabled(false);
		Ext.getCmp('tabpanel').setVisible(false);
		Ext.getCmp("tabla").getStore().reload();
	};
	 
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
							{ minWidth: 80, text: 'Actualizar', iconCls: 'fas fa-sync-alt', hidden: false, handler: function(){
								Ext.getCmp('tabla').getStore().clearFilter();
								Ext.getCmp("pisos").setValue(0);
								Ext.getCmp("form").getForm().reset();
								//Ext.getCmp("tabla").getView().setDisabled(false);
								Ext.getCmp('tabpanel').setVisible(false);
								Ext.getCmp('tabla').getStore().reload();
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
										{ name: 'Referencia_Equivalente', type: 'string' },
										{ name: 'Picked', type: 'int' },
										{ name: 'Packed', type: 'int' }
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

							},
							{ 
								text: 'Picked', 
								dataIndex: 'Picked', 
								width: 100 
							},
							{ 
								text: 'Packed', 
								dataIndex: 'Packed', 
								width: 100 
							},
							{

								text: 'Referencia Equivalente',
								dataIndex: 'Referencia_Equivalente',
								flex: 1
							}
							]						
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
				store: Ext.create('Ext.data.Store', {
					autoLoad: false,
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
						{ name: 'Bodega', type: 'string' },
						{ name: 'FechaTransaccion', type: 'string' },
						{ name: 'FechaImpresion', type: 'string' },
						{ name: 'NombreUsuario', type: 'string' },
						{ name: 'Observaciones', type: 'string' },
						{ name: 'TipoEnvio', type: 'string' },
						{ name: 'PorcentajeCompletado', type: 'string' } 
					],
					proxy: {
						timeout: 600000,
						useDefaultXhrHeader: false,
						type: 'ajax',
						url: url + "obtenerPickedList",
						reader: {
							type: 'json',
							rootProperty: 'data',
							totalProperty: 'total' // Asegúrate de que tu backend pase este campo correctamente
						}
					},
					listeners: {
						load: function(store, records, successful, eOpts) {
							// Calcula el porcentaje para cada fila
							store.each(function(record) {
								var totalItems = record.get('TotalItems');
								var pickedItems = record.get('PickedItems');
								var porcentaje = 0;

								if (totalItems > 0) {
									porcentaje = (pickedItems / totalItems) * 100;
								}

								// Asigna el porcentaje calculado al campo 'PorcentajeCompletado'
								record.set('PorcentajeCompletado', porcentaje.toFixed(2) + '%');
							});
						}
					}
				}),
				columns: [
					{
						//xtype: 'checkcolumn',
						header: 'Fecha Tansación',
						dataIndex: 'FechaTransaccion',
						groupable: true,
						hidden: true,
						headerCheckbox: true,
						width: 150//,
						//stopSelection: false
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
							store: [
								['Shade','Shade'],
								['Mostly Shady','Mostly Shady'],
								['Sun or Shade','Sun or Shade'],
								['Mostly Sunny','Mostly Sunny'],
								['Sunny','Sunny']
							]
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
							store: [
								['Shade','Shade'],
								['Mostly Shady','Mostly Shady'],
								['Sun or Shade','Sun or Shade'],
								['Mostly Sunny','Mostly Sunny'],
								['Sunny','Sunny']
							]
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
								case 5:
									metaData.tdCls = 'porempacar';
									break;
							}

							return value;
						}
					}, 
					{
						header: 'Orden Proceso',
						dataIndex: 'Orden',
						hidden: true,
						width: 100
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Bodega',
						dataIndex: 'Bodega',
						//headerCheckbox: true,
						width: 100//,
						//stopSelection: false
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Piso',
						dataIndex: 'Piso',
						//headerCheckbox: true,
						width: 100//,
						//stopSelection: false
					}, 
					{
						header: 'Cliente',
						dataIndex: 'CustName',
						flex: 1,
						minWidth: 200,
						align: 'center',
					}, 
					
					{
						//xtype: 'datecolumn',
						header: 'Vendedor',
						dataIndex: 'Name',
						refenence: 'Name',
						width: 200
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Envio',
						dataIndex: 'TipoEnvio',
						//headerCheckbox: true,
						width: 100//,
						//stopSelection: false
					},
					{
						//xtype: 'checkcolumn',
						header: 'Fecha Impresión',
						dataIndex: 'FechaImpresion',
						groupable: true,
						headerCheckbox: true,
						width: 150//,
						//stopSelection: false
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Fecha Inicial',
						dataIndex: 'HoraInicial',
						//headerCheckbox: true,
						width: 190//,
						//stopSelection: false
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Fecha Final',
						dataIndex: 'HoraFinal',
						//headerCheckbox: true,
						width: 190//,
						//stopSelection: false
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Responsable',
						dataIndex: 'NombreUsuario',
						//headerCheckbox: true,
						width: 130//,
						//stopSelection: false
					},
					{
						//xtype: 'checkcolumn',
						header: 'Observaciones',
						dataIndex: 'Observaciones',
						headerCheckbox: true,
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
						header: '%',
						dataIndex: 'PorcentajeCompletado',
						width: 90,
						renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
							// Puedes personalizar el color o formato del porcentaje si lo deseas
							return value;
						}
					}
				],
				listeners: {			
					afterrender: function( view, eOpts ){
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp('tabpanel').setVisible(false);
						//Ext.getCmp("tabla").getView().setDisabled(false);
						var fe = Ext.getCmp("fecha").getRawValue();
						view.getStore().load({params: {FechaTransaccion: fe}});					
						Ext.getCmp('usuarios').getStore().load();
						Ext.getCmp('Operarios').getStore().load();
						
					},
					rowdblclick: function( viewTable, record, element, rowIndex, e, eOpts ) {

						if (record.data.IdProceso == 0 || record.data.IdProceso == 5)
						{
							Ext.getCmp("form").getForm().reset();
							//Ext.getCmp("tabla").getView().setDisabled(true);
							Ext.getCmp('tabpanel').setVisible(true);
	
							if(record.data.IdUsuario != null){
								Ext.getCmp("Operarios").setValue(record.data.IdUsuario);
							}
	
							if(record.data.IdProceso != null)
							{
								Ext.getCmp("proceso").setValue(record.data.IdProceso);
							}
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

										if(fila.Piso == null || fila.Piso == ""){
											Ext.Msg.show({
												title:'Atención!',
												message: 'Debe asignar un piso a la ubicación de unas de las referencias de la remisión: <br> <strong>'+fila.TransId+'</strong>',
												buttons: Ext.Msg.OK,
												icon: Ext.Msg.WARNING
											});
											return false;
										}

										if (fila.IdProceso != 0 && fila.IdProceso != 5)
										{
											Ext.Msg.show({
												title:'Atención!',
												message: 'Estado de proceso inválido.',
												buttons: Ext.Msg.OK,
												icon: Ext.Msg.WARNING
											});
											return false;
										}

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
										if(Ext.getCmp("proceso").getValue().IdProceso==7 && Ext.getCmp("Observacion").getValue().trim()==""){
											Ext.Msg.show({
												title:'Atención!',
												message: 'Si vas a cancelar/activar un pedido digita la observacion',
												buttons: Ext.Msg.OK,
												icon: Ext.Msg.WARNING
											});
											return false;
										}
										else{
											var datos = {};
											datos.TransId = fila.TransId;
											datos.IdTransTipo = 0;
											datos.IdPiso = fila.Piso;
											datos.IdUsuario = Ext.getCmp("usuarios").getValue();
											datos.Idoperario = Ext.getCmp("Operarios").getValue();
											datos.Observaciones = Ext.getCmp("Observacion").getValue().trim();
											datos.Observaciones ='';

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
										url: url+"obtenerUsuariosAdmin",
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
								xtype: 'combo',
								id: 'Operarios',
								typeAhead: true,
								fieldLabel: 'Operario Asignado:',
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
										url: url+"obtenerUsuarios",
										reader: {
											type: 'json',
											rootProperty: 'data'
										}
									}
								})
							},
							{
								id: 'proceso',
								xtype: 'textfield',
								anchor: '98%',
								// Arrange checkboxes into two columns, distributed vertically
								vertical: true,
								hidden: true,
								editable: false
							},
							{
								xtype: 'textareafield',
								id: 'Observacion',
								grow: true,
								fieldLabel: 'Observación',
								anchor: '98%'
							}
						]
					}
				]
			})
		]
	});
});
