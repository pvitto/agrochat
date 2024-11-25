<?php
defined('BASEPATH') or exit('No direct script access allowed');
session_start();
class MenuBodega extends CI_Controller
{
    public function index()
	{
        $this->load->view('menubodega');
	}
}
?>