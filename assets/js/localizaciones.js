Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	var url = "/agro/localizaciones/";

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
				title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Admninistracion Bodega - Inventario Localizaciones',
				layout: 'fit',
				rowLines: true,
				split: true,
				columnLines: true,
				frame: true,
				features: [{ftype:'grouping', 
				groupHeaderTpl: 'Grupo: {name} ({rows.length} elemento{[values.rows.length > 1 ? "s" : ""]})', 
				startCollapsed: true				
			}, 
		],
				
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
								width: 185,
								labelWidth: 60,
								fieldLabel: 'Bodega',
								triggerAction: 'all',
								value: 0,
								editable: false,
								store: [
									[0,'Todos'],
									[1,'P1'],
									[2,'P2'],
									[3,'A']
								],
								listeners: {
									select: function( combo, record, eOpts ) {
										Ext.getCmp("form").getForm().reset();
										//Ext.getCmp("tabla").getView().setDisabled(false);
										Ext.getCmp('tabpanel').setVisible(false);
										if(combo.getValue() == 0){
											Ext.getCmp('tabla').getStore().clearFilter();
										}else{
											Ext.getCmp('tabla').getStore().filter("Piso",combo.getRawValue());
										}	
										console.log(Ext.getCmp('tabla').getStore().getRange(0,100));
									}
								}
							},
							"-",
							{
								xtype: 'textfield',
								labelWidth: 190,
								//anchor: '100%',
								id: 'fecha',
								fieldLabel: 'Consultar BinNum - ITEM:',
								value: '',
								//format: "d/m/Y",
								editable: true,
								width: 285,
								listeners:{
									afterrender: function(field) {
											field.focus();
									},
									select: function( field, value, eOpts ) {
										Ext.getCmp('tabla').getStore().clearFilter();
										Ext.getCmp("form").getForm().reset();
										//Ext.getCmp("tabla").getView().setDisabled(false);
										Ext.getCmp('tabpanel').setVisible(false);
									}
								},
							},
							"-",
							{ minWidth: 80, text: 'Consultar', iconCls: 'fas fa-sync-alt', hidden: false, id: 'Consultar', handler: function(){
								Ext.getCmp('tabla').getStore().clearFilter();
								Ext.getCmp("pisos").setValue(0);
								Ext.getCmp("form").getForm().reset();
								Ext.getCmp('tabpanel').setVisible(false);
								Ext.getCmp('tabla').getStore().reload();

								Ext.getCmp('tabla').getStore().load({params: {FechaTransaccion: Ext.getCmp('fecha').getRawValue()}});
							

							} },
							"-",
							{
								xtype: 'button',
								text: 'Generar Código',
								iconCls: 'fas fa-plus',
								handler: function() {
									var grid = this.up('grid');
									var selectedRecord = grid.getSelectionModel().getSelection()[0];
							
									if (selectedRecord) {
										var itemId = selectedRecord.get('Itemid');
										var descripcion = selectedRecord.get('Descrip');
							
										Ext.Ajax.request({
											url: url + 'generarCodigoDeBarras', 
											method: 'POST',
											params: {
												Referencia: itemId
											},
											success: function(response) {
												var respuesta = Ext.decode(response.responseText);
												if (respuesta.error) {
													Ext.Msg.alert('Error', respuesta.error);
												} else {
													// Crear el popup
													var popup = Ext.create('Ext.window.Window', {
														title: 'Código de Barras Generado',
														modal: true,
														width: 600,
														height: 500,
														layout: 'vbox',
														items: [
															{
																xtype: 'panel',
																layout: 'hbox',
																padding: 10,
																items: [
																	{
																		xtype: 'image',
																		src: 'data:image/png;base64,' + respuesta.imagen,
																		width: 200,
																		height: 100,
																		margin: '0 10 10 0'
																	},
																	{
																		xtype: 'container',
																		layout: 'vbox',
																		items: [
																			{
																				xtype: 'displayfield',
																				fieldLabel: 'Referencia',
																				value: itemId,
																				margin: '0 0 10 0'
																			},
																			{
																				xtype: 'displayfield',
																				fieldLabel: 'Desc',
																				value: descripcion
																			}
																		]
																	}
																]
															}
														],
														buttons: [
															{
																text: 'Imprimir',
																handler: function() {
																	// Crear una nueva ventana para impresión
																	var printWindow = window.open('', '', 'height=600,width=800');
																	var printContent = `
																		<!DOCTYPE html>
<html>
<head>
    <title>AgroCosta-SAS</title>
    <style>
        @media print {
            .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; }
        .container { width: 100%; margin: 0 auto; }
        .label {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center; /* Centra las secciones horizontalmente */
            width: 10cm; /* Ancho del rectángulo */
            height: 5cm; /* Alto del rectángulo */
            border: 1px solid #000;
            padding: 5px; /* Ajustado para mantener proporciones */
            box-sizing: border-box; /* Incluye el padding y el borde en el tamaño total */
            page-break-inside: avoid; /* Evita que el rectángulo se divida en dos páginas si es posible */
            position: relative; /* Necesario para posicionamiento absoluto */
			padding-bottom: 25px;
        }
        .label-left {
            flex: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center; /* Centra verticalmente el contenido */
        }
        .label-right {
            position: absolute;
            top: 5px; /* Ajusta según sea necesario */
            right: 5px; /* Ajusta según sea necesario */
            text-align: right;
        }
        .label .reference {
            font-size: 0.9cm; /* Tamaño de fuente para la referencia */
            font-weight: bold;
            margin-bottom: 2px; /* Reducido para estar más cerca del código de barras */
        }
        .label .description {
            font-size: 0.3cm;
            margin-bottom: 2px;
            word-wrap: break-word; /* Permite que las palabras largas se dividan */
            max-width: 7cm; /* Limita el ancho máximo */
            align-self: center;
        }
        .label .code-bar {
            display: block;
            margin: 0 auto 2px auto; /* Ajusta el margen superior e inferior */
            width: 7.0cm; /* Ancho del código de barras */
            height: 2cm; /* Alto del código de barras */
        }
        .label .company-name {
            font-size: 0.3cm; /* Tamaño de fuente para el nombre de la empresa */
            font-weight: bold;
			padding-bottom: 25px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="label">
            <div class="label-left">
                <p class="reference">${itemId}</p>
                <p class="description">${descripcion}</p>
                <img class="code-bar" src="data:image/png;base64,${respuesta.imagen}" />
            </div>
            <div class="label-right">
                <p class="company-name">Agro-Costa SAS</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
																	printWindow.document.write(printContent);
																	printWindow.document.close();
																	printWindow.focus();
																	printWindow.print();
																}
															},
															{
																text: 'Cerrar',
																handler: function() {
																	popup.close();
																}
															}
														]
													});
													popup.show();
												}
											},
											failure: function(response) {
												Ext.Msg.alert('Error', 'Error al generar el código de barras');
											}
										});
									} else {
										Ext.Msg.alert('Error', 'Debe seleccionar una fila primero');
									}
								}
							}
							
																						
							,
							"->",

							{
								xtype: 'button',
								text: '',
								iconCls: 'fas fa-caret-down	',
								handler: function() {
									
									var grid = Ext.getCmp('tabla');
									var store = grid.getStore();

									store.filterBy(function(record) {
										var fieldValue = record.get('Observaciones');
										return fieldValue !== '' && fieldValue !== 'ok' && fieldValue !== 'OK';
									});

									// Crear el libro de Excel
									var workbook = XLSX.utils.book_new();
						
									// Crear la hoja de trabajo y agregar los datos de la tabla
									var worksheet = XLSX.utils.json_to_sheet(store.getData().items.map(function(record) {
										return record.getData();
									}));
						
									// Agregar la hoja de trabajo al libro
									XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
						
									// Guardar el archivo Excel
									XLSX.writeFile(workbook, 'tabla.xlsx');

									store.clearFilter();
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
						ptype: 'cellediting',			
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
									},
									failure: function(response, opts) {
										console.log('server-side failure with status code ' + response.status);
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
						{ name: 'Itemid', type: 'string' },
						{ name: 'Descrip', type: 'string' },
						{ name: 'Piso', type: 'string' },
						{ name:'BinNum', type: 'string' },
						{ name: 'enMano', type: 'int' },
						{ name: 'AliasProv', type: 'string' }
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
						header: 'Itemid',
						dataIndex: 'Itemid',
						groupable: true,
						headerCheckbox: true,
						width: 150,
						filter: 'string',
						flex: 1
						
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Descrip',
						dataIndex: 'Descrip',
						groupable: true,
						headerCheckbox: true,
						width: 210,
						filter: 'string',
						flex: 1
						
					}, 
					
					
					{
						//xtype: 'checkcolumn',
						header: 'Bodega',
						dataIndex: 'Piso',
						//headerCheckbox: true,
						width: 100,//,
						flex: 1
						//stopSelection: false
					}, 
					
					{
						//xtype: 'datecolumn',
						header: 'Enmano',
						dataIndex: 'enMano',
						hidden: false,
						//refenence: 'Name',
						width: 120,
						flex: 1
					},
					{
						//xtype: 'datecolumn',
						header: 'BinNum',
						dataIndex: 'BinNum',
						//refenence: 'Name',
						width: 120,
						flex: 1
					}, 
					{
						//xtype: 'datecolumn',
						header: 'AliasProv',
						dataIndex: 'AliasProv',
						hidden: true,
						//refenence: 'Name',
						width: 120,
						flex: 1
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
					},
					rowdblclick: function( viewTable, record, element, rowIndex, e, eOpts ) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp("pro8").setDisabled(false);
						Ext.getCmp("pro8").setValue(true);
						//Ext.getCmp("Observacion").setDisabled(true);
						Ext.getCmp('Observacion').setValue(record.data.Observaciones);
						
						Ext.getCmp('tabpanel').setVisible(true);
						Ext.getCmp("usuarios").focus();

						if(record.data.IdUsuario != null){
							Ext.getCmp("usuarios").setValue(record.data.IdUsuario);
							
						}

						Ext.getCmp('BinNum').getStore().load({params: {bodega: record.data.Piso}});
							Ext.getCmp('BinNum').setValue(record.data.BinNum);

								
					},
					rowclick: function( viewTable, record, element, rowIndex, e, eOpts ) {
						Ext.getCmp("form").getForm().reset();
						Ext.getCmp("pro8").setDisabled(false);
						Ext.getCmp("pro8").setValue(true);
						Ext.getCmp('Observacion').setValue(record.data.Observaciones);
						

						if(record.data.IdUsuario != null){
							Ext.getCmp("usuarios").setValue(record.data.IdUsuario);
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
											datos.Id = fila.Id;
											datos.TransId = fila.TransId;
											datos.Itemid = fila.Itemid;
											
											datos.IdTransTipo = Ext.getCmp("proceso").getValue().IdProceso;
											datos.IdPiso = fila.Piso;
											datos.IdUsuario = Ext.getCmp("usuarios").getValue();
											datos.BinNum=Ext.getCmp("BinNum").getValue();
											
											datos.Observaciones = Ext.getCmp("Observacion").getValue().trim();

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
													if(res.mensaje == 'Ok'){
														Ext.Msg.show({
															title:'Atención!',
															message: 'Registro guardado con éxito',
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.INFO
														});

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
										url: url+"obtenerUsuarios",
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
listeners: {
                        scope: this,
                        change: function(checkbox) {
                            if (checkbox.checked) {
                                resetBoxes(checkbox.ownerCt, checkbox.inputValue);
                            }
                            var panel = checkbox.ownerCt.ownerCt;
                            var f = panel.down('displayfield');
                            checkbox.checked ? checkbox.inputValue : 'none';
                        }
                    },

								items: [
									
									{ boxLabel: 'Localizar', name: 'IdProceso', id: "pro8", inputValue: 8, disabled: true }
								]
							},
							
							{
								xtype: 'combo',
								id: 'BinNum',
								typeAhead: true,
								fieldLabel: 'BinNum',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: false,
								anchor: '98%',
								displayField: 'BinNum',
    							valueField: 'BinNum',
								
								store: Ext.create('Ext.data.Store', {
									autoLoad: false,
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

									listeners: {
										focus: function(field) {
											field.selectAll();
										}
									}
							},

							{
								xtype: 'textareafield',
								id: 'Observacion',
								grow: true,
								fieldLabel: 'Observación',
								allowBlank: true,
								anchor: '98%'
							},
						]
					}
				]
			})
		]
	});
});
