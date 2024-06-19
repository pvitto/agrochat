<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

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
        $this->load->view('welcome_message');
    }

    public function obtenerDatos2()
    {
        $this->data = array();
        //$this->load->view('welcome_message');
        $sql = "select 
                t.TransId, 
                t.TransType, 
                (CASE
                    WHEN t.TransType = 5 THEN 'Picked'
                    WHEN t.TransType = 4 THEN 'Verificada'
                END) estado,
                c.CustName 
            from 
                tblSoTransHeader t left join tblArCust c on t.CustId = c.CustId 
            where 
                convert(date,t.TransDate,103) = convert(date,getdate(),103) and 
                t.BatchId <> 'web' and 
                TransType in(5,4) order by t.TransId";

        $query = $this->db->query($sql);

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("TransId"=>$row->TransId, "CustName"=>$row->CustName, "TransType"=>$row->TransType, "estado"=>$row->estado);
        }

        $this->respuesta();
        //$this->load->view('welcome_message');
    }

    public function obtenerDatos()
    {
        $this->data = array();
        //$this->load->view('welcome_message');
        $sql = sprintf("exec [dbo].pantalla");

        $query = $this->db->query($sql);
        $num = $query->num_rows();

        foreach ($query->result() as $row)
        {
            $this->data["data"][] = array("TransId"=>$row->TransId, 
                "CustName"=>$row->CustName, 
                "Vendedor"=>$row->Vendedor, 
                "Bodega"=>$row->Bodega,
                "IdProceso"=>$row->IdProceso,
                "Proceso"=>$row->Proceso,
                "Color"=>$row->Color
            );
        }

        $this->data["count"] = $num;

        $this->respuesta();
        //$this->load->view('welcome_message');
    }
}
