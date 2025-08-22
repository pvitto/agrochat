<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SeguimientoPedidos extends CI_Controller {

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
        $this->load->view('seguimientopedidos');
    }
	
    public function obtenerPickedList()
    {
        
        $this->data = array();
        //$this->load->view('welcome_message');
        $fecha = $this->input->get("FechaTransaccion");
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
                f.LocId,
                F.IdUsuario IdUsuario,
                S.UserName NombreUsuario,
                F.Observaciones Observaciones
            from
              
                [AGR].[dbo].[AGRInProcesoInventario] F inner join tblsotransheader g
		on f.transid=g.transid and f.Estado=0
                left join [AGR].[dbo].[AGRInTipoTransaccion] T on F.IdTransTipo=t.IdTransTipo
                left join [TSM].[dbo].[User] S on s.UserId=F.IdUsuario
            where
                convert(varchar,f.FechaPicked,103) = convert(varchar,"."'".$fecha."'".",103) and
                g.transtype=5
                and F.Estado=0      
            order by
                F.FechaPicked desc";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("TransId"=>$row->TransId, 
                "IdProceso"=>$row->IdProceso, 
                "Orden"=>$row->Orden, 
                "TransType"=>$row->Proceso, 
                "CustName"=>$row->CustName, 
                "Name"=>$row->Name, 
                "FechaTransaccion"=>$row->FechaTransaccion, 
				"FechaImpresion"=>$row->FechaImpresion,
                "HoraInicial"=>$row->HoraInicial, 
                "HoraFinal"=>$row->HoraFinal, 
                "Piso"=>$row->Piso, 
                "Bodega"=>$row->LocId, 
                "IdUsuario"=>$row->IdUsuario, 
                "NombreUsuario"=>$row->NombreUsuario, 
                "Observaciones"=>$row->Observaciones);
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
		$sql = sprintf("select e.cf_Ruta Ruta, d.ItemId Referencia, e.ExtLocID Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) Existencias,
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Comprt,

(select QtyOnHand from trav_InItemOnHand_view a where a.itemid=d.ItemId and a.LocId=d.LocId) - 
(select SUM(Qty) AS Comprt from tblInQty a where a.itemid=d.itemid and a.LocId=d.locid and a.LinkID='SO' and Qty>0) Disp
			from tblSoTransHeader H
			inner join tblSoTransDetail d on d.TransID=H.TransId
			inner join trav_tblInItem_view I on d.ItemId=I.ItemId
			inner join tblInItemLoc l on  d.ItemId=l.ItemId and d.LocId=l.LocId
			left join trav_tblWmExtLoc_view E on l.DfltBinNum=e.ExtLocID
			where H.TransId='%s' and (e.[cf_Ubicacion Fisica]='%s' or e.[cf_Ubicacion Fisica] is NULL) and d.[status]='0' and d.LocId='%s'
			group by H.TransID, [cf_Ubicacion Fisica], d.ItemId, e.ExtLocID, d.Descr, d.QtyOrdSell, i.[cf_Referencia Equivalente], e.cf_Ruta, d.LocId
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

    

    public function guardarHistorialPicked()
    {

        $this->data = json_decode($this->input->post("datos"));

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialProcesoBodegaAdmin] '%s', %d, '%s', %d, %d,'%s'",$this->data->TransId, $this->data->IdTransTipo, $this->data->IdPiso, $this->data->IdUsuario,$this->data->Idoperario, $this->data->Observaciones );

        $query = $this->db->query($sql);

        $this->data = array();
        $this->data["mensaje"] = $query->row()->Mensaje;

        $this->respuesta();
        //$this->load->view('welcome_message');
    }    


public function chatbot() {
    $mensaje = strtolower(trim($this->input->get('remision')));
    $mensajeLimpio = $this->db->escape_str($mensaje);

    // Saludo inicial
    if (in_array($mensaje, ['hola', 'buenas', 'hey', 'hello'])) {
        echo json_encode([
            'respuesta' => "Hola 👋, soy tu asistente de remisiones. Puedes preguntarme por el estado de una remisión, por ejemplo: <b>01048520</b>"
        ]);
        return;
    }

    // Validación del patrón de remisión
    if (!preg_match("/^\d{8}(-\d)?$/", $mensaje)) {
        echo json_encode([
            'respuesta' => "Por favor ingresa una remisión válida de 8 dígitos (ej: 01048520)."
        ]);
        return;
    }

    // Usamos directamente el modelo (no instancia del controlador) para buscar la remisión
    $remision = explode('-', $mensaje)[0];
    $remision = $this->db->escape_str($remision);

    $sql = "
        SELECT TOP 1
            D.TransId,
            D.NumGuia AS Guia,
            ISNULL(E.Descrip, 'Transportadora no registrada') AS Transportadora,
            FORMAT(DATEADD(HOUR, -5, D.Fecha), 'dd/MM/yyyy HH:mm:ss') AS Fecha,
            CASE
                WHEN D.Idproceso = 1 THEN 'Por Despacho'
                WHEN D.Idproceso = 2 THEN 'Despachado'
                WHEN D.Idproceso = 3 THEN 'Ubicado'
                ELSE 'Estado desconocido'
            END AS Estado
        FROM AGRInProcesoDespacho D
        LEFT JOIN AGRinTransportadoras E ON D.IdTransportadora = E.IdTransportadora
        WHERE D.TransId LIKE '{$remision}%'
            AND D.IdProceso = 2
            AND D.TransId NOT LIKE '%*%'
        ORDER BY D.Fecha DESC
    ";

    $query = $this->db->query($sql);
    $row = $query->row_array();

    if ($row) {
        $this->session->set_userdata('ultima_remision', $row['TransId']);

        echo json_encode([
            'respuesta' => "La remisión <b>{$row['TransId']}</b> está en estado <b>{$row['Estado']}</b> desde el <b>{$row['Fecha']}</b>.",
            'info' => $row
        ]);
    } else {
        echo json_encode([
            'respuesta' => "No encontré información para la remisión <b>{$mensaje}</b>."
        ]);
    }
}


}
