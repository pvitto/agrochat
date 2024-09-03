Ext.onReady(function() {
	var socket = io.connect('http://192.168.0.205:4000');
	var url = "/agro/BodegaDespacho/";

	var tipo = 1;
	var IdTransTipo = 0;

	function restablecer(){
		Ext.getCmp("form").getForm().reset();
		//Ext.getCmp("tabla").getView().setDisabled(false);
		Ext.getCmp('tabpanel').setVisible(false);
		Ext.getCmp("tabla").getStore().reload();
	};

	function actualizarInterfaz() {

		var boton_PorDespachar = Ext.getCmp('PorDespacharButton');
		var boton_Ubicados = Ext.getCmp('UbicadosButton');
		var boton_Depachados = Ext.getCmp('DespachadosButton');
		var boton_BuscarRemision = Ext.getCmp('BuscarButton');
		var textFieldRemision = Ext.getCmp('idRemision');
		var boton_Anular = Ext.getCmp('anularButton');
		var boton_Actualizar = Ext.getCmp('actualizarButton');

		var exportButton = Ext.getCmp('exportButton');
		var grid = Ext.getCmp('tabla'); 

		var adminColumn = grid.down('[itemId=adminColumn]');
		var operarioColumn = grid.down('[itemId=operarioColumn]');
		var transportadoraColumn = grid.down('[itemId=transportadoraColumn]');
		var ubicacionColumn = grid.down('[itemId=ubicacionColumn]');
		var guiaColumn = grid.down('[itemId=guiaColumn]');
		var fechaColumn = grid.down('[itemId=fechaColumn]');
		var fleteColumn = grid.down('[itemId=fleteColumn]');

		var transportadoraComboBox = Ext.getCmp('Transportadora');
		var binNumComboBox = Ext.getCmp('Localizacion');
		var fleteTextField = Ext.getCmp('Flete');
		var fechaDesapchoaCalendar = Ext.getCmp('FechaDespacho');
	

		var calendario = Ext.getCmp('fecha');

		// Ajustar visibiliad de elementos dependientes al tipo de proceso

		// Items correspondientes a Ubicados / Despachados
		exportButton.setDisabled(tipo !== 4 && tipo !== 6);
		adminColumn.setVisible(tipo === 4 || tipo === 6);
		operarioColumn.setVisible(tipo === 4 || tipo === 6);
		fechaColumn.setVisible(tipo === 6 || tipo === 4);
		boton_Actualizar.setVisible(tipo !== 1);


		// Items correspondientes exclusivamente a Despachados
		transportadoraColumn.setVisible(tipo === 4);
		guiaColumn.setVisible(tipo === 4);
		calendario.setVisible(tipo === 4);
		boton_Anular.setVisible(tipo === 4);
		fleteColumn.setVisible(tipo === 4);

		// Items correspondientes exclusivamente a Ubicados
		ubicacionColumn.setVisible(tipo === 6);
		
		// Items correspondientes exclusivamente a Por Despachar
		textFieldRemision.setVisible(tipo === 1); 
		boton_BuscarRemision.setVisible(tipo === 1);

		// Items tabpanel
		transportadoraComboBox.setVisible(false);
		binNumComboBox.setVisible(false);
		fleteTextField.setVisible(false);
		fechaDesapchoaCalendar.setVisible(false);

		Ext.getCmp('tabla').getStore().clearFilter();
		Ext.getCmp("form").getForm().reset();
		Ext.getCmp('tabpanel').setVisible(false);

		if (tipo === 1)
		{
			boton_PorDespachar.setDisabled(true);
			boton_Ubicados.setDisabled(false);
			boton_Depachados.setDisabled(false);
		}
		else if (tipo === 4)
		{
			boton_PorDespachar.setDisabled(false);
			boton_Ubicados.setDisabled(false);
			boton_Depachados.setDisabled(true);
			fechaColumn.setText("Fecha Despacho");
		}
		else if (tipo === 6)
		{
			boton_PorDespachar.setDisabled(false);
			boton_Ubicados.setDisabled(true);
			boton_Depachados.setDisabled(false);
			fechaColumn.setText("Fecha Ubicado");
		}

		
	}

	function limpiarEspacios(data) {
		Object.keys(data).forEach(key => {
			if (typeof data[key] === 'string') {
				data[key] = data[key].trim();
			}
		});
		return data;
	}
	
	function borrarColumnasExcel(data, tipo) {
		if (tipo === 4) {
			const columnasParaEliminar = [
				'id', 'Vendedor', 'TipoEnvio', 'Ubicacion', 'Administrador', 
				'Operario', 'Id', 'Fecha', 'IdDespachado'
			];
			columnasParaEliminar.forEach(columna => delete data[columna]);
			data['FIRMA'] = "";
		} else if (tipo === 6) {
			const columnasParaEliminar = [
				'id', 'Vendedor', 'Transportadora', 'Id', 'IdDespachado', 
				'IdCliente', 'Guia'
			];
			columnasParaEliminar.forEach(columna => delete data[columna]);
			data['Fecha Ubicado'] = data.Fecha;
			delete data.Fecha;
		}
	
		data = limpiarEspacios(data);
		return data;
	}
	
	function adjustColumnWidths(ws, data, headers) {
		var maxLengths = headers.map(header => header.length);
	
		data.forEach(row => {
			headers.forEach((header, i) => {
				var cellValue = String(row[header] || '');
				if (header == "FIRMA")
				{
					maxLengths[i] = 10;
				}
				else if (cellValue.length > maxLengths[i]) {
					maxLengths[i] = cellValue.length;
				}
			});
		});
	
		ws['!cols'] = headers.map((header, i) => ({
			wpx: maxLengths[i] * 7 || 60
		}));
	}

	function obtenerTransportadoras(callback) {
		Ext.Ajax.request({
			url: url + 'obtenerTransportadoras',
			method: 'GET',
			success: function(response) {
				try {
					var responseData = Ext.decode(response.responseText); // Decodificar la respuesta
					var transportadoras = responseData.data; // Obtener el arreglo 'data'
	
					if (Array.isArray(transportadoras)) {
						callback(transportadoras);
					} else {
						console.error('La propiedad "data" no es un arreglo:', transportadoras);
						Ext.Msg.alert('Error', 'Formato de respuesta inesperado. Por favor, revisa los datos.');
					}
				} catch (e) {
					console.error('Error al decodificar la respuesta:', e);
					Ext.Msg.alert('Error', 'Error al procesar la respuesta del servidor.');
				}
			},
			failure: function(response) {
				Ext.Msg.alert('Error', 'No se pudieron obtener las transportadoras.');
			}
		});
	}
	
	
	
	function exportarExcel(tipo) {
		var grid = Ext.getCmp('tabla');
		var store = grid.getStore();
		var workbook = XLSX.utils.book_new();
		var excelName = tipo === 4 ? "Despachados" : "Ubicados";
	
		if (tipo === 4) {
			obtenerTransportadoras(function(transportadoras) {
				var worksheetData = store.getData().items.map(function(record) {
					var data = record.getData();
					return borrarColumnasExcel(data, tipo);
				});
	
				if (worksheetData.length === 0) {
					Ext.Msg.alert('Error', 'No hay datos para exportar.');
					return;
				}
	
				var headers = Object.keys(worksheetData[0] || {});
				var worksheet = XLSX.utils.json_to_sheet([], { header: headers, skipHeader: true });
	
				var currentDate = new Date().toLocaleDateString();
				worksheet['A1'] = { v: 'RELACION DE DESPACHOS FECHA: ' + currentDate, t: 's' };
	
				var rowIndex = 3; // Starts from the third row after the title and empty row
	
				transportadoras.forEach(function(transportadora) {
					// Filtra los datos para la transportadora actual
					var dataPorTransportadora = worksheetData.filter(item => 
						item.Transportadora.trim().toLowerCase() === transportadora.Descrip.trim().toLowerCase()
					);
	
					// Solo agregar la transportadora si tiene datos
					if (dataPorTransportadora.length > 0) {
						// Añade el nombre de la transportadora
						var cellRef = 'A' + rowIndex++;
						worksheet[cellRef] = { v: transportadora.Descrip, t: 's' };
	
						// Añadir encabezados de tabla
						XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A' + rowIndex++ });
	
						// Añadir datos de la tabla
						XLSX.utils.sheet_add_json(worksheet, dataPorTransportadora, { header: headers, skipHeader: true, origin: 'A' + rowIndex });
	
						// Actualizar el índice de la fila para la próxima tabla
						rowIndex += dataPorTransportadora.length;
	
						// Añadir una fila vacía entre las tablas de transportadora
						rowIndex += 3; 
					}
				});
	
				adjustColumnWidths(worksheet, worksheetData, headers);
	
				// Actualizar el rango de la hoja de cálculo dinámicamente para cubrir el rango correcto
				var endRow = rowIndex - 1; // Última fila llenada
				worksheet['!ref'] = 'A1:L' + endRow;
	
				XLSX.utils.book_append_sheet(workbook, worksheet, excelName);
				XLSX.writeFile(workbook, excelName + '.xlsx');
	
				store.clearFilter();
				Ext.Msg.alert('Éxito', 'El archivo Excel se ha creado correctamente.');
			});
		} else {
			var worksheetData = store.getData().items.map(function(record) {
				var data = record.getData();
				return borrarColumnasExcel(data, tipo);
			});
	
			if (worksheetData.length === 0) {
				Ext.Msg.alert('Error', 'No hay datos para exportar.');
				return;
			}
	
			var headers = Object.keys(worksheetData[0] || {});
			var worksheet = XLSX.utils.json_to_sheet([], { header: headers, skipHeader: true });
	
			worksheet['A1'] = { v: 'RELACION DE MERCANCIA UBICADA', t: 's' };
			worksheet['A2'] = { v: '', t: 's' };
	
			XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A3' });
			XLSX.utils.sheet_add_json(worksheet, worksheetData, { header: headers, skipHeader: true, origin: 'A4' });
	
			adjustColumnWidths(worksheet, worksheetData, headers);
	
			// Ajustar el rango de la hoja de cálculo solo si hay datos
			if (worksheetData.length > 0) {
				var range = XLSX.utils.decode_range(worksheet['!ref']);
				worksheet['!ref'] = XLSX.utils.encode_range(range);
			}
	
			XLSX.utils.book_append_sheet(workbook, worksheet, excelName);
			XLSX.writeFile(workbook, excelName + '.xlsx');
	
			store.clearFilter();
			Ext.Msg.alert('Éxito', 'El archivo Excel se ha creado correctamente.');
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
			Ext.getCmp("Operarios").setVisible(false);
			Ext.getCmp("Observacion").setVisible(false);

			Ext.getCmp("proceso").setDisabled(true);
			//Ext.getCmp("usuarios").setDisabled(true);
			//Ext.getCmp("password").setDisabled(true);
			Ext.getCmp("Operarios").setDisabled(true);
			Ext.getCmp("Observacion").setDisabled(true);
		}
		else if (visible === true)
		{
			Ext.getCmp("pro2").setVisible(true);
			Ext.getCmp("pro3").setVisible(true);
			Ext.getCmp("proceso").setVisible(true);
			//Ext.getCmp("usuarios").setVisible(true);
			//Ext.getCmp("password").setVisible(true);
			Ext.getCmp("Operarios").setVisible(true);
			Ext.getCmp("Observacion").setVisible(true);

			Ext.getCmp("proceso").setDisabled(false);
			//Ext.getCmp("usuarios").setDisabled(false)
			//Ext.getCmp("password").setDisabled(false)
			Ext.getCmp("Operarios").setDisabled(false)
			Ext.getCmp("Observacion").setDisabled(false)
		}
	}
	


	// Crear la store
	var store = Ext.create('Ext.data.Store', {
		autoLoad: true,
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
			url: url + "obtenerPickedList",
			reader: {
				type: 'json',
				rootProperty: 'data'
			},
			extraParams: {
				Tipo: tipo 
			}
		},
		listeners: {
			// Desactivar botones antes de cargar la store
			beforeload: function() {

				Ext.getCmp('toolbar').setDisabled(true);
			},
			load: function(store, records, successful, operation, eOpts) {
				if (successful) { // Verifica si la carga fue exitosa
					Ext.getCmp('toolbar').setDisabled(false);
					actualizarInterfaz();
				}
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
						id: "toolbar",
						ui: 'footer',
						layout: {
							pack: 'left'
						},
						items: [
							{
								xtype: 'button',
								id: 'PorDespacharButton',
								text: 'Mostrar Por Despachar',
								disabled: true,
								handler: function() {
									tipo = 1;
									
									Ext.getCmp('tabla').getStore().reload({
										params: { Tipo: tipo,
											Remision: Ext.getCmp('idRemision').getValue().trim()
										}
									});
								}
							},
							"-",
							{
								xtype: 'button',
								id: 'UbicadosButton',
								text: 'Mostrar Ubicados',
								handler: function() {
									tipo = 6;
									
									Ext.getCmp('tabla').getStore().reload({
										params: { Tipo: tipo }
									});
								}
							},
							"-",
							{
								xtype: 'button',
								id: 'DespachadosButton',
								text: 'Mostrar Despachados',
								handler: function() {
									tipo = 4;
									

									Ext.getCmp('tabla').getStore().reload({
										params: { 
											Tipo: tipo,
											Fecha: Ext.getCmp('fecha').getRawValue() // Usa la fecha seleccionada o actual
										}
									});
								}
							},
							"-",
							{
								xtype: 'textfield',
								labelWidth: 160,
								id: 'idRemision',
								fieldLabel: 'Consultar Remision:',
								editable: true,
								width: 285
							},
							"-",
							{
								xtype: 'button',
								text: 'Buscar Remisión',
								id: 'BuscarButton',
								handler: function() {

									Ext.getCmp('tabla').getStore().reload({
										params: { 
											Tipo: tipo,
											Remision: Ext.getCmp('idRemision').getRawValue() // Usa la fecha seleccionada o actual
										}
									});
								}
							},							
							"-",
							{
								xtype: 'datefield',
								labelWidth: 120,
								id: 'fecha',
								fieldLabel: 'Seleccione fecha',
								value: new Date(),
								format: "Y-m-d",
								editable: false,
								width: 245,
								hidden: true,
								listeners: {
									select: function(field, value, eOpts) {
										Ext.getCmp('tabla').getStore().clearFilter();
										Ext.getCmp("form").getForm().reset();
										Ext.getCmp('tabpanel').setVisible(false);
										Ext.getCmp('tabla').getStore().reload({
											params: { 
												Tipo: tipo,
												Fecha: field.getRawValue()
											}
										});
									}
								},
								maxValue: new Date()
							},
							"-",
							{ 
								minWidth: 80,
								text: 'Actualizar', 
								id: 'actualizarButton',
								iconCls: 'fas fa-sync-alt', 
								hidden: false, 
								handler: function(){
								Ext.getCmp('tabla').getStore().clearFilter();
								Ext.getCmp("form").getForm().reset();
								//Ext.getCmp("tabla").getView().setDisabled(false);
								Ext.getCmp('tabpanel').setVisible(false);
								Ext.getCmp('tabla').getStore().reload();
							} },
							"->",
							{
								id: 'exportButton',
								xtype: 'button',
								text: 'Exportar a Excel',
								disabled: tipo == 1,
								iconCls: 'fas fa-caret-down',
								handler: function() {
									exportarExcel(tipo);
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
						header: 'ID',
						dataIndex: 'Id',
						itemId: 'idColumn',
						hidden: true,
						width: 50
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
						header: 'Guia',
						dataIndex: 'Guia',
						itemId: 'guiaColumn',
						hidden: true,
						headerCheckbox: true,
						width: 100,
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
								Ext.Msg.alert('Guia', cell.innerHTML.toLowerCase());
							}
						}
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
						flex: 1,
						minWidth: 100
					}, 
					{
						header: 'Cliente',
						dataIndex: 'Cliente',
						flex: 1,
						minWidth: 200
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Transportadora',
						dataIndex: 'Transportadora',
						itemId: 'transportadoraColumn',
						hidden: true,
						minWidth: 150
					}, 
					{
						//xtype: 'checkcolumn',
						header: 'Ubicacion',
						dataIndex: 'Ubicacion',
						itemId: 'ubicacionColumn',
						minWidth: 150
					},
					{
						//xtype: 'checkcolumn',
						header: 'Envio',
						dataIndex: 'TipoEnvio',
						hidden: true,
						minWidth: 100
					},
					{
						header: 'Flete',
						dataIndex: 'Flete',
						itemId: 'fleteColumn',
						hidden: true,
						minWidth: 100
					},
					{
						header: 'Fecha',
						dataIndex: 'Fecha',
						itemId: 'fechaColumn',
						hidden: true,
						groupable: true,
						headerCheckbox: true,
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
						//xtype: 'checkcolumn',
						header: 'Fecha Transación',
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
						flex: 1,
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
						minWidth: 150
					}, 
					{
						header: 'Operario',
						dataIndex: 'Operario',
						itemId: 'operarioColumn', // Asigna un itemId
						hidden: true,
						minWidth: 150
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
						if (tipo == 1 || tipo == 6)
						{
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro2").setDisabled(true);
							Ext.getCmp("pro3").setDisabled(true);
							Ext.getCmp('tabpanel').setVisible(true);

							Ext.getCmp('Localizacion').setVisible(false);
							Ext.getCmp('Transportadora').setVisible(false);
							Ext.getCmp('Guia').setVisible(false);
							Ext.getCmp('Flete').setVisible(false);
							Ext.getCmp('FechaDespacho').setVisible(false);
							
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
							if (record.get('Guia').trim() == "")
								{
									Ext.getCmp("Guia").setVisible(true);
								}
								else
								{
									Ext.getCmp("Guia").setVisible(false);
								}
									
								Ext.getCmp('tabpanel').setVisible(true);
								Ext.getCmp("form").setDisabled(false);
								Ext.getCmp("form").getForm().reset();
								
								setVisibilityForm(false);
							
						}
						
					},
					rowclick: function(viewTable, record, element, rowIndex, e, eOpts) {
						if (tipo == 1 || tipo == 6)
						{
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							Ext.getCmp("pro2").setDisabled(true);
							Ext.getCmp("pro3").setDisabled(true);
							Ext.getCmp('Localizacion').setVisible(false);
							Ext.getCmp('Transportadora').setVisible(false);
							Ext.getCmp('Guia').setVisible(false);
							Ext.getCmp('Flete').setVisible(false);
							Ext.getCmp('FechaDespacho').setVisible(false);
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
							}
						}
						else
						{
							if (record.get('Guia').trim() == "")
							{
								Ext.getCmp("Guia").setVisible(true);
							}
							else
							{
								Ext.getCmp("Guia").setVisible(false);
							}

							Ext.getCmp('tabpanel').setVisible(true);
							Ext.getCmp("form").setDisabled(false);
							Ext.getCmp("form").getForm().reset();
							
							setVisibilityForm(false);
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
											datos.IdTransTipo = IdTransTipo;
											datos.IdUsuario = Ext.getCmp("usuarios").getValue();
											datos.Idoperario = Ext.getCmp("Operarios").getValue();
											datos.Observaciones = Ext.getCmp("Observacion").getValue().trim();
											datos.FechaDespacho = "";
											datos.IdDespachado = "";
											datos.Guia = Ext.getCmp("Guia").getValue().trim();
											datos.Flete = "";
											datos.Proceso = fila.Proceso;
							
											if (datos.IdTransTipo == 2) {
												datos.BinNum = Ext.getCmp("Localizacion").getValue();

												if (datos.BinNum == null)
												{
													Ext.Msg.show({
														title: 'Atención!',
														message: 'Debe escoger una localización',
														buttons: Ext.Msg.OK,
														icon: Ext.Msg.WARNING
													});
													return false;
												}

												datos.Transportadora = "";

											} else if (datos.IdTransTipo == 3) {

												datos.Transportadora = Ext.getCmp("Transportadora").getValue();
												

												if (datos.Transportadora == null)
												{
													Ext.Msg.show({
														title: 'Atención!',
														message: 'Debe escoger una transportadora',
														buttons: Ext.Msg.OK,
														icon: Ext.Msg.WARNING
													});
													return false;
												}

												if (Ext.getCmp("FechaDespacho").getValue() != null)
												{
													datos.FechaDespacho = Ext.getCmp("FechaDespacho").getValue();
												}

												if (Ext.getCmp("Flete").getValue() != null)
												{
													datos.Flete = Ext.getCmp("Flete").getValue();
												}

												datos.BinNum = "";
											} else if (datos.Proceso == "DESPACHADO")
											{
												datos.IdTransTipo = 5;
												datos.IdDespachado = fila.Id;
												datos.BinNum = "";
												datos.Transportadora = "";

												if (datos.Guia == "")
												{
													Ext.Msg.show({
															title: 'Atención!',
															message: 'Debe ingresar una guia',
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.WARNING
														});
														return false;
												}
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

                            							Ext.Msg.show({
															title: 'Confirmación',
															message: confirmMessage,
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.INFO,
															fn: function() {
																Ext.getCmp('tabla').getStore().clearFilter();
																Ext.getCmp("form").getForm().reset();
																//Ext.getCmp("tabla").getView().setDisabled(false);
																Ext.getCmp('tabpanel').setVisible(false);
																Ext.getCmp('tabla').getStore().reload();
																
															}
														});
														
													}
													else
													{
														var errormessage = res.mensaje;

														Ext.Msg.show({
															title: 'Error',
															message: errormessage,
															buttons: Ext.Msg.OK,
															icon: Ext.Msg.ERROR, // Use Ext.Msg.ERROR to display an error symbol
															fn: function() {
																Ext.getCmp('tabla').getStore().clearFilter();
																Ext.getCmp("form").getForm().reset();
																//Ext.getCmp("tabla").getView().setDisabled(false);
																Ext.getCmp('tabpanel').setVisible(false);
																Ext.getCmp('tabla').getStore().reload();
															}
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
									},
									'->',
									{
										minWidth: 50,
										id: 'anularButton',
										iconCls: 'fas fa-times',
										hidden: true,
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


											Ext.Msg.confirm({
												title: 'Atención!',
												message: '¿Está seguro de anular este despacho?',
												buttons: Ext.Msg.YESNO,
												icon: Ext.Msg.WARNING,
												fn: function(btn) {
													if (btn === 'yes') {
														var datos = {};
														datos.TransId = fila.TransId;
														datos.IdTransTipo = 7;
														datos.IdUsuario = Ext.getCmp("usuarios").getValue();
														datos.Idoperario = Ext.getCmp("Operarios").getValue();
														datos.Observaciones = "";
														datos.FechaDespacho = "";
														datos.IdDespachado = fila.Id;
														datos.Guia = "";
														datos.Proceso = "";
														datos.BinNum = "";
														datos.Transportadora = "";
														datos.Flete = "";

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
																	var confirmMessage = "Despacho ha sido anulado.";

																	Ext.Msg.show({
																		title: 'Confirmación',
																		message: confirmMessage,
																		buttons: Ext.Msg.OK,
																		icon: Ext.Msg.INFO,
																		fn: function() {
																			Ext.getCmp('tabla').getStore().clearFilter();
																			Ext.getCmp("form").getForm().reset();
																			//Ext.getCmp("tabla").getView().setDisabled(false);
																			Ext.getCmp('tabpanel').setVisible(false);
																			Ext.getCmp('tabla').getStore().reload();
																		}
																	});
																	
																}
																else
																{
																	var errormessage = res.mensaje;

																	Ext.Msg.show({
																		title: 'Error',
																		message: errormessage,
																		buttons: Ext.Msg.OK,
																		icon: Ext.Msg.ERROR,
																		fn: function() {
																			Ext.getCmp('tabla').getStore().clearFilter();
																			Ext.getCmp("form").getForm().reset();
																			Ext.getCmp('tabpanel').setVisible(false);
																			Ext.getCmp('tabla').getStore().reload();
																		}
																	});
																}
															} catch (e) {
																Ext.Msg.alert('Error', 'La respuesta del servidor no es un JSON válido.');
															}
																
															}
														});
													} else {
														Ext.getCmp('tabla').getStore().clearFilter();
														Ext.getCmp("form").getForm().reset();
														//Ext.getCmp("tabla").getView().setDisabled(false);
														Ext.getCmp('tabpanel').setVisible(false);
														Ext.getCmp('tabla').getStore().reload();
													}
												}
											});											
							
											
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
										Ext.getCmp('Guia').setVisible(false);
										Ext.getCmp('FechaDespacho').setVisible(false);
										Ext.getCmp('Flete').setVisible(false);
							
										// Muestra el campo correspondiente basado en la selección
										if (newValue.IdProceso === 2) {
											Ext.getCmp('Localizacion').setVisible(true);
											Ext.getCmp('Transportadora').setVisible(false);
											Ext.getCmp('Guia').setVisible(false);
											Ext.getCmp('Flete').setVisible(false);
											Ext.getCmp('FechaDespacho').setVisible(false);
										} else if (newValue.IdProceso === 3) {
											Ext.getCmp('Transportadora').setVisible(true);
											Ext.getCmp('Localizacion').setVisible(false);
											Ext.getCmp('Guia').setVisible(true);
											Ext.getCmp('Flete').setVisible(true);
											Ext.getCmp('FechaDespacho').setVisible(true);
										}

										IdTransTipo = newValue.IdProceso;
										newValue.IdProceso = 0;
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
								xtype: 'combo',
								id: 'Flete',
								typeAhead: true,
								fieldLabel: 'Flete',
								triggerAction: 'all',
								queryMode: 'local',
								allowBlank: true,
								anchor: '98%',
								store: Ext.create('Ext.data.Store', {
									fields: ['Descrip'], 
									data: [
										{ Descrip: 'Contraentrega' }, 
										{ Descrip: 'Pagado' }         
									]
								}),
								displayField: 'Descrip',  
								valueField: 'Descrip',    
								hidden: false  

							},
							,
							{
								xtype: 'datefield',
								labelWidth: 120,
								id: 'FechaDespacho',
								fieldLabel: 'Seleccione fecha',
								value: new Date(),
								format: "Y-m-d",
								editable: false,
								width: 245,
								hidden: true,
								maxValue: new Date()
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
