<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends CI_Controller {

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
        $this->load->view('home');
    }
	
    public function obtenerPickedList()
    {
        
        
        $this->respuesta();
        //$this->load->view('welcome_message');
    }

    public function obtenerUsuarios()
    {

        $this->respuesta();
        //$this->load->view('welcome_message');
    }  
    
    public function obtenerUsuariosAdmin()
    {
        

        $this->respuesta();
        //$this->load->view('welcome_message');
    } 
	
    public function obtenerReferencias()
    {
		
        $this->respuesta();
        //$this->load->view('welcome_message');
    }    	

    public function guardarHistorialPicked()
    {

        
        $this->respuesta();
        //$this->load->view('welcome_message');
    }    
}
