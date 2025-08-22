<?php
<<<<<<< HEAD
// --------------------------------------------
// RESPUESTA DIRECTA SI NO SE USA COMO CONTROLLER
// --------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['tipo']) && $_POST['tipo'] === 'remision') {
    header('Content-Type: application/json');
    echo json_encode([
        "ok" => true,
        "data" => [
            "TransId" => "01050841",
            "Cliente" => "Cliente Ejemplo",
            "Guia" => "GU123456",
            "Transportadora" => "Interrapidísimo",
            "TipoGuia" => "Normal",
            "Vendedor" => "Pedro Pérez",
            "Fecha" => "2025-07-05",
            "Observaciones" => "Sin novedades",
            "Flete" => "Pagado",
            "ValorFlete" => 15000,
            "Operario" => "Juan Rojas",
            "Administrador" => "Laura Torres",
            "FechaImpresion" => "2025-07-05"
        ]
    ]);
    exit;
}

// --------------------------------------------
// CONTROLADOR DE CODEIGNITER
// --------------------------------------------
defined('BASEPATH') OR exit('No direct script access allowed');
=======
// seguridad de CodeIgniter,  evita acceso directo al archivo
defined('BASEPATH') OR exit('No direct script access allowed');

// hereda del controlador BodegaDespacho (donde hay funcionalidades compartidas)
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
require_once(APPPATH . 'controllers/BodegaDespacho.php');

class BodegaGuias extends BodegaDespacho
{
    public function __construct()
    {
<<<<<<< HEAD
        parent::__construct();
        $this->data = null;
    }

=======
        parent::__construct(); // ejecuta el constructor del padre (BodegaDespacho)
        $this->data = null;    // variable para almacenar datos que se retornarán en las respuestas
    }

    // metodo privado que envia una respuesta JSON al frontend
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
    private function enviarRespuesta($resultado = [])
    {
        $this->output
            ->set_content_type('application/json', 'UTF-8')
<<<<<<< HEAD
            ->set_output(json_encode(["data" => $resultado]));
    }

=======
            ->set_output(json_encode(["data" => $resultado])); // devuelve un JSON con clave "data"
    }

    // carga la vista principal asociada a esta seccion
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
    public function index()
    {
        $this->load->view('seguimientoguias');
    }

<<<<<<< HEAD
=======
    // retorna una lista de guías despachadas filtradas por fecha o remision
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
    public function obtenerPickedList()
    {
        $fechaConsulta = $this->input->get("Fecha");
        $remision = $this->input->get("Remision");
<<<<<<< HEAD

        $where = "WHERE D.IdProceso = 2 AND D.TransId NOT LIKE '%*%'";

        if ($remision) {
            if (strpos($remision, '*') === 0) {
                $this->enviarRespuesta([]);
                return;
            } else {
                $remisionBase = explode('-', $this->db->escape_str($remision))[0];
                $where .= " AND (D.TransId LIKE '%" . $remisionBase . "%')";
            }
        } elseif (!empty($fechaConsulta)) {
            $where .= " AND CONVERT(VARCHAR, D.Fecha, 103) = CONVERT(VARCHAR, '" . $this->db->escape_str($fechaConsulta) . "', 103)";
        }

=======
        $guia = $this->input->get("Guia");
$guia = $this->input->get("Guia");

$where = "WHERE D.IdProceso = 2 AND D.TransId NOT LIKE '%*%'";

if (!empty($guia)) {
    $this->db->like('numguia', $guia); // Esto está bien solo si usas query builder
    $where .= " AND D.numguia LIKE '%" . $this->db->escape_like_str($guia) . "%'";
}

        if ($remision) {
            if (strpos($remision, '*') === 0) {
                // si empieza por asterisco, no se devuelve ningun resultado
                $this->enviarRespuesta([]);
                return;
            } else {
                // si tiene guion o cualquier otro valor, se filtra parcialmente por TransId
                $remisionBase = explode('-', $this->db->escape_str($remision))[0];
                $where .= " AND (D.TransId LIKE '%" . $remisionBase . "%')";
            }
        } else {
            // si no hay remision, se filtra por fecha (formato dda/mes/año)
            if (!empty($fechaConsulta)) {
                $where .= " AND CONVERT(VARCHAR, D.Fecha, 103) = CONVERT(VARCHAR, '" . $this->db->escape_str($fechaConsulta) . "', 103)";
            }
        }

        // consulta principal que trae los campos necesarios para mostrar en el grid
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
        $sql = "
            SELECT
                D.TransId,
                D.LocId AS Bodega,
                D.Idproceso AS Proceso,
                FORMAT(DATEADD(HOUR, -5, D.Fecha), 'dd/MM/yyyy HH:mm:ss') AS Fecha,
                B.CustName AS Cliente,
                D.Rep2Id AS Vendedor,
                D.NumGuia AS Guia,
                D.TipoGuia AS TipoGuia,
                E.Descrip AS Transportadora,
                ISNULL(D.Flete, 0) AS Flete,
                ISNULL(D.ValorFlete, 0) AS ValorFlete,
                U1.UserName AS Administrador,
                U2.UserName AS Operario,
                FORMAT(D.FechaImpresion, 'dd/MM/yyyy') AS FechaImpresion,
                ISNULL(D.Notes, '') AS Observaciones
            FROM AGRInProcesoDespacho D
            INNER JOIN tblArCust B ON D.IdCliente = B.CustId
            INNER JOIN AGRinTransportadoras E ON D.IdTransportadora = E.IdTransportadora
            LEFT JOIN TSM.dbo.[User] U1 ON D.IdUsuario = U1.UserId
            LEFT JOIN TSM.dbo.[User] U2 ON D.IdOperario = U2.UserId
            $where
            ORDER BY D.Fecha DESC
        ";

<<<<<<< HEAD
=======
        // ejecuta la consulta y envia la respuesta
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
        $query = $this->db->query($sql);
        $this->enviarRespuesta($query->result_array());
    }

