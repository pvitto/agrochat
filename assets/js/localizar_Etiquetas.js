Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	//var url = "http://192.168.0.251/agro/bodega/";
	var url = "/agro/localizar_etiquetas/";

	function restablecer(){
		Ext.getCmp("form").getForm().reset();
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
				title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Aadmninistracion Bodega - PackingList',
				layout: 'fit',
				rowLines: true,
				split: true,
				columnLines: true,
				//autoLoad: true,
				frame: true,
				features: [{ftype:'grouping', 
				// personalizar forma encabezado de grupo. muestra nombre y número de elementos. 
				groupHeaderTpl: 'Grupo: {name} ({rows.length} elemento{[values.rows.length > 1 ? "s" : ""]})', 
				startCollapsed: true
				//showSummaryRow: true // agrega al agrupar una fila para calculos https://docs-devel.sencha.com/extjs/7.4.0/classic/Ext.grid.feature.Grouping.html
				
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
									[2,'P2']
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


							{
								xtype: 'textfield',
								typeAhead: true,
								id: 'items',
								width: 275,
								labelWidth: 120,
								fieldLabel: 'Seleccione Items',
								//triggerAction: 'all',
								value: "",
								editable: true,
								//maxlength:1,
								listeners: {
									change: function(textfield, e, eOpts) {
										//console.log("Yes it works!!" + textfield.getRawValue());
										Ext.getCmp("form").getForm().reset();
										//Ext.getCmp("tabla").getView().setDisabled(false);
										Ext.getCmp('tabpanel').setVisible(false);
										if(textfield.getValue() == ""){
											Ext.getCmp('tabla').getStore().clearFilter();
										}else{
											
											
											Ext.getCmp('tabla').getStore().filterBy(function(record) {
												var fieldValue1 = record.get('Itemid');
												var fieldValue2 = record.get('AliasProv');

												 // Verificar si el texto introducido se encuentra en cualquiera de los dos campos
												 return (typeof fieldValue1 === 'string' && fieldValue1.indexOf(textfield.getRawValue()) !== -1) ||
           												(typeof fieldValue2 === 'string' && fieldValue2.indexOf(textfield.getRawValue()) !== -1);

											});

										}	
										
									}
								}
							},
							"-",
							{
								xtype: 'textfield',
								labelWidth: 160,
								//anchor: '100%',
								id: 'fecha',
								fieldLabel: 'Consultar Despacho:',
								value: '',
								//format: "d/m/Y",
								editable: true,
								width: 285,
								listeners:{
									select: function( field, value, eOpts ) {
										Ext.getCmp('tabla').getStore().clearFilter();
										Ext.getCmp("form").getForm().reset();
										Ext.getCmp('tabpanel').setVisible(false);
									}
								},
							},
							"-",
							{ minWidth: 80, text: 'Consultar', iconCls: 'fas fa-sync-alt', hidden: false, id: 'Consultar', handler: function(){
								Ext.getCmp('tabla').getStore().clearFilter();
								Ext.getCmp("pisos").setValue(0);
								Ext.getCmp("form").getForm().reset();
								Ext.getCmp("items").setValue("");
								//Ext.getCmp("tabla").getView().setDisabled(false);
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
										var cantidad = selectedRecord.get('Qtyorder');
										var despacho = selectedRecord.get('TransId');
							
										// Realizar la llamada AJAX al controlador PHP
										Ext.Ajax.request({
											url: url + 'generarCodigoDeBarras',
											method: 'POST',
											params: {
												Referencia: itemId
											},
											success: function(response) {
												var responseData = Ext.decode(response.responseText);
							
												if (responseData.error) {
													Ext.Msg.alert('Error', responseData.error);
												} else {
													// Código de barras generado con éxito
													var imgData = responseData.imagen;
							
													// Crear el contenido HTML para la impresión
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
																					justify-content: center;
																					width: 10cm;
																					height: 5cm;
																					border: 1px solid #000;
																					padding: 5px;
																					box-sizing: border-box;
																					page-break-inside: avoid;
																					position: relative;
																					padding-right: 35px;
																					padding-bottom: 30px;
																				}
																				.label-left {
																					flex: 2;
																					text-align: left;
																					display: flex;
																					flex-direction: column;
																					justify-content: center;
																				}
																				.label-right {
																					flex: 1;
																					display: flex;
																					flex-direction: column;
																					justify-content: center;
																					padding-bottom: 18px;
																				}
																				.label .reference {
																					font-size: 0.7cm;
																					font-weight: bold;
																					text-align: center;
																					margin-bottom: 2px;
																				}
																				.label .dispatch, .label .quantity {
																					font-size: 0.4cm;
																					margin-bottom: -13px;
																					text-align: center;
																				}
																				.label .company-name {
																					font-size: 0.35cm;
																					margin-bottom: 20px;
																					text-align: center;
																					font-weight: bold;
																				}
																				.label .code-bar {
																					display: block;
																					margin: 0 auto 2px auto;
																					width: 5.0cm;
																					height: 1.5cm;
																				}
																			</style>
																		</head>
																		<body>
																			<div class="container">
																				<div class="label">
																					<div class="label-left">
																						<p class="reference">${itemId}</p>
																						<img class="code-bar" src="${imgData}" />
																					</div>
																					<div class="label-right">
																						<p class="company-name">Agro-Costa SAS</p>
																						<p class="dispatch">PO: ${despacho}</p>
																						<p class="quantity">Cantidad: ${cantidad}</p>
																					</div>
																				</div>
																			</div>
																		</body>
																		</html>
													`;
							
													// Crear el popup
													var popup = Ext.create('Ext.window.Window', {
														title: 'Código de Barras Generado',
														modal: true,
														width: 393,
														height: 288,
														layout: 'vbox',
														items: [
															
															{
																xtype: 'panel',
																html: printContent,
																width: '100%',
																height: 300,
																border: true,
																autoScroll: true
															}
														],
														buttons: [
															{
																text: 'Imprimir',
																handler: function() {
																	var printWindow = window.open('', '', 'height=600,width=800');
																	printWindow.document.write(printContent);
																	printWindow.document.close();
																	printWindow.focus();
							
																	setTimeout(function() {
																		printWindow.print();
																	}); 
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
												Ext.Msg.alert('Error', 'Error en la comunicación con el servidor');
											}
										});
									} else {
										Ext.Msg.alert('Error', 'Debe seleccionar una fila primero');
									}
								}
							},
							"-",
							{
								xtype: 'button',
								text: 'Finalizar',
								id: 'finalizarButton',
								iconCls: 'fas fa-check',
								handler: function() {
									var store = Ext.getCmp('tabla').getStore();
                                    var allMatched = true;
									var transid = "";
                
                                    store.each(function(record) {
										transid = record.data.TransId;
                                        if (record.get('Proceso') !== "Localizado") {
                                            allMatched = false;
                                        }
                                    });
                
                                    if (allMatched) {
                                        Ext.Msg.confirm(
                                            'Finalizar Localizado',
                                            '¿Quieres finalizar el localizado de la orden ' + transid + '?',
                                            function(buttonId) {
                                                if (buttonId === 'yes') {
                                                    Ext.Ajax.request({
                                                        url: url + 'finalizarLocalizado',
                                                        method: 'POST',
                                                        params: {
                                                            TransId: transid
                                                        },
                                                        success: function(response) {
                                                            var result = Ext.decode(response.responseText);
                                                            if (result.success) {
																window.location.reload();
																Ext.Msg.alert('Éxito', result.message);
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
                                        Ext.Msg.confirm(
                                            'Advertencia',
                                            'Hay items sin localizar en esta remisión, ¿estas seguro de finalizar el localizado de la orden ' + transid + '?',
                                            function(buttonId) {
                                                if (buttonId === 'yes') {
                                                    Ext.Ajax.request({
                                                        url: url + 'finalizarLocalizado',
                                                        method: 'POST',
                                                        params: {
                                                            TransId: transid
                                                        },
                                                        success: function(response) {
                                                            var result = Ext.decode(response.responseText);
                                                            if (result.success) {
																window.location.reload();
																Ext.Msg.alert('Éxito', result.message);
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
								}
							},
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
						{ name: 'IdFinalizado', type: 'string' },
						{ name: 'TransId', type: 'string' },
						{ name: 'RefEmpaque', type: 'string' },
						{ name: 'Itemid', type: 'string' },
						{ name: 'Qtyorder', type: 'int' },
						{ name: 'enMano', type: 'int' },
						{ name:'BinNum', type: 'string' },
						{ name:'BimNumold', type: 'string' },
						{ name: 'Id', type: 'int' },
						{ name: 'IdProceso', type: 'int' },
						{ name: 'VendorName', type: 'string' },
						{ name: 'Name', type: 'string' },
						{ name: 'FechaTransaccion', type: 'string' },		
						{ name: 'HoraInicial', type: 'string' },
						{ name: 'Piso', type: 'string' },
						{ name: 'NombreUsuario', type: 'string' },
						{ name: 'Observaciones', type: 'string' }
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
					},
					listeners: {
						load: function(store) {
							var record = store.first();
				
							if (record && record.get('IdFinalizado') == 1) {
								Ext.Msg.show({
									title: 'Información',
									message: 'Remisión ya ha sido localizada en su totalidad.',
									icon: Ext.Msg.INFO,
									buttons: Ext.Msg.OK
								});
								Ext.getCmp('finalizarButton').setDisabled(true);
							} else if (record) {
								Ext.getCmp('finalizarButton').setDisabled(false);
							}
						}
					}
				}),
				columns: [
					{
						header: 'Estado',
						dataIndex: 'IdFinalizado',
						width: 120,
						renderer: function(value, metaData) {
							if (value === '1') {
								metaData.style = 'background-color: #D3D3D3; color: black;';  // Fondo gris
								return 'Finalizado';
							} else {
								return 'Abierto';
							}
						}
					},
					{
						header: 'Despacho',
						dataIndex: 'TransId',
						width: 120
					}, 
					{
						header: 'RefEmpaque',
						dataIndex: 'RefEmpaque',
						width: 150//,
						//stopSelection: false
					},
					{
						header: 'Itemid',
						dataIndex: 'Itemid',
						groupable: true,
						headerCheckbox: true,
						width: 150,//,
						filter: 'string'
						
					}, 
					{
						header: 'Fecha Tansación',
						dataIndex: 'FechaTransaccion',
						groupable: true,
						hidden: true,
						headerCheckbox: true,
						width: 150//,
						//stopSelection: false
					},
					
					
					{
						header: 'Bodega',
						dataIndex: 'Piso',
						width: 100
					}, 
					{
						header: 'Cantidad',
						dataIndex: 'Qtyorder',
						width: 120
					},
					{
						//xtype: 'datecolumn',
						header: 'Enmano',
						dataIndex: 'enMano',
						hidden: false,
						//refenence: 'Name',
						width: 120
					},
					{
						//xtype: 'datecolumn',
						header: 'BinNum',
						dataIndex: 'BinNum',
						//refenence: 'Name',
						width: 120
					}, 
					{
						//xtype: 'datecolumn',
						header: 'BinOld',
						dataIndex: 'BimNumold',
						//refenence: 'Name',
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
						header: 'Id',
						dataIndex: 'Id',
						hidden: true,
						width: 100,
						
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
								case 8:
									metaData.tdCls = 'empacado';
									break;
							}

							return value;
						}
					}, 
					
					{
						header: 'Proveedor',
						dataIndex: 'VendorName',
						flex: 1,
						minWidth: 150,
						align: 'center',
					}, 
				
					
					{
						header: 'Fecha Localizado',
						dataIndex: 'HoraInicial',
						width: 190//,
						//stopSelection: false
					}, 
					
					{
						header: 'Responsable',
						dataIndex: 'NombreUsuario',

						width: 130
					},
					{
						header: 'Observacion',
						dataIndex: 'Observaciones',
						flex: 0.3,
						minWidth: 125,
						align: 'center',
						
					},
					{
						//xtype: 'datecolumn',
						header: 'AliasProv',
						dataIndex: 'AliasProv',
						hidden: true,
						//refenence: 'Name',
						width: 120
						
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
						if (record.data.IdFinalizado != 1)
						{
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro8").setDisabled(true);
							Ext.getCmp('Observacion').setValue(record.data.Observaciones);
							Ext.getCmp('tabpanel').setVisible(true);
	
							if(record.data.IdUsuario != null){
								Ext.getCmp("usuarios").setValue(record.data.IdUsuario);
							}
	
							if(record.data.IdProceso < 8){
								Ext.getCmp("pro"+(record.data.IdProceso+8)).setDisabled(false);
								Ext.getCmp("pro"+(record.data.IdProceso+8)).setValue(true);
								Ext.getCmp('BinNum').getStore().load({params: {bodega: record.data.Piso}});
								Ext.getCmp('BinNum').setValue(record.data.BinNum);
								//Ext.Msg.alert('Title', 'Basic message box in ExtJS ' + record.data.BinNum);
								
							}			
						}	
					},
					rowclick: function( viewTable, record, element, rowIndex, e, eOpts ) {
						if (record.data.IdFinalizado != 1)
						{
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro8").setDisabled(true);
							Ext.getCmp('Observacion').setValue(record.data.Observaciones);
							
	
							if(record.data.IdUsuario != null){
								Ext.getCmp("usuarios").setValue(record.data.IdUsuario);
							}
	
							if(record.data.IdProceso < 8){
								Ext.getCmp("pro"+(record.data.IdProceso+8)).setDisabled(false);
								Ext.getCmp("pro"+(record.data.IdProceso+8)).setValue(true);
								Ext.getCmp('BinNum').getStore().load({params: {bodega: record.data.Piso}});
								Ext.getCmp('BinNum').setValue(record.data.BinNum);
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
								// Arrange checkboxes into two columns, distributed vertically
								columns: 1,
								vertical: true,
								allowBlank: false,
listeners: {
                        scope: this,
                        change: function(checkbox) {
                            if (checkbox.checked) {
                                resetBoxes(checkbox.ownerCt, checkbox.inputValue);
                            }
                            /* not relevant for the understanding of the sample */
                            var panel = checkbox.ownerCt.ownerCt;
                            var f = panel.down('displayfield');
                            checkbox.checked ? checkbox.inputValue : 'none';
                        
                            /* so you can delete this, with the displayfield too */

                        }
                    },

								items: [
									
									{ boxLabel: 'Localizar', name: 'IdProceso', id: "pro8", inputValue: 8, disabled: true }
								]
							},
							{
								xtype: 'textareafield',
								id: 'Observacion',
								grow: true,
								fieldLabel: 'Observación',
								allowBlank: true,
								anchor: '98%'
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
								})
							},
						]
					}
				]
			})
		]
	});
});
