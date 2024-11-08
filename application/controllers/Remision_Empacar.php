<?php
defined('BASEPATH') OR exit('No direct script access allowed');

session_start();

class Remision_Empacar extends CI_Controller {

    public function respuesta()
    {
		$this->output
			->set_content_type('application/json','UTF-8')
			->set_output(json_encode($this->data));	
		return;
    }

    public function __construct() {
        parent::__construct();
        // Cargar modelos, bibliotecas, helpers, etc.

        $this->data = null;
    }

    public function index() {


        $this->load->view('remision_empacar');

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

    public function actualizarPicked() {
        $referencia = $this->input->post('referencia');
        $cantidadAgregada = $this->input->post('cantidadAgregada');
        $orden = $this->input->post('orden');
        $transid = $this->input->post('transid');
        $piso = $this->input->post('piso');
        $IdUsuario = $_SESSION['idusuario_bodegaitem'];
        $this->data = array();
    
        // Validar que todos los parámetros necesarios están presentes
        if (!$referencia || !$cantidadAgregada || !$orden || !$transid) {
            $this->data["mensaje"] = "Parámetros faltantes";
            return $this->respuesta();
        }
    
        // Asegurarse de que 'orden' es un entero
        $orden = intval($orden);
    
        // Construir la consulta usando sprintf
        $sql = sprintf(
            "UPDATE tblSoTransDetail SET packed='%s' WHERE TransID='%s' AND ItemId='%s' AND EntryNum='%d'",
            $this->db->escape_str($cantidadAgregada), 
            $this->db->escape_str($transid), 
            $this->db->escape_str($referencia), 
            $orden
        );
    
        // Ejecutar la consulta
        $query = $this->db->query($sql);
    
        // Comprobar si la consulta fue exitosa
        if ($this->db->affected_rows() > 0) {
            $this->data["mensaje"] = "Actualización exitosa";
        } else {
            $this->data["mensaje"] = "Error en la actualización o no hubo cambios";
        }

        $this->guardarHistorialPicked($transid, 3, $piso, $IdUsuario);
    
        $this->respuesta();
    }

    public function guardarHistorialPicked($transid, $IdTransTipo, $IdPiso, $IdUsuario)
    {

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialProcesoBodegaAdminItems] '%s', %d, '%s', %d, %d,'%s'",$transid, $IdTransTipo, $IdPiso, '',$IdUsuario, '' );

        $query = $this->db->query($sql);

        if ($query->num_rows() > 0)
        {
            return true;
        }
        else
        {
            return false;
        }

    }    

    public function finalizarPicking()
    {
        $transid = $this->input->post('transid');
        $piso = $this->input->post('piso');
        $IdUsuario = $_SESSION['idusuario_bodegaitem'];

        $result = $this->guardarHistorialPicked($transid, 4, $piso, $IdUsuario);

        if ($result) {
            $this->data["mensaje"] = "Actualización exitosa";
            $this->data["success"] = true;
        } else {
            $this->data["mensaje"] = "Error en la actualización o no hubo cambios";
            $this->data["success"] = false;
        }

        $this->respuesta();
    }

    public function reiniciarPicking()
    {
        $transid = $this->input->post('transid');

        $sql_picked = sprintf(
            "UPDATE tblSoTransDetail SET Packed='0' where TransID='%s'",
            $this->db->escape_str($transid)
        );

        // Ejecutar la consulta
        $query_picked = $this->db->query($sql_picked);

        /*
        $sql_proceso = sprintf(
            "UPDATE AGRInProcesoInventario SET idtranstipo='5' where TransID='%s'",
            $this->db->escape_str($transid)
        );

        $query_proceso = $this->db->query($sql_proceso);
        */

        if ($this->db->affected_rows() > 0)
        {
            $this->data["message"] = "Consulta exitosa";
            $this->data["success"] = true;
        }
        else
        {
            $this->data["message"] = "Error en la consulta";
            $this->data["success"] = false;
        }

        $this->respuesta();
    }
    
    
}