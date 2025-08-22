<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WebServerCoordinadora extends CI_Controller {

    private $wsdlUrl = 'https://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php?wsdl'; // Reemplazar con la URL real del WSDL.

    public function __construct() {
        parent::__construct();
        $this->data = null;
    }

    public function index()
    {
        //echo base_url();
        $this->load->view('webservercoordinadora');
    }

    /**
     * Función para enviar solicitudes XML al WSDL.
     *
     * @param string $method El nombre del método a invocar.
     * @param array $params Parámetros necesarios para la solicitud.
     * @return mixed Respuesta del servicio WSDL.
     * @throws Exception Si ocurre un error en la solicitud.
     */
    private function enviarSolicitudXML($method, $params) {
        try {
            $client = new SoapClient($this->wsdlUrl, ['trace' => 1, 'exceptions' => true]);
            $response = $client->__soapCall($method, [$params]);
            return $response;
        } catch (SoapFault $e) {
            log_message('error', 'Error al enviar solicitud XML: ' . $e->getMessage());
            throw new Exception('Error al conectar con el servicio WSDL.');
        }
    }

    public function respuesta()
    {
		$this->output
			->set_content_type('application/json','UTF-8')
			->set_output(json_encode($this->data));	
		return;
    }

    public function generarGuia() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision,
            'fecha' => $this->data->Fecha,
            'id_cliente' => $this->data->IdCliente,
            'id_remitente' => $this->data->IdRemitente,
            'nit_remitente' => $this->data->NitRemitente,
            'nombre_remitente' => $this->data->NombreRemitente,
            'direccion_remitente' => $this->data->DireccionRemitente,
            'telefono_remitente' => $this->data->TelefonoRemitente,
            'ciudad_remitente' => $this->data->CiudadRemitente,
            'nit_destinatario' => $this->data->NitDestinatario,
            'div_destinatario' => $this->data->DivDestinatario,
            'nombre_destinatario' => $this->data->NombreDestinatario,
            'direccion_destinatario' => $this->data->DireccionDestinatario,
            'ciudad_destinatario' => $this->data->CiudadDestinatario,
            'telefono_destinatario' => $this->data->TelefonoDestinatario,
            'valor_declarado' => $this->data->ValorDeclarado,
            'codigo_cuenta' => $this->data->CodigoCuenta,
            'codigo_producto' => $this->data->CodigoProducto,
            'nivel_servicio' => $this->data->NivelServicio,
            'contenido' => $this->data->Contenido,
            'referencia' => $this->data->Referencia,
            'observaciones' => $this->data->Observaciones,
            'estado' => $this->data->Estado,
            'detalle' => $this->data->Detalle
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.generarGuia', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_remision) && !empty($response->codigo_remision)) {
                // Guardar el PDF si está disponible.
                if (isset($response->pdf_guia) && !empty($response->pdf_guia)) {
                    file_put_contents('guia.pdf', base64_decode($response->pdf_guia));
                }
    
                // Preparar respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guía generada con éxito.',
                    'data' => [
                        'codigo_remision' => $response->codigo_remision,
                        'pdf_path' => isset($response->pdf_guia) ? 'guia.pdf' : null
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo generar la guía.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function anularGuia() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Número de la guía a anular
            'usuario' => $this->data->Usuario,              // Usuario asignado (Ej: prefijo.usuario)
            'clave' => hash('sha256', $this->data->Clave)   // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.anularGuia', $params);
    
            // Procesar la respuesta.
            if (isset($response->resultado) && $response->resultado === 'exito') {
                // Preparar respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guía anulada con éxito.',
                    'data' => [
                        'codigo_remision' => $params['codigo_remision']
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo anular la guía.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }    

    public function liquidacionGuia() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Código de remisión para consultar
            'usuario' => $this->data->Usuario,               // Usuario asignado (Ej: prefijo.usuario)
            'clave' => hash('sha256', $this->data->Clave)    // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.liquidacionGuia', $params);
    
            // Procesar la respuesta.
            if (isset($response->flete_fijo) && isset($response->flete_variable) && isset($response->flete_total)) {
                // Preparar datos para la salida.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Liquidación obtenida correctamente',
                    'data' => [
                        'flete_fijo' => $response->flete_fijo,
                        'flete_variable' => $response->flete_variable,
                        'flete_total' => $response->flete_total
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo obtener la liquidación de la guía',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function generarDespacho() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'guias' => $this->data->Guias, // Array de códigos de guías
            'margen_izquierdo' => $this->data->MargenIzquierdo, // Margen izquierdo para el PDF
            'margen_superior' => $this->data->MargenSuperior,  // Margen superior para el PDF
            'tipo_impresion' => $this->data->TipoImpresion,    // Tipo de impresión (LASER, LASER_RESUMIDA, POS_PDF, POS_PLANO)
            'usuario' => $this->data->Usuario,                // Usuario asignado (Ej: prefijo.usuario)
            'clave' => hash('sha256', $this->data->Clave)     // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.generarDespacho', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_despacho) && !empty($response->codigo_despacho)) {
                // Guardar el archivo si está disponible.
                if (isset($response->impresion) && !empty($response->impresion)) {
                    file_put_contents('despacho_impresion.pdf', base64_decode($response->impresion));
                }
    
                // Preparar respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho generado con éxito.',
                    'data' => [
                        'url' => $response->url ?? null,
                        'codigo_despacho' => $response->codigo_despacho,
                        'id_cliente' => $response->id_cliente,
                        'nit_cliente' => $response->nit_cliente,
                        'div_cliente' => $response->div_cliente,
                        'pdf_path' => isset($response->impresion) ? 'despacho_impresion.pdf' : null
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo generar el despacho.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function generarDespacharLevantePrevio() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'ids_clientes' => $this->data->IdsClientes, // Array de identificadores de clientes
            'usuario' => $this->data->Usuario,         // Usuario asignado (Ej: prefijo.usuario)
            'clave' => hash('sha256', $this->data->Clave) // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.generarDespacharLevantePrevio', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_despacho) && !empty($response->codigo_despacho)) {
                // Preparar respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho generado con éxito.',
                    'data' => [
                        'codigo_despacho' => $response->codigo_despacho,
                        'id_cliente' => $response->id_cliente,
                        'nit_cliente' => $response->nit_cliente,
                        'div_cliente' => $response->div_cliente
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo generar el despacho.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }

    public function reimprimirGuia() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Número de la guía que se reimprime
            'margen_izquierdo' => $this->data->MargenIzquierdo, // Margen izquierdo para el PDF
            'margen_superior' => $this->data->MargenSuperior,   // Margen superior para el PDF
            'formato_impresion' => $this->data->FormatoImpresion, // Formato de impresión
            'usuario' => $this->data->Usuario,                // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)     // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.reimprimirGuia', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_remision) && isset($response->pdf) && !empty($response->pdf)) {
                // Decodificar el PDF y guardarlo como archivo local.
                $filePath = 'reimpresion_guia_' . $response->codigo_remision . '.pdf';
                file_put_contents($filePath, base64_decode($response->pdf));
    
                // Preparar la respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guía reimpresa con éxito.',
                    'data' => [
                        'codigo_remision' => $response->codigo_remision,
                        'pdf_path' => $filePath
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo reimprimir la guía.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function reimprimirDespacho() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_despacho' => $this->data->CodigoDespacho, // Número del despacho que se reimprime
            'margen_izquierdo' => $this->data->MargenIzquierdo, // Margen izquierdo para el PDF
            'margen_superior' => $this->data->MargenSuperior,   // Margen superior para el PDF
            'usuario' => $this->data->Usuario,                // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)     // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.reimprimirDespacho', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_despacho) && isset($response->pdf) && !empty($response->pdf)) {
                // Decodificar el PDF y guardarlo como archivo local.
                $filePath = 'reimpresion_despacho_' . $response->codigo_despacho . '.pdf';
                file_put_contents($filePath, base64_decode($response->pdf));
    
                // Preparar la respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho reimpreso con éxito.',
                    'data' => [
                        'codigo_despacho' => $response->codigo_despacho,
                        'pdf_path' => $filePath
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo reimprimir el despacho.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function reimprimirDespachoPlano() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la solicitud.
        $params = [
            'codigo_despacho' => $this->data->CodigoDespacho, // Número del despacho que se reimprime
            'usuario' => $this->data->Usuario,                // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)     // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.reimprimirDespachoPlano', $params);
    
            // Procesar la respuesta.
            if (isset($response->codigo_despacho) && isset($response->tiquete) && !empty($response->tiquete)) {
                // Decodificar el tiquete y guardarlo como archivo de texto.
                $filePath = 'reimpresion_despacho_plano_' . $response->codigo_despacho . '.txt';
                file_put_contents($filePath, base64_decode($response->tiquete));
    
                // Preparar la respuesta en caso de éxito.
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho plano reimpreso con éxito.',
                    'data' => [
                        'codigo_despacho' => $response->codigo_despacho,
                        'tiquete_path' => $filePath
                    ]
                ];
            } else {
                // Manejo de error en la respuesta.
                $this->data = [
                    'status' => 'error',
                    'message' => $response->mensaje ?? 'No se pudo reimprimir el despacho plano.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }

    public function consultarDespachos() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios para la consulta.
        $params = [
            'id_cliente' => $this->data->IdCliente,              // Código de cliente
            'fecha_inicial' => $this->data->FechaInicial ?? '',  // Fecha inicial del rango de consulta
            'fecha_final' => $this->data->FechaFinal ?? '',      // Fecha final del rango de consulta
            'usuario_despacha' => $this->data->UsuarioDespacha ?? '', // Usuario que generó el despacho
            'codigo_despacho' => $this->data->CodigoDespacho ?? 0, // Código de despacho (0 si no se utiliza)
            'codigo_remision' => $this->data->CodigoRemision ?? '', // Código de remisión (vacío si no se utiliza)
            'referencia' => $this->data->Referencia ?? '',        // Documento de referencia (vacío si no se utiliza)
            'usuario' => $this->data->Usuario,                    // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)         // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.consultarDespachos', $params);
    
            // Verificar si la respuesta contiene los despachos.
            if (isset($response->despachos) && is_array($response->despachos)) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despachos consultados con éxito.',
                    'data' => $response->despachos
                ];
            } else {
                // Respuesta en caso de no encontrar despachos.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontraron despachos con los criterios especificados.',
                    'data' => []
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function consultarRetornoRDFD() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Código de remisión inicial
            'apikey' => $this->data->ApiKey,                 // API Key provisto por Coordinadora
            'password' => hash('sha256', $this->data->Password) // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.consultarRetornoRDFD', $params);
    
            // Verificar si la respuesta contiene la guía de retorno.
            if (isset($response->remision_retorno) && !empty($response->remision_retorno)) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guía de retorno consultada con éxito.',
                    'data' => [
                        'remision_retorno' => $response->remision_retorno
                    ]
                ];
            } else {
                // Respuesta en caso de que no se encuentre la guía de retorno.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontró guía de retorno para la remisión especificada.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function actualizarPesoVolumenRetornoRDFD() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Código de remisión de retorno
            'nro_doc_radicados' => $this->data->NroDocRadicados, // Número de documento radicados
            'apikey' => $this->data->ApiKey,                   // API Key provisto por Coordinadora
            'password' => hash('sha256', $this->data->Password) // Clave codificada con SHA-256
        ];
    
        try {
            $response = $this->enviarSolicitudXML('Guias.actualizarPesoVolumenRetornoRDFD', $params);
    
            // Verificar si la respuesta contiene el id_con.
            if (isset($response->id_con) && !empty($response->id_con)) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Peso y volumen actualizados con éxito.',
                    'data' => [
                        'id_con' => $response->id_con
                    ]
                ];
            } else {
                // Respuesta en caso de que no se haya actualizado correctamente.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se pudo actualizar el peso y volumen del retorno.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function generarDespachoRDFD() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision, // Código de la remisión de retorno
            'id_con' => $this->data->IdCon,                   // ID de cliente de la guía de retorno
            'atributo_opcional' => isset($this->data->AtributoOpcional) ? $this->data->AtributoOpcional : false, // Parámetro opcional
            'apikey' => $this->data->ApiKey,                  // API Key provisto por Coordinadora
            'password' => hash('sha256', $this->data->Password) // Clave codificada con SHA-256
        ];
    
        try {
            // Llamada al método de la API para generar el despacho.
            $response = $this->enviarSolicitudXML('Guias.generarDespachoRDFD', $params);
    
            // Verificar si la respuesta es satisfactoria.
            if ($response) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho generado correctamente.',
                    'data' => null
                ];
            } else {
                // Respuesta en caso de que la operación no sea exitosa.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se pudo generar el despacho.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }

    public function rastreoSimple() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigos_remision' => $this->data->CodigosRemision, // Array de códigos de remisión de las guías a rastrear
            'usuario' => $this->data->Usuario,                  // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)       // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para realizar el rastreo.
            $response = $this->enviarSolicitudXML('Guias.rastreoSimple', $params);
    
            // Verificar si la respuesta es satisfactoria y devolver la información de las guías rastreadas.
            if ($response) {
                $rastreoResultados = [];
                foreach ($response as $guia) {
                    $rastreoResultados[] = [
                        'codigo_remision' => $guia->codigo_remision,
                        'codigo_estado' => $guia->codigo_estado,
                        'descripcion_estado' => $guia->descripcion_estado,
                        'fecha_entrega' => $guia->fecha_entrega,
                        'hora_entrega' => $guia->hora_entrega,
                        'guia_vinculadas' => $guia->guia_vinculadas
                    ];
                }
    
                $this->data = [
                    'status' => 'success',
                    'message' => 'Rastreo realizado correctamente.',
                    'data' => $rastreoResultados
                ];
            } else {
                // Respuesta en caso de que no se pueda realizar el rastreo.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontró información para las guías proporcionadas.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
     
    public function rastreoExtendido() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigos_remision' => $this->data->CodigosRemision, // Array de códigos de remisión de las guías a rastrear
            'usuario' => $this->data->Usuario,                  // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)       // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para realizar el rastreo extendido.
            $response = $this->enviarSolicitudXML('Guias.rastreoExtendido', $params);
    
            // Verificar si la respuesta es satisfactoria y devolver la información de las guías rastreadas.
            if ($response) {
                $rastreoResultados = [];
                foreach ($response as $guia) {
                    $rastreoResultados[] = [
                        'codigo_remision' => $guia->codigo_remision,
                        'codigo_estado' => $guia->codigo_estado,
                        'descripcion_estado' => $guia->descripcion_estado,
                        'fecha_recogida' => $guia->fecha_recogida,
                        'fecha_entrega' => $guia->fecha_entrega,
                        'hora_entrega' => $guia->hora_entrega,
                        'nombre_origen' => $guia->nombre_origen,
                        'nombre_destino' => $guia->nombre_destino,
                        'referencia' => $guia->referencia,
                        'detalle_estados' => $guia->detalle_estados,
                        'detalle_novedades' => $guia->detalle_novedades,
                        'guias_vinculadas' => $guia->guias_vinculadas
                    ];
                }
    
                $this->data = [
                    'status' => 'success',
                    'message' => 'Rastreo extendido realizado correctamente.',
                    'data' => $rastreoResultados
                ];
            } else {
                // Respuesta en caso de que no se pueda realizar el rastreo.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontró información para las guías proporcionadas.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function detalleDespacho() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'id_cliente' => $this->data->IdCliente,               // ID del cliente
            'fecha_despacho' => $this->data->FechaDespacho,       // Fecha de despacho (opcional)
            'codigo_despacho' => $this->data->CodigoDespacho,     // Número del despacho
            'usuario' => $this->data->Usuario,                    // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)         // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para obtener el detalle del despacho.
            $response = $this->enviarSolicitudXML('Guias.detalleDespacho', $params);
    
            // Verificar si la respuesta es satisfactoria y devolver la información de las guías incluidas en el despacho.
            if ($response) {
                $detalleDespachoResultados = [];
                foreach ($response as $guia) {
                    $detalleDespachoResultados[] = [
                        'codigo_despacho' => $guia->codigo_despacho,
                        'detalle' => $guia->detalle
                    ];
                }
    
                $this->data = [
                    'status' => 'success',
                    'message' => 'Detalle de despacho obtenido correctamente.',
                    'data' => $detalleDespachoResultados
                ];
            } else {
                // Respuesta en caso de que no se pueda obtener el detalle del despacho.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontró información para el despacho proporcionado.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function estadoRecaudo() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigo_remision' => $this->data->CodigoRemision,  // Código de remisión
            'referencia' => $this->data->Referencia,            // Referencia del recaudo
            'usuario' => $this->data->Usuario,                  // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)       // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para obtener el estado del recaudo.
            $response = $this->enviarSolicitudXML('Guias.estadoRecaudo', $params);
    
            // Verificar si la respuesta contiene el estado.
            if ($response) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Estado de recaudo obtenido correctamente.',
                    'data' => [
                        'estado' => $response->estado,          // Estado: pendiente, efectivo, anulado
                        'fecha' => $response->fecha             // Fecha del estado en formato AAAA-MM-DD
                    ]
                ];
            } else {
                // Respuesta en caso de que no se pueda obtener el estado del recaudo.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontró información para el recaudo proporcionado.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function ciudades() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'usuario' => $this->data->Usuario,                  // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)       // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para obtener las ciudades.
            $response = $this->enviarSolicitudXML('Guias.ciudades', $params);
    
            // Verificar si la respuesta contiene ciudades.
            if ($response && isset($response->ciudades)) {
                $ciudades = [];
                foreach ($response->ciudades as $ciudad) {
                    $ciudades[] = [
                        'codigo' => $ciudad->codigo,                         // Código de la ciudad
                        'nombre' => $ciudad->nombre,                         // Nombre de la ciudad
                        'codigo_departamento' => $ciudad->codigo_departamento,  // Código del departamento
                        'nombre_departamento' => $ciudad->nombre_departamento  // Nombre del departamento
                    ];
                }
    
                $this->data = [
                    'status' => 'success',
                    'message' => 'Ciudades obtenidas correctamente.',
                    'data' => $ciudades
                ];
            } else {
                // Respuesta en caso de que no se encuentren ciudades.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se encontraron ciudades.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function generarDespachoMovil() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'accion' => $this->data->accion,                         // Acción a realizar
            'equipo' => $this->data->equipo,                         // Identificador del equipo
            'movil' => $this->data->movil,                           // Identificador del móvil
            'recibidor' => $this->data->recibidor,                   // Identificador del recibidor
            'guias' => $this->data->guias,                           // Códigos de guías a incluir en el despacho
            'usuario' => $this->data->Usuario,                       // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)            // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para generar el despacho móvil.
            $response = $this->enviarSolicitudXML('Guias.generarDespachoMovil', $params);
    
            // Verificar si la respuesta contiene datos esperados.
            if ($response) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Despacho móvil generado correctamente.',
                    'codigo_despacho' => $response->codigo_despacho,
                    'tiquete' => $response->tiquete,
                    'id_cliente' => $response->id_cliente,
                    'message' => $response->message
                ];
            } else {
                // Respuesta en caso de que no se obtenga un código de despacho.
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se pudo generar el despacho móvil.',
                    'codigo_despacho' => null,
                    'tiquete' => null,
                    'id_cliente' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'codigo_despacho' => null,
                'tiquete' => null,
                'id_cliente' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function imprimirRotulos() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'id_rotulo' => $this->data->id_rotulo,                         // Id del tipo de rótulo
            'codigos_remisiones' => $this->data->codigos_remisiones,       // Array de códigos de remisiones
            'usuario' => $this->data->Usuario,                             // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)                  // Clave codificada con el algoritmo sha256
        ];
    
        try {
            // Llamada al método de la API para imprimir los rótulos.
            $response = $this->enviarSolicitudXML('Guias.imprimirRotulos', $params);
    
            // Verificar si la respuesta contiene datos esperados.
            if ($response && isset($response->rotulos)) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Rótulos generados correctamente.',
                    'rotulos' => $response->rotulos,              // PDF en base64
                    'rotulosRd' => isset($response->rotulosRd) ? $response->rotulosRd : null // PDF en base64 del rótulo RD
                ];
            } else {
                // Respuesta en caso de error al generar los rótulos.
                $this->data = [
                    'status' => 'error',
                    'error' => true,
                    'errorMessage' => 'No se pudieron generar los rótulos.',
                    'rotulos' => null,
                    'rotulosRd' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'error' => true,
                'errorMessage' => 'Error en la solicitud: ' . $e->getMessage(),
                'rotulos' => null,
                'rotulosRd' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function reimprimirGuias() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'id_remisiones' => $this->data->id_remisiones,               // IDs de las guías
            'margen_izquierdo' => $this->data->margen_izquierdo,         // Margen izquierdo
            'margen_superior' => $this->data->margen_superior,           // Margen superior
            'formato_impresion' => $this->data->formato_impresion,       // Formato de impresión
            'usuario' => $this->data->Usuario,                           // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)                // Clave codificada en sha256
        ];
    
        try {
            // Llamada al método de la API para reimprimir guías.
            $response = $this->enviarSolicitudXML('Guias.reimprimirGuias', $params);
    
            // Verificar si la respuesta contiene el archivo PDF en base64.
            if ($response && isset($response->pdf)) {
                // Decodificar el PDF y guardarlo en un archivo.
                $pdfData = base64_decode($response->pdf);
                $filePath = 'reimpresion_guias.pdf';
                file_put_contents($filePath, $pdfData);
    
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guías reimpresas correctamente.',
                    'filePath' => $filePath
                ];
            } else {
                // Respuesta en caso de error al reimprimir las guías.
                $this->data = [
                    'status' => 'error',
                    'error' => true,
                    'errorMessage' => 'No se pudo reimprimir las guías.',
                    'filePath' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'error' => true,
                'errorMessage' => 'Error en la solicitud: ' . $e->getMessage(),
                'filePath' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function generarGuiaInter() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'codigo_remision' => $this->data->codigo_remision,              // Código de remisión
            'fecha' => $this->data->fecha,                                  // Fecha de generación de la guía
            'id_cliente' => $this->data->id_cliente,                        // ID del cliente
            'id_remitente' => $this->data->id_remitente,                    // ID del remitente
            'nombre_remitente' => $this->data->nombre_remitente,            // Nombre del remitente
            'direccion_remitente' => $this->data->direccion_remitente,      // Dirección del remitente
            'telefono_remitente' => $this->data->telefono_remitente,        // Teléfono del remitente
            'ciudad_remitente' => $this->data->ciudad_remitente,            // Ciudad del remitente (código dane)
            'nit_destinatario' => $this->data->nit_destinatario,            // NIT del destinatario
            'div_destinatario' => $this->data->div_destinatario,            // División del destinatario
            'nombre_destinatario' => $this->data->nombre_destinatario,      // Nombre del destinatario
            'direccion_destinatario' => $this->data->direccion_destinatario, // Dirección del destinatario
            'codigo_ciudad_destinatario_inter' => $this->data->codigo_ciudad_destinatario_inter, // Código ciudad del destinatario
            'nombre_ciudad_destinatario_inter' => $this->data->nombre_ciudad_destinatario_inter, // Nombre ciudad internacional
            'pais_destinatario_inter' => $this->data->pais_destinatario_inter, // País internacional
            'codigo_postal_destinatario_inter' => $this->data->codigo_postal_destinatario_inter, // Código postal internacional
            'impuestos_origen_inter' => $this->data->impuestos_origen_inter, // Pago de impuestos en origen (0 o 1)
            'telefono_destinatario' => $this->data->telefono_destinatario, // Teléfono del destinatario
            'valor_declarado' => $this->data->valor_declarado,              // Valor declarado del envío (USD)
            'codigo_cuenta' => $this->data->codigo_cuenta,                  // Código de cuenta
            'codigo_producto' => $this->data->codigo_producto,              // Código del producto
            'nivel_servicio' => $this->data->nivel_servicio,                // Nivel de servicio (1, 2, 3)
            'contenido' => $this->data->contenido,                          // Contenido del envío
            'referencia' => $this->data->referencia,                        // Documento de referencia
            'observaciones' => $this->data->observaciones,                  // Observaciones
            'estado' => $this->data->estado,                                // Estado de la guía (PENDIENTE o IMPRESO)
            'detalle' => $this->data->detalle,                              // Detalle de la guía (array de registros)
            'cuenta_contable' => $this->data->cuenta_contable,              // Cuenta contable (opcional)
            'centro_costos' => $this->data->centro_costos,                  // Centro de costos (opcional)
            'id_rotulo' => $this->data->id_rotulo,                          // ID del rótulo (0 para no generar)
            'usuario' => $this->data->Usuario,                              // Usuario asignado
            'clave' => hash('sha256', $this->data->Clave)                   // Clave codificada en sha256
        ];
    
        try {
            // Llamada al método de la API para generar la guía internacional.
            $response = $this->enviarSolicitudXML('Guias.generarGuiaInter', $params);
    
            if ($response) {
                // Verificar si la respuesta contiene un archivo PDF (si el estado es "IMPRESO").
                if (isset($response->pdf_rotulo) && $params['estado'] === 'IMPRESO') {
                    // Decodificar y guardar el PDF en un archivo.
                    $pdfData = base64_decode($response->pdf_rotulo);
                    $filePath = 'guia_inter_' + $response->codigo_remision + '.pdf';
                    file_put_contents($filePath, $pdfData);
    
                    $this->data = [
                        'status' => 'success',
                        'id_remision' => $response->id_remision,
                        'codigo_remision' => $response->codigo_remision,
                        'message' => 'Guía internacional generada correctamente.',
                        'filePath' => $filePath
                    ];
                } else {
                    // Respuesta en caso de que no se genere el PDF o se envíe un estado "PENDIENTE".
                    $this->data = [
                        'status' => 'success',
                        'id_remision' => $response->id_remision,
                        'codigo_remision' => $response->codigo_remision,
                        'message' => 'Guía registrada pero no se generó el PDF.',
                        'filePath' => null
                    ];
                }
            } else {
                // Respuesta en caso de error al generar la guía.
                $this->data = [
                    'status' => 'error',
                    'error' => true,
                    'errorMessage' => 'No se pudo generar la guía internacional.',
                    'filePath' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'error' => true,
                'errorMessage' => 'Error en la solicitud: ' . $e->getMessage(),
                'filePath' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }
    
    public function editarGuia() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros de entrada.
        $params = [
            'id_remision' => $this->data->IdRemision,
            'codigo_remision' => $this->data->CodigoRemision,
            'id_cliente' => $this->data->IdCliente,
            'id_remitente' => $this->data->IdRemitente,
            'nombre_remitente' => $this->data->NombreRemitente,
            'direccion_remitente' => $this->data->DireccionRemitente,
            'telefono_remitente' => $this->data->TelefonoRemitente,
            'ciudad_remitente' => $this->data->CiudadRemitente,
            'nit_destinatario' => $this->data->NitDestinatario,
            'div_destinatario' => $this->data->DivDestinatario,
            'nombre_destinatario' => $this->data->NombreDestinatario,
            'direccion_destinatario' => $this->data->DireccionDestinatario,
            'ciudad_destinatario' => $this->data->CiudadDestinatario,
            'telefono_destinatario' => $this->data->TelefonoDestinatario,
            'valor_declarado' => $this->data->ValorDeclarado,
            'codigo_cuenta' => $this->data->CodigoCuenta,
            'codigo_producto' => $this->data->CodigoProducto,
            'contenido' => $this->data->Contenido,
            'referencia' => $this->data->Referencia,
            'observaciones' => $this->data->Observaciones,
            'detalle' => json_encode($this->data->Detalle),
            'cuenta_contable' => $this->data->CuentaContable,
            'centro_costos' => $this->data->CentroCostos,
            'margen_izquierdo' => $this->data->MargenIzquierdo,
            'margen_superior' => $this->data->MargenSuperior,
            'id_rotulo' => $this->data->IdRotulo,
            'formato_impresion' => $this->data->FormatoImpresion,
            'usuario' => $this->data->Usuario,
            'clave' => hash('sha256', $this->data->Clave)
        ];
    
        try {
            // Llamada al método de la API para editar la guía.
            $response = $this->enviarSolicitudXML('Guias.editarGuia', $params);
    
            // Verificar si la respuesta contiene los detalles de la guía editada.
            if ($response) {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Guía editada correctamente.',
                    'id_remision' => $response->id_remision,
                    'codigo_remision' => $response->codigo_remision,
                    'pdf_guia' => base64_decode($response->pdf_guia),
                    'pdf_rotulo' => base64_decode($response->pdf_rotulo)
                ];
    
                // Guardar los archivos PDF si están presentes.
                if (!empty($response->pdf_guia)) {
                    file_put_contents('pdf_guia_' . $response->id_remision . '.pdf', base64_decode($response->pdf_guia));
                }
                if (!empty($response->pdf_rotulo)) {
                    file_put_contents('pdf_rotulo_' . $response->id_remision . '.pdf', base64_decode($response->pdf_rotulo));
                }
            } else {
                $this->data = [
                    'status' => 'info',
                    'message' => 'No se pudo editar la guía.',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            // Manejo de excepciones.
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Enviar la respuesta.
        $this->respuesta();
    }

    public function rotuloPrevio()
    {
        $this->data = json_decode($this->input->post("datos"));

        // Parámetros para la API
        $params = [
            'codigo_remision' => $this->data->codigo_remision,
            'cuenta' => $this->data->cuenta,
            'nivel_servicio' => $this->data->nivel_servicio,
            'direccion_destinatario' => $this->data->direccion_destinatario,
            'ciudad_destino' => $this->data->ciudad_destino,
            'telefono_destinatario' => $this->data->telefono_destinatario,
            'nombre_destinatario' => $this->data->nombre_destinatario,
            'direccion_remitente' => $this->data->direccion_remitente,
            'ciudad_origen' => $this->data->ciudad_origen,
            'telefono_remitente' => $this->data->telefono_remitente,
            'nombre_remitente' => $this->data->nombre_remitente,
            'numero_unidad' => $this->data->numero_unidad,
            'tipo_respuesta' => $this->data->tipo_respuesta,
            'id_cliente' => $this->data->id_cliente,
            'usuario' => $this->data->usuario,
            'clave' => hash('sha256', $this->data->clave), // Codificación SHA-256
        ];

        try {
            // Llamada a la API
            $response = $this->enviarSolicitudXML('Guias.rotuloPrevio', $params);

            // Verificar respuesta y procesar datos
            if (!empty($response->error)) {
                $this->data = [
                    'status' => 'error',
                    'message' => $response->error,
                    'data' => null,
                ];
            } else {
                $this->data = [
                    'status' => 'success',
                    'message' => 'Rótulo generado correctamente.',
                    'data' => [
                        'etiqueta1d' => $response->etiqueta1d,
                        'etiqueta2d' => $response->etiqueta2d,
                        'nombre_nivel_servicio' => $response->nombre_nivel_servicio,
                        'abreviado_cuenta' => $response->abreviado_cuenta,
                        'abreviado_producto' => $response->abreviado_producto,
                        'codigo_terminal_origen' => $response->codigo_terminal_origen,
                        'abreviado_terminal_origen' => $response->abreviado_terminal_origen,
                        'codigo_terminal_destino' => $response->codigo_terminal_destino,
                        'abreviado_terminal_destino' => $response->abreviado_terminal_destino,
                        'zona_reparto' => $response->zona_reparto,
                        'subzona_reparto' => $response->subzona_reparto,
                        'referencia_detalle' => $response->referencia_detalle,
                        'pdf' => $response->pdf, // PDF en base64
                        'fecha_impresion' => $response->fecha_impresion,
                    ],
                ];
            }
        } catch (Exception $e) {
            $this->data = [
                'status' => 'error',
                'message' => 'Error en la solicitud: ' . $e->getMessage(),
                'data' => null,
            ];
        }

        // Enviar respuesta
        $this->respuesta();
    }

    public function rotuloPrevioRD() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros obligatorios y opcionales enviados en la solicitud.
        $params = [
            'codigo_remision' => $this->data->codigo_remision,               // Código de remisión
            'cuenta' => $this->data->cuenta,                               // Código de cuenta del cliente
            'nivel_servicio' => $this->data->nivel_servicio,               // Nivel de servicio
            'direccion_destinatario' => $this->data->direccion_destinatario,
            'ciudad_destino' => $this->data->ciudad_destino,               // Código DANE de la ciudad del destinatario
            'telefono_destinatario' => $this->data->telefono_destinatario,
            'nombre_destinatario' => $this->data->nombre_destinatario,
            'direccion_remitente' => $this->data->direccion_remitente,
            'ciudad_origen' => $this->data->ciudad_origen,                 // Código DANE de la ciudad remitente
            'telefono_remitente' => $this->data->telefono_remitente,
            'nombre_remitente' => $this->data->nombre_remitente,
            'numero_unidad' => $this->data->numero_unidad,                 // Número de unidad a rotular
            'tipo_respuesta' => $this->data->tipo_respuesta,               // Tipo de respuesta (P: PDF, D: Datos)
            'id_cliente' => $this->data->id_cliente,                      // ID del cliente
            'usuario' => $this->data->usuario,                            // Usuario asignado
            'clave' => hash('sha256', $this->data->clave)                 // Clave codificada SHA-256
        ];
    
        try {
            // Llamada a la API para generar el rótulo previo.
            $response = $this->enviarSolicitudXML('Guias.rotuloPrevioRD', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta.
            $this->data = [
                'status' => 'success',
                'message' => 'Rótulo generado exitosamente.',
                'data' => [
                    'dataRd' => $response->dataRd ?? null,
                    'pdfRd' => $response->pdfRd ?? null,
                    'etiqueta1d' => $response->etiqueta1d,
                    'etiqueta2d' => $response->etiqueta2d,
                    'nombre_nivel_servicio' => $response->nombre_nivel_servicio,
                    'abreviado_cuenta' => $response->abreviado_cuenta,
                    'abreviado_producto' => $response->abreviado_producto,
                    'codigo_terminal_origen' => $response->codigo_terminal_origen,
                    'abreviado_terminal_origen' => $response->abreviado_terminal_origen,
                    'codigo_terminal_destino' => $response->codigo_terminal_destino,
                    'abreviado_terminal_destino' => $response->abreviado_terminal_destino,
                    'zona_reparto' => $response->zona_reparto,
                    'subzona_reparto' => $response->subzona_reparto,
                    'referencia_detalle' => $response->referencia_detalle,
                    'pdf' => $response->pdf,
                    'fecha_impresion' => $response->fecha_impresion
                ]
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al generar el rótulo: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
    public function rotuloIntegracionPorUnidad() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros enviados en la solicitud.
        $params = [
            'codigo_remision' => $this->data->codigo_remision,           // Código de la remisión (obligatorio)
            'numero_unidad' => $this->data->numero_unidad,               // Número de unidades de la guía (obligatorio)
            'usuario' => $this->data->usuario,                          // Usuario asignado
            'clave' => hash('sha256', $this->data->clave)               // Clave codificada SHA-256
        ];
    
        try {
            // Llamada a la API para generar los rótulos por unidad.
            $response = $this->enviarSolicitudXML('Guias.rotuloIntegracionPorUnidad', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta en caso de éxito.
            $this->data = [
                'status' => 'success',
                'message' => 'Rótulos generados exitosamente.',
                'data' => [
                    'rotulos' => $response->rotulos ?? [],
                    'generacionRotulos' => $response->generacionRotulos ?? null
                ]
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al generar los rótulos: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
    public function novedadReetiquetado() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Parámetros enviados en la solicitud.
        $params = [
            'unidad_entrada' => $this->data->unidad_entrada,     // Código de la unidad a eliminar (obligatorio)
            'unidad_salida' => $this->data->unidad_salida,       // Código de la unidad de reemplazo (obligatorio)
            'usuario' => $this->data->usuario,                  // Usuario asignado
            'clave' => hash('sha256', $this->data->clave)       // Clave codificada SHA-256
        ];
    
        try {
            // Llamada a la API para registrar la novedad de reetiquetado.
            $response = $this->enviarSolicitudXML('Guias.novedadReetiquetado', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta en caso de éxito.
            $this->data = [
                'status' => 'success',
                'message' => 'Reetiquetado procesado exitosamente.',
                'data' => null
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al procesar el reetiquetado: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
    public function sugerirSifa() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Construcción de los parámetros para la solicitud.
        $params = [
            'detalle' => $this->data->detalle,                    // Detalle de la guía (al menos un registro obligatorio)
            'nivel_servicio' => $this->data->nivel_servicio,      // Código del nivel de servicio
            'cnit' => $this->data->cnit,                         // NIT del cliente
            'cdiv' => $this->data->cdiv,                         // Div del cliente
            'rcodigo_cm_ciudad' => $this->data->rcodigo_cm_ciudad, // Código ciudad origen (interno)
            'dcodigo_cm_ciudad' => $this->data->dcodigo_cm_ciudad, // Código ciudad destino (interno)
            'codigo_cuenta' => $this->data->codigo_cuenta,       // Código de la cuenta
            'valor_declarado' => $this->data->valor_declarado,   // Valor declarado del envío
            'liquidacion_enguia' => $this->data->liquidacion_enguia, // Define si cotiza o liquida en guía
            'liquidacion_endespacho' => $this->data->liquidacion_endespacho, // Define si cotiza o liquida en despacho
            'codigo_producto' => $this->data->codigo_producto,   // Código del producto
            'token' => $this->data->token                        // Token del cliente
        ];
    
        try {
            // Llamada a la API para obtener sugerencias SIFA.
            $response = $this->enviarSolicitudXML('Sifa.sugerirSifa', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta en caso de éxito.
            $this->data = [
                'status' => 'success',
                'message' => 'Sugerencias obtenidas exitosamente.',
                'data' => [
                    'validado' => $response->validado,
                    'unidades' => $response->unidades,
                    'volumen' => $response->volumen,
                    'pesoReal' => $response->pesoReal,
                    'productoGuia' => $response->productoGuia,
                    'sugerencias' => $response->sugerencias,
                    'codigoCuenta' => $response->codigoCuenta,
                    'nombreCuenta' => $response->nombreCuenta,
                    'abreviadoCuenta' => $response->abreviadoCuenta
                ]
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al obtener sugerencias: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
    public function liquidarSifa() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Construcción de los parámetros para la solicitud.
        $params = [
            'detalle' => $this->data->detalle,                    // Detalle de la guía (al menos un registro obligatorio)
            'nivel_servicio' => $this->data->nivel_servicio,      // Código del nivel de servicio
            'recaudos' => $this->data->recaudos ?? [],            // Detalle del recaudo (opcional, puede ser vacío)
            'cnit' => $this->data->cnit,                         // NIT del cliente
            'cdiv' => $this->data->cdiv,                         // Div del cliente
            'rcodigo_cm_ciudad' => $this->data->rcodigo_cm_ciudad, // Código ciudad origen (interno)
            'dcodigo_cm_ciudad' => $this->data->dcodigo_cm_ciudad, // Código ciudad destino (interno)
            'codigo_cuenta' => $this->data->codigo_cuenta,       // Código de la cuenta
            'valor_declarado' => $this->data->valor_declarado,   // Valor declarado del envío
            'liquidacion_enguia' => $this->data->liquidacion_enguia, // Define si cotiza o liquida en guía
            'liquidacion_endespacho' => $this->data->liquidacion_endespacho, // Define si cotiza o liquida en despacho
            'codigo_producto' => $this->data->codigo_producto,   // Código del producto
            'token' => $this->data->token                        // Token del cliente
        ];
    
        try {
            // Llamada a la API para realizar la liquidación SIFA.
            $response = $this->enviarSolicitudXML('Sifa.liquidarSifa', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta en caso de éxito.
            $this->data = [
                'status' => 'success',
                'message' => 'Liquidación realizada exitosamente.',
                'data' => [
                    'ubl' => $response->ubl,
                    'producto' => $response->producto,
                    'nombreProducto' => $response->nombreProducto,
                    'abreviadoProducto' => $response->abreviadoProducto,
                    'nombreUbl' => $response->nombreUbl,
                    'abreviadoUbl' => $response->abreviadoUbl,
                    'codigoCuenta' => $response->codigoCuenta,
                    'nombreCuenta' => $response->nombreCuenta,
                    'abreviadoCuenta' => $response->abreviadoCuenta,
                    'cotizacion' => $response->cotizacion
                ]
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al realizar la liquidación: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
    public function liquidarFullTarifaSifa() {
        $this->data = json_decode($this->input->post("datos"));
    
        // Construcción de los parámetros para la solicitud.
        $params = [
            'detalle' => $this->data->detalle,                    // Detalle de la guía (al menos un registro obligatorio)
            'nivel_servicio' => $this->data->nivel_servicio,      // Código del nivel de servicio
            'recaudos' => $this->data->recaudos ?? [],            // Detalle del recaudo (opcional, puede ser vacío)
            'cnit' => $this->data->cnit,                         // NIT del cliente
            'cdiv' => $this->data->cdiv,                         // Div del cliente
            'rcodigo_cm_ciudad' => $this->data->rcodigo_cm_ciudad, // Código ciudad origen (interno)
            'dcodigo_cm_ciudad' => $this->data->dcodigo_cm_ciudad, // Código ciudad destino (interno)
            'codigo_cuenta' => $this->data->codigo_cuenta,       // Código de la cuenta
            'valor_declarado' => $this->data->valor_declarado,   // Valor declarado del envío
            'liquidacion_enguia' => $this->data->liquidacion_enguia, // Define si cotiza o liquida en guía
            'liquidacion_endespacho' => $this->data->liquidacion_endespacho, // Define si cotiza o liquida en despacho
            'codigo_producto' => $this->data->codigo_producto,   // Código del producto
            'token' => $this->data->token,                       // Token del cliente
            'full_tarifa' => $this->data->full_tarifa            // Tipo de liquidación: Full o no
        ];
    
        try {
            // Llamada a la API para realizar la liquidación SIFA Full Tarifa.
            $response = $this->enviarSolicitudXML('Sifa.liquidarFullTarifaSifa', $params);
    
            // Validación de la respuesta.
            if (!empty($response->error)) {
                throw new Exception($response->error);
            }
    
            // Construcción de la respuesta en caso de éxito.
            $this->data = [
                'status' => 'success',
                'message' => 'Liquidación Full Tarifa realizada exitosamente.',
                'data' => [
                    'ubl' => $response->ubl,
                    'producto' => $response->producto,
                    'nombreProducto' => $response->nombreProducto,
                    'abreviadoProducto' => $response->abreviadoProducto,
                    'nombreUbl' => $response->nombreUbl,
                    'abreviadoUbl' => $response->abreviadoUbl,
                    'codigoCuenta' => $response->codigoCuenta,
                    'nombreCuenta' => $response->nombreCuenta,
                    'abreviadoCuenta' => $response->abreviadoCuenta,
                    'cotizacion' => $response->cotizacion,
                    'cotizacionPlena' => $response->cotizacionPlena // Datos adicionales para la cotización plena
                ]
            ];
        } catch (Exception $e) {
            // Manejo de errores en caso de falla.
            $this->data = [
                'status' => 'error',
                'message' => 'Error al realizar la liquidación Full Tarifa: ' . $e->getMessage(),
                'data' => null
            ];
        }
    
        // Envío de la respuesta final.
        $this->respuesta();
    }
    
}
