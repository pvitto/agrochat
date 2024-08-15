<?php
defined('BASEPATH') or exit('No direct script access allowed');
session_start();
class Login extends CI_Controller
{
    public function index()
	{
        $this->load->view('login');
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

		foreach ($query->result() as $row) {
			$this->data["data"][] = array("UserId" => $row->UserId, "UserName" => $row->UserName, "Password" => $row->Clave);
		}

		return $this->data;
		//$this->load->view('welcome_message');
	}

	public function chequearUsuario()
    {
        $usuario = $this->input->post("Usuario");
        $contraseña = $this->input->post("Contraseña");
        $pagina = $this->input->post("Pagina");
    
        $usuarios = $this->obtenerUsuarios();
        $valid = false;
    
        foreach ($usuarios['data'] as $user) {
            if ($user['UserName'] == $usuario && $user['Password'] == $contraseña) {
                $valid = true;

                if ($pagina == "bodegaitem")
                {
                    $_SESSION['usuario_bodegaitem'] = $usuario;
                    $_SESSION['idusuario_bodegaitem'] =  $user['UserId'];
                }
                else if ($pagina == "historico")
                {
                    $_SESSION['usuario_historico'] = $usuario;
                    $_SESSION['idusuario_historico'] =  $user['UserId'];
                }
                else
                    $valid = false;
                
                break;
            }
        }
    
        if ($valid) {
            echo json_encode([
                'success' => true,
                'url' => urlencode($pagina)
            ]);
        } else {
            echo json_encode(array('success' => false));
        }

    }
}
?>