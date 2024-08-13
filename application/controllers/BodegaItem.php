<?php
defined('BASEPATH') OR exit('No direct script access allowed');

session_start();

class BodegaItem extends CI_Controller {

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
        if (!isset($_SESSION['idusuario'])) {
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
        
        $this->data = array();
        //$this->load->view('welcome_message');
        $fecha = $this->input->get("FechaTransaccion");
        $usuario = $this->input->get("NombreUsuario");
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

    public function iniciarPicking() {
        // Obtener los datos enviados por POST
        $transid = $this->input->post('transid');
        $piso = $this->input->post('piso');
        $bodega = $this->input->post('bodega');
        $observaciones = $this->input->post('observaciones');
        $id = $this->input->post('id');
    
        // Validar los datos
        if (!empty($transid) && !empty($piso) && !empty($bodega)) {
            // Redirigir a la página de remisión con los parámetros adicionales
            echo json_encode([
                'success' => true,
                'url' => 'remision?transid=' . urlencode($transid) . '&piso=' . urlencode($piso) . '&bodega=' . urlencode($bodega) . '&observaciones=' . urlencode($observaciones) . '&id=' . urlencode($id)         
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
        $transid = $this->input->get("TransId");
        $piso = $this->input->get("Piso");
        $bodega = $this->input->get("Bodega");
        
        // Validar que todos los parámetros necesarios están presentes
        if (!$transid || !$piso || !$bodega) {
            $this->data["mensaje"] = "Parámetros faltantes";
            return $this->respuesta();
        }
        
        $this->data = array();
    
        // Consultar las referencias
        $sqlReferencias = sprintf(
            "SELECT d.entrynum AS Orden, e.cf_Ruta AS Ruta, d.ItemId AS Referencia, e.ExtLocID AS Localizacion, d.Descr, d.QtyOrdSell AS Cantidad_Pedida, 
                    i.[cf_Referencia Equivalente] AS Referencia_Equivalente,
                    (SELECT QtyOnHand FROM trav_InItemOnHand_view a WHERE a.itemid = d.ItemId AND a.LocId = d.LocId) AS Existencias,
                    (SELECT SUM(Qty) FROM tblInQty a WHERE a.itemid = d.itemid AND a.LocId = d.locid AND a.LinkID = 'SO' AND Qty > 0) AS Comprt,
                    (SELECT QtyOnHand FROM trav_InItemOnHand_view a WHERE a.itemid = d.ItemId AND a.LocId = d.LocId) - 
                    (SELECT SUM(Qty) FROM tblInQty a WHERE a.itemid = d.itemid AND a.LocId = d.locid AND a.LinkID = 'SO' AND Qty > 0) AS Disp
            FROM tblSoTransHeader H
            INNER JOIN tblSoTransDetail d ON d.TransID = H.TransId
            INNER JOIN trav_tblInItem_view I ON d.ItemId = I.ItemId
            INNER JOIN tblInItemLoc l ON d.ItemId = l.ItemId AND d.LocId = l.LocId
            LEFT JOIN trav_tblWmExtLoc_view E ON l.DfltBinNum = e.ExtLocID
            WHERE H.TransId = '%s' AND (e.[cf_Ubicacion Fisica] = '%s' OR e.[cf_Ubicacion Fisica] IS NULL) AND d.[status] = '0' AND h.Voidyn = '0' AND d.LocId = '%s'
            GROUP BY H.TransID, [cf_Ubicacion Fisica], d.ItemId, e.ExtLocID, d.Descr, d.QtyOrdSell, i.[cf_Referencia Equivalente], e.cf_Ruta, d.LocId, d.entrynum
            ORDER BY e.cf_Ruta",
            $this->db->escape_str($transid),
            $this->db->escape_str($piso),
            $this->db->escape_str($bodega)
        );
        
        $queryReferencias = $this->db->query($sqlReferencias);
        
        // Arreglo para almacenar referencias y ordenes
        $referencias = array();
        $ordenes = array();
        
        foreach ($queryReferencias->result() as $row) {
            $referencias[] = $row->Referencia;
            $ordenes[] = $row->Orden;
            
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
                "TransId" => $transid
            );
        }
    
        // Consultar el valor de 'picked' para cada combinación de referencia y orden
        $this->data["picked"] = array();
        
        foreach ($referencias as $index => $ref) {
            $orden = $ordenes[$index]; // Obtener el orden correspondiente para cada referencia
            
            $sqlPicked = sprintf(
                "SELECT picked FROM tblSoTransDetail WHERE TransID='%s' AND ItemId='%s' AND EntryNum='%d'",
                $this->db->escape_str($transid),
                $this->db->escape_str($ref),
                intval($orden)
            );
            
            $queryPicked = $this->db->query($sqlPicked);
            
            if ($queryPicked->num_rows() > 0) {
                $row = $queryPicked->row();
                $this->data["picked"][$ref] = $row->picked;
            } else {
                $this->data["picked"][$ref] = null;
            }
        }
    
        $this->data["mensaje"] = "Consulta exitosa";
    
        $this->respuesta();
    }
    
    
}
