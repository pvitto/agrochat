<?php
// seguridad de CodeIgniter,  evita acceso directo al archivo
defined('BASEPATH') OR exit('No direct script access allowed');

// hereda del controlador BodegaDespacho (donde hay funcionalidades compartidas)
require_once(APPPATH . 'controllers/BodegaDespacho.php');

class BodegaGuias extends BodegaDespacho
{
    public function __construct()
    {
        parent::__construct(); // ejecuta el constructor del padre (BodegaDespacho)
        $this->data = null;    // variable para almacenar datos que se retornarán en las respuestas
    }

    // metodo privado que envia una respuesta JSON al frontend
    private function enviarRespuesta($resultado = [])
    {
        $this->output
            ->set_content_type('application/json', 'UTF-8')
            ->set_output(json_encode(["data" => $resultado])); // devuelve un JSON con clave "data"
    }

    // carga la vista principal asociada a esta seccion
    public function index()
    {
        $this->load->view('seguimientoguias');
    }

    // retorna una lista de guías despachadas filtradas por fecha o remision
    public function obtenerPickedList()
    {
        $fechaConsulta = $this->input->get("Fecha");
        $remision = $this->input->get("Remision");
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

        // ejecuta la consulta y envia la respuesta
        $query = $this->db->query($sql);
        $this->enviarRespuesta($query->result_array());
    }

    // devuelve el detalle de referencias de una remision
    public function obtenerReferencias()
    {
        $transid = $this->input->get("TransId");
        $bodega = $this->input->get("Bodega");

        // consulta que obtiene las referencias asociadas a una remision activa
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

    // autocompletado para el combo de remisiones
    public function buscarRemisiones()
    {
        $query = $this->input->get("query");
        $query = $this->db->escape_like_str($query);
        $querySinGuion = explode('-', $query)[0];

        // devuelve las 10 remisiones mas recientes coincidentes, excluyendo las que tienen '*'
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


}
?>
