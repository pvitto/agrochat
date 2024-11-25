<?php
defined('BASEPATH') or exit('No direct script access allowed');
session_start();
class MenuBodega extends CI_Controller
{
    public function index()
	{
        $this->load->view('menubodega');
	}


    public function guardarLocId()
    {
        $bodega = $this->input->post("Bodega");

        $_SESSION['LocId'] = $bodega; 
    }
}
?>