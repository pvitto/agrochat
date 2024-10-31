<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class BodegaAdmin extends CI_Controller {

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
        $this->load->view('bodegaadmin');
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

    public function guardarHistorialPicked()
    {
        $this->data = json_decode($this->input->post("datos"));
        $mensaje = "";

        switch ($this->data->IdTransTipo) {
            case 1:
                // IdTransTipo = 1
                $sql = "
                    UPDATE [AGR].[dbo].[AGRInProcesoInventario] 
                    SET IdTransTipo = 1, 
                        Observaciones = CONCAT(Observaciones, ';', ?), 
                        HoraInicial = GETDATE(), 
                        IdUsuario = ?, 
                        IdAsignadoPor = ? 
                    WHERE TransId = ? AND Piso = ? AND IdTransTipo = 0;
                ";
                $this->db->query($sql, [$this->data->Observaciones, $this->data->Idoperario, $this->data->IdUsuario, $this->data->TransId, $this->data->IdPiso]);

                $mensaje = 'Ok';
                break;

            case 2:

                if ($this->data->Operariofila == $this->data->Idoperario) {
                    $sql = "
                        UPDATE [AGR].[dbo].[AGRInProcesoInventario] 
                        SET IdTransTipo = 2, 
                            Observaciones = CONCAT(Observaciones, ';', ?), 
                            HoraFinal = GETDATE(), 
                            IdAsignadoPor = ? 
                        WHERE TransId = ? AND Piso = ? AND IdTransTipo = 1;
                    ";
                    $this->db->query($sql, [$this->data->Observaciones, $this->data->IdUsuario, $this->data->TransId, $this->data->IdPiso]);
                    $mensaje = 'Ok';
                } else {
                    $mensaje = 'El usuario debe ser el que empezó a recoger la mercancia';
                }
                break;

            case 3:
                // IdTransTipo = 3
                $sql = "UPDATE [AGR].[dbo].[AGRInProcesoInventario] SET Estado = 1 WHERE TransId = ? AND Piso = ? AND IdTransTipo = 2";
                $this->db->query($sql, [$this->data->TransId, $this->data->IdPiso]);

                $sql_check = "SELECT COUNT(*) AS count FROM [AGR].[dbo].[AGRInProcesoInventario] WHERE TransId = ? AND Piso = ? AND IdTransTipo = 3";
                $result = $this->db->query($sql_check, [$this->data->TransId, $this->data->IdPiso])->row();

                if ($result->count == 0) {
                    $sql_insert = "
                        INSERT INTO [AGR].[dbo].[AGRInProcesoInventario] 
                        ([TransId], [IdTransTipo], [TransType], [CustName], [Name], [FechaTransaccion], [HoraInicial], [HoraFinal], [LocId], [Piso], [IdUsuario], [Observaciones], [Estado], [BatchId], [FechaPicked], [IdAsignadoPor])
                        SELECT TransId, '3', '5', CustName, Name, FechaTransaccion, GETDATE(), NULL, LocId, ?, ?, CONCAT(Observaciones, ';', ?), '0', BatchId, FechaPicked, ?
                        FROM [AGR].[dbo].[AGRInProcesoInventario] 
                        WHERE TransId = ? AND Piso = ? AND IdTransTipo = 2;
                    ";
                    $this->db->query($sql_insert, [$this->data->IdPiso, $this->data->Idoperario, $this->data->Observaciones, $this->data->IdUsuario, $this->data->TransId, $this->data->IdPiso]);
                    $mensaje = 'Ok';
                } else {
                    $mensaje = 'Ya fue Guardada';
                }
                break;

            case 4:
                
                 if ($this->data->Operariofila == $this->data->Idoperario) {
                    $sql = "
                        UPDATE [AGR].[dbo].[AGRInProcesoInventario] 
                        SET IdTransTipo = 4, 
                            Observaciones = CONCAT(Observaciones, ';', ?), 
                            HoraFinal = GETDATE(), 
                            IdAsignadoPor = ? 
                        WHERE TransId = ? AND Piso = ? AND IdTransTipo = 3;
                    ";
                    $this->db->query($sql, [$this->data->Observaciones, $this->data->IdUsuario, $this->data->TransId, $this->data->IdPiso]);
                    $mensaje = 'Ok';
                } else {
                    $mensaje = 'El usuario debe ser el que empezó a empacar la mercancia';
                }
                break;

            case 7:
                // IdTransTipo = 7 (Cancelar pedido)
                $sql_update = "UPDATE [AGR].[dbo].[AGRInProcesoInventario] SET Estado = 1 WHERE TransId = ? AND Estado = 0";
                $this->db->query($sql_update, [$this->data->TransId]);

                $sql_insert = "
                    INSERT INTO [AGR].[dbo].[AGRInProcesoInventario] 
                    ([TransId], [IdTransTipo], [TransType], [CustName], [Name], [FechaTransaccion], [HoraInicial], [HoraFinal], [Piso], [IdUsuario], [Observaciones], [Estado], [BatchId], [FechaPicked], [IdAsignadoPor])
                    SELECT TransId, '7', '5', CustName, Name, FechaTransaccion, GETDATE(), GETDATE(), Piso, ?, CONCAT(Observaciones, ';', ?), '0', BatchId, FechaPicked, ?
                    FROM [AGR].[dbo].[AGRInProcesoInventario] 
                    WHERE TransId = ?;
                ";
                $this->db->query($sql_insert, [$this->data->Idoperario, $this->data->Observaciones, $this->data->IdUsuario, $this->data->TransId]);
                $mensaje = 'Pedido Cancelado Correctamente';
                break;

            default:
                $mensaje = "Tipo de transacción no soportado";
        }

        $this->data = array("mensaje" => $mensaje);
        $this->respuesta();
    }

}
