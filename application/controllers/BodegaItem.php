<?php
defined('BASEPATH') OR exit('No direct script access allowed');

session_start();

class BodegaItem extends CI_Controller {
    public function __construct()
    {
        if (!isset($_SESSION['usuario_bodegaitem'])) {
            header("Location: " . $this->conseguirUrl() . "login?pagina=bodegaitem");
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
        $this->load->view('bodegaitem');
    }
	
    public function obtenerPickedList()
    {
        $this->revisarSesion();

        $this->data = array();
        //$this->load->view('welcome_message');
        $fecha = $this->input->get("FechaTransaccion");
        $usuario = $_SESSION['usuario_bodegaitem'];
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
                F.Observaciones Observaciones,
                Case when g.ShipToID='MOSTRADOR' then  'Mostrador' else '' end TipoEnvio
            from
              
                [AGR].[dbo].[AGRInProcesoInventario] F inner join tblsotransheader g
		on f.transid=g.transid and f.Estado=0
                left join [AGR].[dbo].[AGRInTipoTransaccion] T on F.IdTransTipo=t.IdTransTipo
                left join [TSM].[dbo].[User] S on s.UserId=F.IdUsuario
            where
                convert(varchar,f.FechaPicked,103) = convert(varchar,"."'".$fecha."'".",103) and
                g.transtype=5
                and F.Estado=0 and g.Voidyn='0'
                and S.UserName="."'".$usuario."'"."
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
                "Observaciones"=>$row->Observaciones,
                "TipoEnvio"=>$row->TipoEnvio
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

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("UserId"=>$row->UserId, "UserName"=>$row->UserName, "Password"=>$row->Clave);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }  
    
    public function obtenerUsuariosAdmin()
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
                GroupId=57 and IsActive=1 and AdminBodega=1";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("UserId"=>$row->UserId, "UserName"=>$row->UserName, "Password"=>$row->Clave);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }   		

    public function iniciarPicking() {
        $this->revisarSesion();
        // Obtener los datos enviados por POST
        $transid = $this->input->post('transid');
        $piso = $this->input->post('piso');
        $bodega = $this->input->post('bodega');
    
        // Validar los datos
        if (!empty($transid) && !empty($piso) && !empty($bodega)) {
            // Redirigir a la página de remisión con los parámetros adicionales
            echo json_encode([
                'success' => true,
                'url' => 'remision?transid=' . urlencode($transid) . '&piso=' . urlencode($piso) . '&bodega=' . urlencode($bodega)         
            ]);
        } else {
            // Enviar un mensaje de error si los datos no son válidos
            echo json_encode([
                'success' => false,
                'message' => 'Datos inválidos'
            ]);
        }
    }

    function revisarSesion() {
        if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] >1800 )) {
            // Si el usuario ha estado inactivo durante más de 30 minutos, se cierra la sesión
            session_unset();     
            session_destroy();   
            header("Location: " . $this->conseguirUrl() . "login?pagina=bodegaitem");
            exit();
        }
        $_SESSION['LAST_ACTIVITY'] = time();

        if(isset($_GET['cerrar'])) {
            session_unset();     
            session_destroy();   
            header("Location: " . $this->conseguirUrl() . "login?pagina=bodegaitem");
            exit();
        }
    }

    function cerrarSesion()
    {
        session_unset();     
        session_destroy();   
        header("Location: " . $this->conseguirUrl() . "login?pagina=bodegaitem");
    }

    function conseguirUrl() {
        // Obtener el protocolo (http o https)
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    
        // Obtener el host (nombre de dominio o IP)
        $host = $_SERVER['HTTP_HOST'];
    
        // Obtener el nombre de la carpeta de la aplicación
        $basePath = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
    
        return $protocol . $host . $basePath;
    }
    

    public function obtenerReferenciasYPicked() {
        $this->revisarSesion();

        $transid = $this->input->get("TransId");
        $piso = $this->input->get("Piso");
        $bodega = $this->input->get("Bodega");
        $this->data = array();
    
        // Consulta para obtener las referencias
        $sql_referencias = sprintf("select d.entrynum Orden,e.cf_Ruta Ruta, d.ItemId Referencia, e.ExtLocID Localizacion, d.Descr,  d.QtyOrdSell Cantidad_Pedida, i.[cf_Referencia Equivalente] [Referencia_Equivalente],
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
                    order by e.cf_Ruta", $transid, $piso, $bodega);
    
        $query_referencias = $this->db->query($sql_referencias);
        $referencias = $query_referencias->result();
    
        // Consulta para obtener los valores de Picked
        $sql_picked = sprintf("SELECT ItemId Referencia, EntryNum Orden, picked FROM tblSoTransDetail WHERE TransID='%s'", $transid);
        $query_picked = $this->db->query($sql_picked);
        $picked_data = $query_picked->result();
    
        // Mapeo de valores Picked usando Referencia + Orden como clave
        $picked_map = array();
        foreach ($picked_data as $picked_row) {
            $key = $picked_row->Referencia . '-' . $picked_row->Orden; // Clave única
            $picked_map[$key] = $picked_row->picked;
        }
    
        // Construir el resultado final
        foreach ($referencias as $row) {
            $key = $row->Referencia . '-' . $row->Orden; // Clave única para cada referencia y orden
            $picked_value = isset($picked_map[$key]) ? $picked_map[$key] : null; // Verificar si hay un valor de picked
            $this->data["referencias"][] = array(
                "Orden" => $row->Orden,
                "Ruta" => $row->Ruta,
                "Referencia" => $row->Referencia,
                "Localizacion" => $row->Localizacion,
                "Descr" => $row->Descr,
                "Cantidad_Pedida" => $row->Cantidad_Pedida,
                "Existencias" => $row->Existencias,
                "Comprt" => $row->Comprt,
                "Disp" => $row->Disp,
                "Referencia_Equivalente" => $row->Referencia_Equivalente,
                "Picked" => $picked_value // Agregar el valor de picked
            );
        }
    
        // También devolver el mapa de picked para el cliente
        $this->data["picked"] = $picked_map;
    
        $this->respuesta();
    }
}
