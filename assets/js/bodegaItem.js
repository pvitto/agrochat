Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	var url = "/agro/BodegaItem/";
  
	 
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
										//Ext.getCmp('tabpanel').setVisible(false);
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
										////Ext.getCmp('tabpanel').setVisible(false);
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
								////Ext.getCmp('tabpanel').setVisible(false);
								Ext.getCmp('tabla').getStore().reload();
							} },
							"->",
                                {
                                    xtype: 'button',
                                    minWidth: 80,
                                    text: 'Cerrar sesión',
                                    iconCls: 'fas fa-sign-out-alt',
                                    handler: function() {
                                        Ext.Ajax.request({
                                            url: url + 'cerrarSesion', // URL para cerrar sesión
                                            method: 'POST',
                                            success: function(response) {
                                                window.location.href = 'login?pagina=bodegaitem';
                                            },
                                            failure: function(response) {
                                                // Manejar el caso en que la solicitud falle
                                                Ext.Msg.alert('Error', 'No se pudo cerrar sesión. Inténtelo de nuevo.');
                                            }
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
									fields: [
										{ name: 'Orden', type: 'int' },
										{ name: 'TransId', type: 'string' },
										{ name: 'Ruta', type: 'int' },
										{ name: 'Referencia', type: 'string' },
										{ name: 'Localizacion', type: 'string' },
										{ name: 'Descr', type: 'string' },
										{ name: 'Cantidad_Pedida', type: 'int' },
										{ name: 'Existencias', type: 'int' },
										{ name: 'Comprt', type: 'int' },
										{ name: 'Disp', type: 'int' },
										{ name: 'Referencia_Equivalente', type: 'string' },
										{ name: 'Picked', type: 'int' } // Campo Picked
									],
									data: []
								})
							},
							xtype: 'grid',
							header: false,
							columns: [
								{ text: 'Orden', dataIndex: 'Orden', flex: 1 },
								{ text: 'TransId', dataIndex: 'TransId', flex: 1 },
								{ text: 'Ruta', dataIndex: 'Ruta', flex: 1 },
								{ text: 'Referencia', dataIndex: 'Referencia', flex: 1 },
								{ text: 'Localizacion', dataIndex: 'Localizacion', flex: 1 },
								{ text: 'Descr', dataIndex: 'Descr', flex: 1 },
								{ text: 'Cantidad Pedida', dataIndex: 'Cantidad_Pedida', flex: 1 },
								{ text: 'Existencias', dataIndex: 'Existencias', flex: 1 },
								{ text: 'Comprt', dataIndex: 'Comprt', flex: 1 },
								{ text: 'Disp', dataIndex: 'Disp', flex: 1 },
								{ text: 'Picked', dataIndex: 'Picked', flex: 1 }, // Columna para Picked
								{ text: 'Referencia Equivalente', dataIndex: 'Referencia_Equivalente', flex: 1 }
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
						},
						collapsebody: function () {
							// Puedes agregar aquí lógica adicional si es necesario
						}
					}
				}
				
				,				
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
						{ name: 'Bodega', type: 'string' },
						{ name: 'FechaTransaccion', type: 'string' },
						{ name: 'FechaImpresion', type: 'string' },
						{ name: 'NombreUsuario', type: 'string' },
						{ name: 'Observaciones', type: 'string' },
						{ name: 'TipoEnvio', type: 'string' }
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
						width: 100
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
						header: 'Bodega',
						dataIndex: 'Bodega',
						width: 100
					}, 
					{
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
						//headerCheckbox: true,
						width: 190,
						editor: {
							xtype: 'textfield',
							typeAhead: true,
							triggerAction: 'all'
							
						},
						
						listeners: {
							beforeedit: function (editor, context) {
								return false;
							},
							click: function (grid, cell, cellIndex, record, row, rowIndex, e) {
								Ext.Msg.alert('Observaciones', cell.innerHTML.toLowerCase());
							}
						}
						

					}
				],
				listeners: {			
					afterrender: function( view, eOpts ){
						Ext.getCmp("form").getForm().reset();
						var fe = Ext.getCmp("fecha").getRawValue();
						view.getStore().load({params: {FechaTransaccion: fe}});					
						Ext.getCmp('usuarios').getStore().load();
						Ext.getCmp('Operarios').getStore().load();
						
					},
					rowdblclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						var transid = record.get('TransId');
						var piso = record.get('Piso');
						var bodega = record.get('Bodega');
					
						Ext.Msg.confirm(
							'Confirmar Picking',
							'¿Quieres iniciar el picking de la orden ' + transid + '?',
							function(buttonId) {
								if (buttonId === 'yes') {
									Ext.Ajax.request({
										url: url + 'iniciarPicking',
										method: 'POST',
										params: {
											transid: transid,
											piso: piso,
											bodega: bodega,
											id: id
										},
										success: function(response) {
											var result = Ext.decode(response.responseText);
											if (result.success) {
												window.location.href = result.url;
											} else {
												Ext.Msg.alert('Error', result.message);
											}
										},
										failure: function(response) {
											Ext.Msg.alert('Error', 'No se pudo completar la solicitud.');
										}
									});
								}
							}
						);
					}
					,
					rowclick: function( viewTable, record, element, rowIndex, e, eOpts ) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp("pro1").setDisabled(true);
						Ext.getCmp("pro2").setDisabled(true);
						Ext.getCmp("pro3").setDisabled(true);
						Ext.getCmp("pro4").setDisabled(true);

						if(record.data.IdUsuario != null){
							Ext.getCmp("Operarios").setValue(record.data.IdUsuario);
						}

						if(record.data.IdProceso < 4){
							Ext.getCmp("pro"+(record.data.IdProceso+1)).setDisabled(false);
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
								id: 'proceso',
								xtype: 'checkboxgroup',
								fieldLabel: 'Proceso actual',
								anchor: '98%',
								// Arrange checkboxes into two columns, distributed vertically
								columns: 1,
								vertical: true,
								allowBlank: false,
								items: [
									{ boxLabel: 'Recogiendo', name: 'IdProceso', id: "pro1", inputValue: 1, disabled: true },
									{ boxLabel: 'Recogido', name: 'IdProceso', id: "pro2", inputValue: 2, disabled: true },
									{ boxLabel: 'Empacando', name: 'IdProceso', id: "pro3", inputValue: 3, disabled: true },
									{ boxLabel: 'Empacado', name: 'IdProceso', id: "pro4", inputValue: 4, disabled: true },
									//{ boxLabel: 'Cancelado', name: 'IdProceso', id: "pro7", inputValue: 7, disabled: false }
								]
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
