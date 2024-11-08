<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class BodegaItem_Admin extends CI_Controller {

    /**
     * Index Page for this controller.
     *
     * Maps to the following URL
     * 		http://example.com/index.php/welcome
     *	- or -
     * 		http://example.com/index.php/welcome/index
     *	- or -
     * Since this controller is set as the default controller in
     * config/routes.php, it's displayed at http://example.com/
     *
     * So any other public methods not prefixed with an underscore will
     * map to /index.php/welcome/<method_name>
     * @see https://codeigniter.com/user_guide/general/urls.html
     */
    public function __construct()
    {
        parent::__construct();
        /*header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        $method = $_SERVER['REQUEST_METHOD'];
        if($method == "OPTIONS") {
            die();
        }*/

        $this->data = null;
    }

    public function respuesta()
    {
		$this->output
			->set_content_type('application/json','UTF-8')
			->set_output(json_encode($this->data));	
		return;
    }

    public function index()
    {
        //echo base_url();
        $this->load->view('bodegaitem_admin');
    }
	
    public function obtenerPickedList()
    {
        $this->data = array();

        // Obtener la fecha de transacción del parámetro de entrada
        $fecha = $this->input->get("FechaTransaccion");

        // Consulta principal para obtener la información de la remisión
        $sql = "SELECT
                    f.TransId,
                    CONVERT(VARCHAR, F.FechaTransaccion, 103) AS FechaTransaccion,
                    CONVERT(VARCHAR, F.FechaPicked, 103) AS FechaImpresion,
                    ISNULL(F.IdTransTipo, 0) AS IdProceso,
                    ISNULL(t.Nombre, 'PICKED') AS Proceso,
                    ISNULL(t.Orden, 0) AS Orden,
                    f.CustName,
                    f.[Name],
                    (CONVERT(VARCHAR, f.HoraInicial, 103) + ' ' + FORMAT(f.HoraInicial, 'hh:mm:ss tt')) AS HoraInicial,
                    (CONVERT(VARCHAR, f.HoraFinal, 103) + ' ' + FORMAT(f.HoraFinal, 'hh:mm:ss tt')) AS HoraFinal,
                    f.Piso,
                    f.LocId,
                    F.IdUsuario AS IdUsuario,
                    S.UserName AS NombreUsuario,
                    F.Observaciones,
                    CASE WHEN g.ShipToID = 'MOSTRADOR' THEN 'Mostrador' ELSE '' END AS TipoEnvio
                FROM
                    [AGR].[dbo].[AGRInProcesoInventario] F
                INNER JOIN
                    tblsotransheader g ON f.transid = g.transid AND f.Estado = 0
                LEFT JOIN
                    [AGR].[dbo].[AGRInTipoTransaccion] T ON F.IdTransTipo = T.IdTransTipo
                LEFT JOIN
                    [TSM].[dbo].[User] S ON S.UserId = F.IdUsuario
                WHERE
                    CONVERT(VARCHAR, f.FechaPicked, 103) = CONVERT(VARCHAR, ?, 103) 
                    AND g.transtype = 5
                    AND F.Estado = 0
                    AND g.Voidyn = '0'
                ORDER BY
                    F.FechaPicked DESC";

        // Ejecutar la consulta principal
        $query = $this->db->query($sql, array($fecha));

        // Recorrer los resultados de la consulta principal
        foreach ($query->result() as $row) {
            // Subconsulta para obtener el total de items y los items con picked != 0
            if ($row->IdProceso < 3)
            {
                $sql_items = "SELECT 
                            COUNT(*) AS TotalItems,
                            SUM(CASE WHEN picked != 0 THEN 1 ELSE 0 END) AS PickedItems
                        FROM tblSoTransDetail 
                        WHERE TransID = ?";
            }
            else
            {
                $sql_items = "SELECT 
                            COUNT(*) AS TotalItems,
                            SUM(CASE WHEN packed != 0 THEN 1 ELSE 0 END) AS PickedItems
                        FROM tblSoTransDetail 
                        WHERE TransID = ?";
            }
            
            
            // Ejecutar la subconsulta con parámetros
            $query_items = $this->db->query($sql_items, array($row->TransId));
            $items_result = $query_items->row();
            
            // Verificar si hay resultados y asignar valores
            $total_items = $items_result->TotalItems ?? 0;
            $picked_items = $items_result->PickedItems ?? 0;

            // Añadir los datos al array
            $this->data["data"][] = array(
                "TransId" => $row->TransId,
                "IdProceso" => $row->IdProceso,
                "Orden" => $row->Orden,
                "TransType" => $row->Proceso,
                "CustName" => $row->CustName,
                "Name" => $row->Name,
                "FechaTransaccion" => $row->FechaTransaccion,
                "FechaImpresion" => $row->FechaImpresion,
                "HoraInicial" => $row->HoraInicial,
                "HoraFinal" => $row->HoraFinal,
                "Piso" => $row->Piso,
                "Bodega" => $row->LocId,
                "IdUsuario" => $row->IdUsuario,
                "NombreUsuario" => $row->NombreUsuario,
                "Observaciones" => $row->Observaciones,
                "TipoEnvio" => $row->TipoEnvio,
                "TotalItems" => $total_items,      
                "PickedItems" => $picked_items     
            );
        }

        // Devolver la respuesta
        $this->respuesta();
    }


    public function obtenerUsuarios()
    {
        $this->data = array();

        //$this->load->view('welcome_message');
        $sql = "select 
                u.UserId, u.UserName, u.Clave 
            from 
                [TSM].[dbo].[UserCompanyGroup] g 
                inner join [TSM].[dbo].[UserCompany] c on g.UserCompId=c.UserCompId  
                inner join [TSM].[dbo].[User] u on c.UserId=u.UserId 
            where 
                GroupId=57 and IsActive=1";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("UserId"=>$row->UserId, "UserName"=>$row->UserName, "Password"=>$row->Clave);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }  
    
    public function obtenerUsuariosAdmin()
    {
        $this->data = array();

        //$this->load->view('welcome_message');
        $sql = "select 
                u.UserId, u.UserName, u.Clave 
            from 
                [TSM].[dbo].[UserCompanyGroup] g 
                inner join [TSM].[dbo].[UserCompany] c on g.UserCompId=c.UserCompId  
                inner join [TSM].[dbo].[User] u on c.UserId=u.UserId 
            where 
                GroupId=57 and IsActive=1 and AdminBodega=1";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("UserId"=>$row->UserId, "UserName"=>$row->UserName, "Password"=>$row->Clave);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    } 
	
    public function obtenerReferencias()
    {
		$transid = $this->input->get("TransId");
		$piso = $this->input->get("Piso");
        $bodega = $this->input->get("Bodega");
        $this->data = array();

        //$this->load->view('welcome_message');
		$sql = sprintf("select d.entrynum Orden,e.cf_Ruta Ruta, d.ItemId Referencia, e.ExtLocID Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, d.picked as Picked, d.packed Packed, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) Existencias,
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Comprt,

(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) - 
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Disp
			from tblSoTransHeader H
			inner join tblSoTransDetail d on d.TransID=H.TransId
			inner join trav_tblInItem_view I on d.ItemId=I.ItemId
			inner join tblInItemLoc l on  d.ItemId=l.ItemId and d.LocId=l.LocId
			left join trav_tblWmExtLoc_view E on l.DfltBinNum=e.ExtLocID
			where H.TransId='%s' and (e.[cf_Ubicacion Fisica]='%s' or e.[cf_Ubicacion Fisica] is NULL) and d.[status]='0' and h.Voidyn='0' and d.LocId='%s'
			group by H.TransID, [cf_Ubicacion Fisica], d.ItemId, e.ExtLocID, d.Descr, d.QtyOrdSell, i.[cf_Referencia Equivalente], e.cf_Ruta, d.LocId, d.entrynum,Picked,Packed
			order by e.cf_Ruta",$transid, $piso,$bodega);

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {

            if ($row->Picked == NULL)
            {
                $row->Picked = 0;
            }

            if($row->Packed == null)
            {
                $row->Packed = 0;
            }

            $this->data["data"][] = array(
                "Orden"=>$row->Orden, 
                "Ruta"=>$row->Ruta, 
                "Referencia"=>$row->Referencia, 
                "Localizacion"=>$row->Localizacion, 
                "Descr"=>$row->Descr, 
                "Cantidad_Pedida"=>$row->Cantidad_Pedida,
                "Existencias"=>$row->Existencias,
                "Comprt"=>$row->Comprt,
                "Disp"=>$row->Disp, 
                "Referencia_Equivalente"=>$row->Referencia_Equivalente,
                "Picked"=>$row->Picked,
                "Packed"=>$row->Packed

);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }

    public function guardarHistorialPicked()
    {

        $this->data = json_decode($this->input->post("datos"));

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialProcesoBodegaAdminItems] '%s', %d, '%s', %d, %d,'%s'",$this->data->TransId, $this->data->IdTransTipo, $this->data->IdPiso, $this->data->IdUsuario,$this->data->Idoperario, $this->data->Observaciones );

        $query = $this->db->query($sql);

        $this->data = array();
        $this->data["mensaje"] = $query->row()->Mensaje;

        $this->respuesta();
        //$this->load->view('welcome_message');
    }    
}
