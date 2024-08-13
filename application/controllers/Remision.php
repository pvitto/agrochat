<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Remision extends CI_Controller {

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
        // Obtener los parámetros de la URL
        $transid = $this->input->get('transid');
        $piso = $this->input->get('piso');
        $bodega = $this->input->get('bodega');

        // Validar los parámetros
        if (!empty($transid) && !empty($piso) && !empty($bodega)) {
            // Pasar los datos a la vista o al modelo según sea necesario
            $data = array(
                'transid' => $transid,
                'piso' => $piso,
                'bodega' => $bodega,
                // Puedes agregar otros datos que necesites cargar en la vista
            );

            // Cargar la vista con los datos
            $this->load->view('remision', $data);
        } else {
            // Manejar el caso donde los parámetros no son válidos
            show_error('Parámetros de remisión no válidos.');
        }
    }

    public function obtenerReferencias()
    {
		$transid = $this->input->get("TransId");
		$piso = $this->input->get("Piso");
        $bodega = $this->input->get("Bodega");
        $this->data = array();

        //$this->load->view('welcome_message');
		$sql = sprintf("select d.entrynum Orden,e.cf_Ruta Ruta, d.ItemId Referencia, e.ExtLocID Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
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
			group by H.TransID, [cf_Ubicacion Fisica], d.ItemId, e.ExtLocID, d.Descr, d.QtyOrdSell, i.[cf_Referencia Equivalente], e.cf_Ruta, d.LocId, d.entrynum
			order by e.cf_Ruta",$transid, $piso,$bodega);

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("Orden"=>$row->Orden, "Ruta"=>$row->Ruta, "Referencia"=>$row->Referencia, "Localizacion"=>$row->Localizacion, "Descr"=>$row->Descr, "Cantidad_Pedida"=>$row->Cantidad_Pedida,
 "Existencias"=>$row->Existencias,"Comprt"=>$row->Comprt,"Disp"=>$row->Disp, "Referencia_Equivalente"=>$row->Referencia_Equivalente);
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
        $observaciones = $this->input->post('observaciones');
        $IdUsuario = $this->input->post('id');
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
            "UPDATE tblSoTransDetail SET picked='%s' WHERE TransID='%s' AND ItemId='%s' AND EntryNum='%d'",
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

        $this->guardarHistorialPicked($transid, 1, $piso, $IdUsuario, $IdUsuario, $observaciones);
    
        $this->respuesta();
    }

    public function guardarHistorialPicked($transid, $IdTransTipo, $IdPiso, $IdUsuario, $IdOperario, $Observaciones)
    {

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialProcesoBodegaAdmin] '%s', %d, '%s', %d, %d,'%s'",$transid, $IdTransTipo, $IdPiso, $IdUsuario,$IdOperario, $Observaciones );

        $query = $this->db->query($sql);

        if ($query->num_rows() > 0)
        {
            $message = "Estado de picking actualizado exitosamente.";
        }
        else
        {
            $message = "Error al actualizar estado de picking.";
        }

        echo "<script>console.log('".addslashes($message)."');</script>";

    }    
    
    public function obtenerPicked() {
        $referencia = $this->input->get('referencia');
        $orden = $this->input->get('orden');
        $transid = $this->input->get('transid');
        $this->data = array();
    
        // Validar que todos los parámetros necesarios están presentes
        if (!$referencia || !$orden || !$transid) {
            $this->data["mensaje"] = "Parámetros faltantes";
            return $this->respuesta();
        }
    
        // Asegurarse de que 'orden' es un entero
        $orden = intval($orden);
    
        // Construir la consulta usando sprintf para seleccionar el valor de 'picked'
        $sql = sprintf(
            "SELECT picked FROM tblSoTransDetail WHERE TransID='%s' AND ItemId='%s' AND EntryNum='%d'",
            $this->db->escape_str($transid),
            $this->db->escape_str($referencia),
            $orden
        );
    
        // Ejecutar la consulta
        $query = $this->db->query($sql);
    
        // Verificar si la consulta retornó algún resultado
        if ($query->num_rows() > 0) {
            $row = $query->row();
            $this->data["picked"] = $row->picked;
            $this->data["mensaje"] = "Consulta exitosa";
        } else {
            $this->data["mensaje"] = "No se encontró el valor de 'picked' para los parámetros proporcionados";
        }
    
        $this->respuesta();
    }

    public function finalizarPicking()
    {
        $transid = $this->input->post('transid');
        $piso = $this->input->post('piso');
        $observaciones = $this->input->post('observaciones');
        $IdUsuario = $this->input->post('id');

        $this->guardarHistorialPicked($transid, 2, $piso, $IdUsuario, $IdUsuario, $observaciones);
    }
    
    
}
