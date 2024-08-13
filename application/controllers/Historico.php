<?php

session_start();


class Historico extends CI_Controller
{   
    public function __construct()
	{
        if (!isset($_SESSION['idusuario'])) {
            header("Location: " . $this->conseguirUrl() . "login?pagina=historico");
            exit();
        }

        $this->revisarSesion();

		parent::__construct();

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
		$this->load->view('historico');
	}

    public function obtenerPickedList()
{
    $this->revisarSesion();

    $this->data = array();
    $TransId = $this->input->get("TransId");

    if (!$TransId) {
        $this->data["error"] = "TransId parameter is required.";
        $this->respuesta();
        return;
    }

    $sql = "SELECT
                f.TransId,
                CONVERT(VARCHAR,F.FechaTransaccion,103) [FechaTransaccion],
               -- CONVERT(VARCHAR,F.FechaPicked,103) [FechaImpresion],
                F.FechaPicked [FechaImpresion],
                ISNULL(F.IdTransTipo,0) IdProceso,
                ISNULL(t.Nombre,'PICKED') Proceso,
                ISNULL(t.Orden,0) Orden,
                f.CustName, f.[Name], 
                (CONVERT(VARCHAR, f.HoraInicial, 103)+' '+FORMAT(f.HoraInicial, 'hh:mm:ss tt')) HoraInicial,
                (CONVERT(VARCHAR, f.HoraFinal, 103)+' '+FORMAT(f.HoraFinal, 'hh:mm:ss tt')) HoraFinal,
                f.Piso,
                F.IdUsuario IdUsuario,
                S.UserName NombreUsuario,
                F.Observaciones Observaciones
            FROM
                [AGR].[dbo].[AGRInProcesoInventario] F 
                LEFT JOIN tblsotransheader g ON f.transid=g.transid
                LEFT JOIN [AGR].[dbo].[AGRInTipoTransaccion] T ON F.IdTransTipo=t.IdTransTipo
                LEFT JOIN [TSM].[dbo].[User] S ON s.UserId=F.IdUsuario
            WHERE
                f.TransId LIKE ? AND 
                F.BatchId <> 'web'
            ORDER BY
                F.Id asc";

    $query = $this->db->query($sql, array("%".$TransId."%"));

    foreach ($query->result() as $row) {
        $this->data["data"][] = array(
            "TransId" => $row->TransId,
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
}

    public function obtenerReferencias()
	{
        $this->revisarSesion();
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
			order by e.cf_Ruta", $transid, $piso);

		$query = $this->db->query($sql);

		foreach ($query->result() as $row) {
			$this->data["data"][] = array(
				"Ruta" => $row->Ruta, "Referencia" => $row->Referencia, "Localizacion" => $row->Localizacion, "Descr" => $row->Descr, "Cantidad_Pedida" => $row->Cantidad_Pedida,
				"Existencias" => $row->Existencias, "Comprt" => $row->Comprt, "Disp" => $row->Disp, "Referencia_Equivalente" => $row->Referencia_Equivalente
			);
		}

		$this->respuesta();
		//$this->load->view('welcome_message');
	}

    public function obtenerUsuarios()
	{
        $this->revisarSesion();
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

		foreach ($query->result() as $row) {
			$this->data["data"][] = array("UserId" => $row->UserId, "UserName" => $row->UserName, "Password" => $row->Clave);
		}

		return $this->data;
		//$this->load->view('welcome_message');
	}


    // Funciones utilizadas para manejo de sesion

    function conseguirUrl() {
        // Obtener el protocolo (http o https)
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    
        // Obtener el host (nombre de dominio o IP)
        $host = $_SERVER['HTTP_HOST'];
    
        // Obtener el nombre de la carpeta de la aplicación
        $basePath = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
    
        return $protocol . $host . $basePath;
    }

    function revisarSesion() {
        if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] >1800 )) {
            // Si el usuario ha estado inactivo durante más de 30 minutos, se cierra la sesión
            session_unset();     
            session_destroy();   
            header("Location: " . $this->conseguirUrl() . "login?pagina=historico");
            exit();
        }
        $_SESSION['LAST_ACTIVITY'] = time();

        if(isset($_GET['cerrar'])) {
            session_unset();     
            session_destroy();   
            header("Location: " . $this->conseguirUrl() . "login?pagina=historico");
            exit();
        }
    }

    function cerrarSesion()
    {
        session_unset();     
        session_destroy();   
        header("Location: " . $this->conseguirUrl() . "login?pagina=historico");
        exit();
    }
}


?>