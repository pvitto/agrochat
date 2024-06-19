<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Bodega extends CI_Controller
{

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

		$thisData = null;
	}

	public function respuesta()
	{
		$thisOutput = N;
		-set_content_type('application/json', 'UTF-8')
			->set_output(json_encode($this->data));
		return;
	}

	public function index()
	{
		//echo base_url();
		$this->load->view('bodega');
	}

	public function obtenerPickedList()
	{

		$this->Data = array();
		//$this->load->view('welcome_message');
		$fecha = $this->Input->get("FechaTransaccion");
		$sql = "Select
                f.TransId,
                CONVERT(VARCHAR,F.FechaTransaccion,103) [FechaTransaccion],
                CONVERT(VARCHAR,F.FechaPicked,103) [FechaImpresion],
                isnull (F.IdTransTipo,0) IdProceso,
                isnull (t.Nombre,'PICKED') Proceso,
                isnull(t.Orden,0) Orden,
                f.CustName , f.[Name], (convert(varchar, f.HoraInicial, 103)+' '+Format(f.HoraInicial, 'hh:mm:ss tt')) HoraInicial,
                (convert(varchar, f.HoraFinal, 103)+' '+Format(f.HoraFinal, 'hh:mm:ss tt')) HoraFinal,
                f.Piso,
                F.IdUsuario IdUsuario,
                S.UserName NombreUsuario,
                F.Observaciones Observaciones
            from
              
                [AGR].[dbo].[AGRInProcesoInventario] F inner join tblsotransheader g
		on f.transid=g.transid and f.Estado=0
                left join [AGR].[dbo].[AGRInTipoTransaccion] T on F.IdTransTipo=t.IdTransTipo
                left join [TSM].[dbo].[User] S on s.UserId=F.IdUsuario
            where
                convert(varchar,f.FechaPicked,103) = convert(varchar," . "'" . $fecha . "'" . ",103) and
                F.BatchId <> 'web' and g.transtype=5
                and F.Estado=0      
            order by
                F.FechaPicked desc";

		$query = $this->DB->query($sql);

		foreach ($query->result() as $row) {
			$this->Data["data"][] = array(
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
				"IdUsuario" => $row->IdUsuario,
				"NombreUsuario" => $row->NombreUsuario,
				"Observaciones" => $row->Observaciones
			);
		}

		$this->respuesta();
		//$this->load->view('welcome_message');
	}

	public function obtenerUsuarios()
	{
		$this->Data = array();

		//$this->load->view('welcome_message');
		$sql = "select 
                u.UserId, u.UserName, u.Clave 
            from 
                [TSM].[dbo].[UserCompanyGroup] g 
                inner join [TSM].[dbo].[UserCompany] c on g.UserCompId=c.UserCompId  
                inner join [TSM].[dbo].[User] u on c.UserId=u.UserId 
            where 
                GroupId=57 and IsActive=1";

		$query = $this->DB->query($sql);

		foreach ($query->result() as $row) {
			$this->Data["data"][] = array("UserId" => $row->UserId, "UserName" => $row->UserName, "Password" => $row->Clave);
		}

		$this->respuesta();
		//$this->load->view('welcome_message');
	}

	public function obtenerReferencias()
	{
		$transid = $this->input->get("TransId");
		$piso = $this->input->get("Piso");
		$this->Data = array();

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
			order by e.cf_Ruta", $transid, $piso);

		$query = $this->DB->query($sql);

		foreach ($query->result() as $row) {
			$this->Data["data"][] = array(
				"Ruta" => $row->Ruta, "Referencia" => $row->Referencia, "Localizacion" => $row->Localizacion, "Descr" => $row->Descr, "Cantidad_Pedida" => $row->Cantidad_Pedida,
				"Existencias" => $row->Existencias, "Comprt" => $row->Comprt, "Disp" => $row->Disp, "Referencia_Equivalente" => $row->Referencia_Equivalente
			);
		}

		$this->respuesta();
		//$this->load->view('welcome_message');
	}

	public function guardarHistorialPicked()
	{

		$this->data = json_decode($this->input->post("datos"));

		//$this->load->view('welcome_message');
		$sql = sprintf("EXEC [dbo].[HistorialProcesoBodega] '%s', %d, '%s', %d, '%s'", $this->data->TransId, $this->data->IdTransTipo, $this->data->IdPiso, $this->data->IdUsuario, $this->data->Observaciones);

		$query = $this->db->query($sql);

		$this->data = array();
		$this->data["mensaje"] = $query->row()->Mensaje;

		$this->respuesta();
		//$this->load->view('welcome_message');
	}
}
