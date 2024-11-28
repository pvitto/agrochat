<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class BodegaDespacho extends CI_Controller {

    public function __construct()
    {
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
        $bodega = isset($_GET['LocId']) ? $_GET['LocId'] : null;
        //echo base_url();
        if ($bodega == "P1")
        {
            $this->load->view('bodegadespacho_P1');
        }
        else 
        {
            $this->load->view('bodegadespacho_A');
        }
        
    }

    public function obtenerHistoricos()
    {
        $this->data = [];

        // Obtiene el TransId desde los parámetros de la solicitud
        $transId = $this->input->get('transId');

        // Verifica si el TransId fue proporcionado
        if (empty($transId)) {
            $this->data["error"] = "Por favor, proporcione un TransId válido.";
            $this->respuesta();
            return;
        }

        // Consulta optimizada para incluir Transportadora, Usuario y Operario
        $sql = "SELECT 
                    D.[Id],
                    D.[Transid],
                    D.[TransDate],
                    D.[FechaImpresion],
                    D.[Idproceso],
                    D.[Idcliente],
                    C.[CustName] AS Cliente,
                    D.[Rep2Id],
                    D.[BinNum],
                    T.[Descrip] AS Transportadora,
                    D.[NumGuia],
                    D.[Notes],
                    D.[Fecha],
                    D.[IdEstado],
                    U1.[UserName] AS Usuario,
                    U2.[UserName] AS Operario,
                    D.[FechaAnulacion],
                    D.[Flete],
                    D.[LocId]
                FROM 
                    [AGR].[dbo].[AGRInProcesoDespacho] D
                LEFT JOIN 
                    [AGR].[dbo].[tblArCust] C ON D.[Idcliente] = C.[CustId] -- Relación con la tabla de clientes
                LEFT JOIN 
                    [AGR].[dbo].[AGRinTransportadoras] T ON D.[IdTransportadora] = T.[Idtransportadora] -- Transportadora
                LEFT JOIN 
                    [TSM].[dbo].[User] U1 ON D.[IdUsuario] = U1.[UserId] -- Usuario (Administrador)
                LEFT JOIN 
                    [TSM].[dbo].[User] U2 ON D.[IdOperario] = U2.[UserId] -- Operario
                WHERE 
                    D.[Transid] LIKE ?";

        // Ejecuta la consulta principal
        $query = $this->db->query($sql, [$transId . '%']);

        // Procesa los resultados y los agrega al arreglo de respuesta
        foreach ($query->result() as $row) {
            $this->data["data"][] = [
                "Id" => $row->Id,
                "TransId" => $row->Transid,
                "FechaTransaccion" => $row->TransDate,
                "FechaImpresion" => $row->FechaImpresion,
                "Proceso" => $row->Idproceso,
                "IdCliente" => $row->Idcliente,
                "Cliente" => $row->Cliente,
                "Rep2Id" => $row->Rep2Id,
                "BinNum" => $row->BinNum,
                "Transportadora" => $row->Transportadora ?? "", // Valor por defecto si es nulo
                "Guia" => $row->NumGuia,
                "Notas" => $row->Notes,
                "Fecha" => $row->Fecha,
                "Estado" => $row->IdEstado,
                "Usuario" => $row->Usuario ?? "", // Valor por defecto si es nulo
                "Operario" => $row->Operario ?? "", // Valor por defecto si es nulo
                "FechaAnulacion" => $row->FechaAnulacion,
                "Flete" => $row->Flete,
                "Ubicacion" => $row->LocId,
            ];
        }

        // Responde con los datos procesados
        $this->respuesta();
    }


	
    public function obtenerPickedList()
    {
        
        $this->data = array();
        $tipo = $this->input->get("Tipo");
        $remision = 0;
        $fechaConsulta = "";
    
        if ($this->input->get("Fecha")) {
            $fechaConsulta = $this->input->get("Fecha");
        }
        else if ($this->input->get("Remision"))
        {
            $remision = $this->input->get("Remision");
        }
    

        if ($tipo == 4)
        {
            $sql = "Select
				D.Id as IdDespachado,
                d.TransId,
                d.LocId as Bodega,
                CONVERT(VARCHAR,d.TransDate,103) [FechaTransaccion],
               CONVERT(date, d.fechaimpresion) [FechaImpresion],
               Case when d.idproceso='2' then 'DESPACHADO'  else '0' end Proceso,
				b.CustId as IdCliente,
                b.CustName as Cliente, 
				d.Rep2Id as Rep2id,
				'' as Vendedor,
				'' as EstadoTransaccion,
                d.Notes Observaciones,
                '' as TipoEnvio,
				NULL Ubicacion,
				e.Descrip Transportadora,
				d.NumGuia Guia,
				h.UserName Administrador,
				F.UserName Operario,
				D.Fecha AS FechaDespachado,
				Flete
				from
				[dbo].[AGRInProcesoDespacho] d
				
				inner join tblArCust b
				on d.IdCliente=b.CustId
				
				inner join AGRinTransportadoras e
				on e.Idtransportadora=d.IdTransportadora
				left join TSM.dbo.[User] f
				on F.UserId=D.IdOperario
				left join TSM.dbo.[User] h
				on h.UserId=D.IdUsuario
				where idestado='0' and
                convert(varchar,D.Fecha,103) = convert(varchar,"."'".$fechaConsulta."'".",103)";
		}
        else
        {
            
            $sql = sprintf(
                "EXEC [dbo].[HistorialDespachoBodegaBorrador1] '%s','%d','%d', '%d', '%d', '%s', '%s', '%s', '%s', %d, '%s', '%s', '%s'", 
                $remision, $tipo, '', '', '', '', '', '', '', '', $fechaConsulta, '', ''
            );

        }
       
    
        $query = $this->db->query($sql);
    
        if (!$query) {
            $error = $this->db->error();
            log_message('error', 'Error en la consulta SQL: ' . $error['message']);
            echo "Error en la consulta SQL: " . $error['message'];
            return;
        }


        if ($tipo == 1)
        {
            foreach ($query->result() as $row)
            {
                $this->data["data"][] = array("TransId"=>$row->TransId, 
                    "FechaTransaccion"=>$row->FechaTransaccion,
                    "FechaImpresion"=>$row->FechaImpresion,
                    "Proceso"=>$row->Proceso,
                    "IdCliente"=>$row->IdCliente,
                    "Cliente"=>$row->Cliente,
                    "Rep2id"=>$row->Rep2id,
                    "Vendedor"=>$row->Vendedor,
                    "EstadoTransaccion"=>$row->EstadoTransaccion,
                    "Observaciones"=>$row->Observaciones,
                    "TipoEnvio"=>$row->TipoEnvio,
                    "Ubicacion"=>$row->Ubicacion,
                    "Transportadora"=>$row->Transportadora,
                    "Guia"=>$row->Guia
                );
            }
        }
        else if ($tipo == 4)
        {
            foreach ($query->result() as $row)
            {
                $this->data["data"][] = array("TransId"=>$row->TransId, 
                    "FechaTransaccion"=>$row->FechaTransaccion,
                    "FechaImpresion"=>$row->FechaImpresion,
                    "Proceso"=>$row->Proceso,
                    "IdCliente"=>$row->IdCliente,
                    "Cliente"=>$row->Cliente,
                    "Rep2id"=>$row->Rep2id,
                    "Vendedor"=>$row->Vendedor,
                    "EstadoTransaccion"=>$row->EstadoTransaccion,
                    "Observaciones"=>$row->Observaciones,
                    "TipoEnvio"=>$row->TipoEnvio,
                    "Ubicacion"=>$row->Ubicacion,
                    "Transportadora"=>$row->Transportadora,
                    "Guia"=>$row->Guia,
                    "Administrador"=>$row->Administrador,
                    "Operario"=>$row->Operario,
                    "Id"=>$row->IdDespachado,
                    "Fecha"=>$row->FechaDespachado,
                    "Flete"=>$row->Flete,
                    "Bodega"=>$row->Bodega
                );
            }
        }
        else if ($tipo == 6)
        {
            foreach ($query->result() as $row)
            {
                $this->data["data"][] = array("TransId"=>$row->TransId, 
                    "FechaTransaccion"=>$row->FechaTransaccion,
                    "FechaImpresion"=>$row->FechaImpresion,
                    "Proceso"=>$row->Proceso,
                    "IdCliente"=>$row->IdCliente,
                    "Cliente"=>$row->Cliente,
                    "Rep2id"=>$row->Rep2id,
                    "Vendedor"=>$row->Vendedor,
                    "EstadoTransaccion"=>$row->EstadoTransaccion,
                    "Observaciones"=>$row->Observaciones,
                    "TipoEnvio"=>$row->TipoEnvio,
                    "Ubicacion"=>$row->Ubicacion,
                    "Transportadora"=>$row->Transportadora,
                    "Guia"=>$row->Guia,
                    "Administrador"=>$row->Administrador,
                    "Operario"=>$row->Operario,
                    "Id"=>$row->IdUbicado,
                    "Fecha"=>$row->FechaUbicado,
                    "Bodega"=>$row->Bodega
                );
            }
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

        //$this->load->view('welcome_message');
        $sql = sprintf("EXEC [dbo].[HistorialDespachoBodegaBorrador1] '%s','%d','%d', '%d', '%d', '%s', '%s', '%s', '%s', '%d', '%s', '%s','%s'", $this->data->TransId, $this->data->IdTransTipo, $this->data->Transportadora, $this->data->IdUsuario, $this->data->Idoperario, $this->data->BinNum, $this->data->Observaciones, $this->data->FechaDespacho, $this->data->Guia, $this->data->IdDespachado, '', $this->data->Flete, $this->data->Bodega);

        $query = $this->db->query($sql);

        $this->data = array();
        $this->data["mensaje"] = $query->row()->Mensaje;

        $this->respuesta();
    }   

    public function obtenerBinNum()
    {
        $this->data = array();
        //$this->load->view('welcome_message');
        $sql = "SELECT ExtLocID BinNum, LocID from trav_tblWmExtLoc_view 
        order by ExtLocID";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("BinNum"=>$row->BinNum, 
            "LocID"=>$row->LocID);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    } 

    public function obtenerTransportadoras()
    {
        $this->data = array();
        //$this->load->view('welcome_message');
        $sql = "SELECT Idtransportadora, Descrip from AGRinTransportadoras
        order by Idtransportadora";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("Idtransportadora"=>$row->Idtransportadora, 
            "Descrip"=>$row->Descrip);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }

    public function dividirRemision()
    {
        // Decode the incoming JSON data
        $this->data = json_decode($this->input->post("datos"));

        // Validate required parameters
        if (empty($this->data->TransId) || empty($this->data->IdTransTipo)) {
            $this->data = array(
                "mensaje" => "Datos inválidos. TransId o IdTransTipo no definidos.",
                "success" => false
            );
            $this->respuesta();
            return;
        }

        $originalTransId = $this->data->TransId;

        // Query to count existing divisions
        $sql_count = "SELECT COUNT(*) as Divisiones 
                    FROM [AGR].[dbo].[AGRInProcesoDespacho] 
                    WHERE TransId LIKE ?";
        $query = $this->db->query($sql_count, array($originalTransId . '-%'));

        if (!$query || !$query->row()) {
            $this->data = array(
                "mensaje" => "Error al obtener divisiones.",
                "success" => false
            );
            $this->respuesta();
            return;
        }

        $divisiones = $query->row()->Divisiones;

        // Calculate the new suffix and define the new TransId
        $newSuffix = $divisiones + 1;
        $newTransId = $originalTransId . '-' . $newSuffix;

        // Call the stored procedure to change the process to "despachado"
        $sql_despachado = "EXEC [dbo].[HistorialDespachoBodegaBorrador1] ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
        $params_despachado = [
            $this->data->TransId,
            $this->data->IdTransTipo,
            $this->data->Transportadora,
            $this->data->IdUsuario,
            $this->data->Idoperario,
            $this->data->BinNum,
            $this->data->Observaciones,
            $this->data->FechaDespacho,
            $this->data->Guia,
            $this->data->IdDespachado,
            '',
            $this->data->Flete,
            $this->data->Bodega
        ];

        $query_despachado = $this->db->query($sql_despachado, $params_despachado);
        if (!$query_despachado || !$query_despachado->row() || $query_despachado->row()->Mensaje !== "Ok") {
            $this->data = array(
                "mensaje" => $query_despachado->row()->Mensaje ?? "Error al cambiar el estado a despachado.",
                "success" => false
            );
            $this->respuesta();
            return;
        }

        // Update TransId in the database to reflect the division
        $sql_update = "UPDATE [AGR].[dbo].[AGRInProcesoDespacho] SET Transid = ? WHERE Transid = ? AND IdEstado = 0";
        if (!$this->db->query($sql_update, array($newTransId, $originalTransId))) {
            $this->data = array(
                "mensaje" => "Error al actualizar el TransId.",
                "success" => false
            );
            $this->respuesta();
            return;
        }

        if ($divisiones == 0)
        {
            // Si el proceso es de "Por Despachar" a "Despachado" se vuelve a llamar el procedimiento almacenado para volver a crear la remision en proceso 3 (ubicado)
            $sql_ubicado = "EXEC [dbo].[HistorialDespachoBodegaBorrador1] ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
            $params_ubicado = [
                $this->data->TransId,
                3, // Estado "ubicado"
                $this->data->Transportadora,
                $this->data->IdUsuario,
                $this->data->Idoperario,
                "Parcial", // Indica que es una división parcial
                '',
                $this->data->FechaDespacho,
                $this->data->Guia,
                $this->data->IdDespachado,
                '',
                $this->data->Flete,
                $this->data->Bodega
            ];

            $query_ubicado = $this->db->query($sql_ubicado, $params_ubicado);
            if (!$query_ubicado || !$query_ubicado->row() || $query_ubicado->row()->Mensaje !== "Ok") {
                $this->data = array(
                    "mensaje" => $query_ubicado->row()->Mensaje ?? "Error al crear la remisión original con estado 'Ubicado'.",
                    "success" => false
                );
                $this->respuesta();
                return;
            }
        }
        else
        {
            $sql_activar = "UPDATE [AGR].[dbo].[AGRInProcesoDespacho] SET IdEstado = 0 WHERE Transid = ? AND IdEstado = 1";
            if (!$this->db->query($sql_activar, array($originalTransId))) {
                $this->data = array(
                    "mensaje" => "Error al activar el TransId ubicado.",
                    "success" => false
                );
                $this->respuesta();
                return;
            }
        }
        

        // Response for successful division
        $this->data = array(
            "mensaje" => "Despacho dividido correctamente. División creada con TransId = " . $newTransId,
            "success" => true
        );
        $this->respuesta();
    }


}