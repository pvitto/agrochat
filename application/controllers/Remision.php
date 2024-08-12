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
		$sql = sprintf("select d.entrynum,e.cf_Ruta Ruta, d.ItemId Referencia, e.ExtLocID Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
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
            $this->data["data"][] = array("Ruta"=>$row->Ruta, "Referencia"=>$row->Referencia, "Localizacion"=>$row->Localizacion, "Descr"=>$row->Descr, "Cantidad_Pedida"=>$row->Cantidad_Pedida,
 "Existencias"=>$row->Existencias,"Comprt"=>$row->Comprt,"Disp"=>$row->Disp, "Referencia_Equivalente"=>$row->Referencia_Equivalente);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }    	

    public function actualizarPicked() {
        $referencia = $this->input->post('referencia');
        $cantidadAgregada = $this->input->post('cantidadAgregada');
    
        $this->output
            ->set_content_type('application/json', 'UTF-8')
            ->set_output(json_encode(['status' => 'success', 'message' => 'Cantidad actualizada correctamente']));
    }
    
}