<<<<<<< HEAD
=======
    // devuelve el detalle de referencias de una remision
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
    public function obtenerReferencias()
    {
        $transid = $this->input->get("TransId");
        $bodega = $this->input->get("Bodega");

<<<<<<< HEAD
=======
        // consulta que obtiene las referencias asociadas a una remision activa
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
        $sql = sprintf(
            "SELECT 
                d.ItemId AS Referencia,
                d.Descr,
                d.QtyOrdSell AS Cantidad_Pedida 
            FROM tblSoTransDetail d
            WHERE d.TransId = '%s'
                AND d.[Status] = '0'
                AND d.LocId = '%s'
            ORDER BY d.ItemId",
            $this->db->escape_str($transid), 
            $this->db->escape_str($bodega)
        );

        $query = $this->db->query($sql);
        $this->enviarRespuesta($query->result_array());
    }

<<<<<<< HEAD
=======
    // autocompletado para el combo de remisiones
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
    public function buscarRemisiones()
    {
        $query = $this->input->get("query");
        $query = $this->db->escape_like_str($query);
        $querySinGuion = explode('-', $query)[0];

<<<<<<< HEAD
=======
        // devuelve las 10 remisiones mas recientes coincidentes, excluyendo las que tienen '*'
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
        $sql = "
            SELECT TOP 10 TransId
            FROM AGRInProcesoDespacho
            WHERE IdProceso = 2
            AND TransId NOT LIKE '%*%'
            AND (
                TransId LIKE '%" . $querySinGuion . "%'
                OR TransId LIKE '%" . $query . "%'
            )
            ORDER BY TransId DESC
        ";

        $query = $this->db->query($sql);
        $this->enviarRespuesta($query->result_array());
    }

<<<<<<< HEAD
    public function consultarGuiaChatbot()
    {
        $tipo = $this->input->post('tipo');
        $valor = $this->input->post('valor');

        if (!$tipo || !$valor) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode(['ok' => false, 'msg' => 'Debes indicar tipo y valor a buscar.']));
            return;
        }

        $campo = $tipo === 'guia' ? 'D.NumGuia' : 'D.TransId';

        $sql = "
            SELECT
                D.TransId,
                D.LocId AS Bodega,
                D.Idproceso AS Proceso,
                FORMAT(DATEADD(HOUR, -5, D.Fecha), 'yyyy-MM-dd') AS Fecha,
                B.CustName AS Cliente,
                D.Rep2Id AS Vendedor,
                D.NumGuia AS Guia,
                D.TipoGuia AS TipoGuia,
                E.Descrip AS Transportadora,
                ISNULL(D.Flete, 0) AS Flete,
                ISNULL(D.ValorFlete, 0) AS ValorFlete,
                U1.UserName AS Administrador,
                U2.UserName AS Operario,
                FORMAT(D.FechaImpresion, 'dd/MM/yyyy') AS FechaImpresion,
                ISNULL(D.Notes, '') AS Observaciones
            FROM AGRInProcesoDespacho D
            INNER JOIN tblArCust B ON D.IdCliente = B.CustId
            INNER JOIN AGRinTransportadoras E ON D.IdTransportadora = E.IdTransportadora
            LEFT JOIN TSM.dbo.[User] U1 ON D.IdUsuario = U1.UserId
            LEFT JOIN TSM.dbo.[User] U2 ON D.IdOperario = U2.UserId
            WHERE D.IdProceso = 2 AND D.TransId NOT LIKE '%*%' AND $campo = ?
            ORDER BY D.Fecha DESC
        ";

        $query = $this->db->query($sql, [$valor]);

        if ($query->num_rows() > 0) {
            $row = (array) $query->row();
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode(['ok' => true, 'data' => $row]));
        } else {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode(['ok' => false, 'msg' => 'No se encontró información para esa búsqueda.']));
        }
    }
=======
  public function buscarGuias()
{
    $query = $this->input->get("query");
    $query = $this->db->escape_like_str($query);
    $querySinGuion = explode('-', $query)[0];

    $sql = "
        SELECT TOP 10 numguia
        FROM AGRInProcesoDespacho
        WHERE (numguia IS NOT NULL AND LTRIM(RTRIM(numguia)) != '')
        AND numguia LIKE '%" . $query . "%'
        ORDER BY numguia DESC
    ";

    $query = $this->db->query($sql);
    $this->enviarRespuesta($query->result_array());
}


>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
}
?>
