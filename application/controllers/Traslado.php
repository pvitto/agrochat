<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class traslado extends CI_Controller {

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
        $this->load->view('traslado');
    }
	
    public function obtenerPickedList()
    {
        
        $this->data = array();
        //$this->load->view('welcome_message');
        $transid = $this->input->get("FechaTransaccion");
        /*$sql = "Select
                f.Id,
                f.TransId,
                f.[Itemid],
                f.[Qtyorder],
                f.[BinNum],
                f.[BimNumold],
                isnull (F.IdTransTipo,0) IdProceso,
                f.[VendorName],
                f.[Name],
            CONVERT(VARCHAR,F.FechaTransaccion,103) [FechaTransaccion],
                isnull (t.Nombre,'PICKED') Proceso, 
        (convert(varchar, f.HoraInicial, 103)+' '+Format(f.HoraInicial, 'hh:mm:ss tt')) HoraInicial,
                f.[Locid] Piso,
                F.IdUsuario IdUsuario,
                S.UserName NombreUsuario,
                F.Observaciones Observaciones,
                F.RefEmpaque,
                F.QtyOnHand enMano
            from
            
                [AGR].[dbo].[AGRInProcesoLocalizar] F 
                left join [AGR].[dbo].[AGRInTipoTransaccion] T on F.IdTransTipo=t.IdTransTipo
                left join [TSM].[dbo].[User] S on s.UserId=F.IdUsuario
                where f.transid="."'".$despacho."'"."";    */
        $sql = sprintf("EXEC [AGR].[dbo].[HistorialLocalizarBodegaCargarTraslado] '%s'",$transid);
        
        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            
            $this->data["data"][] = array(
                "Id"=>$row->Id, 
                "TransId"=>$row->TransId, 
                "FechaTransaccion"=>$row->FechaTransaccion,
                "Itemid"=>$row->Itemid,
                "Descrip"=>$row->Descrip,
                "Qtyorder"=>$row->Qtyorder,
                "BinNum"=>$row->BinNum,
                "BimNumold"=>$row->BimNumold,
                "IdProceso"=>$row->IdProceso,
                "VendorName"=>$row->VendorName, 
                "Name"=>$row->Name, 
                "TransType"=>$row->Proceso, 
                "HoraInicial"=>$row->HoraInicial, 
                "Piso"=>$row->Piso, 
                "IdUsuario"=>$row->IdUsuario, 
                "NombreUsuario"=>$row->NombreUsuario, 
                "Observaciones"=>$row->Observaciones,
                "RefEmpaque"=>$row->RefEmpaque,
                "enMano"=>$row->enMano,
                "AliasProv"=>$row->AliasProv);

                

        }

        $this->respuesta();
        //$this->load->view('welcome_message');
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
    public function obtenerBinNum()
    {
        $this->data = array();
        $bodega = $this->input->get("bodega");
        //$this->load->view('welcome_message');
        $sql = "SELECT ExtLocID BinNum, LocID from trav_tblWmExtLoc_view 
       where locid="."'".$bodega."'"." order by ExtLocID";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("BinNum"=>$row->BinNum, 
            "LocID"=>$row->LocID);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    } 
    public function obtenerReferencias()
    {
		$transid = $this->input->get("TransId");
		$piso = $this->input->get("Piso");
        $this->data = array();

        //$this->load->view('welcome_message');
		$sql = sprintf("select e.cf_Ruta Ruta, d.ItemId Referencia, l.DfltBinNum Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) Existencias,
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Comprt,

(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) - 
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Disp
			from tblSoTransHeader H
			inner join tblSoTransDetail d on d.TransID=H.TransId
			inner join trav_tblInItem_view I on d.ItemId=I.ItemId
			inner join tblInItemLoc l on  d.ItemId=l.ItemId and d.LocId=l.LocId
			inner join trav_tblWmExtLoc_view E on l.DfltBinNum=e.ExtLocID
			where H.TransId='%s' and e.[cf_Ubicacion Fisica]='%s' and d.[status]='0'
			group by H.TransID, [cf_Ubicacion Fisica], d.ItemId, l.DfltBinNum, d.Descr, d.QtyOrdSell, i.[cf_Referencia Equivalente], e.cf_Ruta, d.LocId
			order by e.cf_Ruta",$transid, $piso);

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("Ruta"=>$row->Ruta, "Referencia"=>$row->Referencia, "Localizacion"=>$row->Localizacion, "Descr"=>$row->Descr, "Cantidad_Pedida"=>$row->Cantidad_Pedida,
 "Existencias"=>$row->Existencias,"Comprt"=>$row->Comprt,"Disp"=>$row->Disp, "Referencia_Equivalente"=>$row->Referencia_Equivalente);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }    	

    public function guardarHistorialPicked()
    {

        $this->datos = json_decode($this->input->post("datos"));

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialLocalizarBodega] %d,'%s', '%s', %d, '%s', '%s', '%s','%s' ",$this->datos->Id,$this->datos->TransId,$this->datos->Itemid ,$this->datos->IdTransTipo, $this->datos->IdPiso, $this->datos->IdUsuario, $this->datos->BinNum,$this->datos->Observaciones);

        $query = $this->db->query($sql);

        $this->data = array();
        $this->data["mensaje"] = $query->row()->Mensaje;

        $this->respuesta();
        //$this->load->view('welcome_message');
    }    
}
