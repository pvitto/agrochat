<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <title>AGRO-COSTA SAS</title>
      <link rel="shortcut icon" href="<?php echo base_url();?>assets/img/favicon.ico" type="image/x-icon">

      <link rel="stylesheet" type="text/css" href="<?php echo base_url();?>assets/js/ext/build/classic/theme-neptune-touch/resources/theme-neptune-touch-all.css" />
      <link rel="stylesheet" type="text/css" href="<?php echo base_url();?>assets/fonts/font-awesome/css/all.min.css" />

      <style>
         .picked {
            background-color: indianred;
         }
         .recogiendo {
            background-color: orange;
         }
         .empacando {
            background-color: yellow;
         }
         .empacado {
            background-color: lightgreen;
         }
         #tabla .x-panel-header-title-default-framed > .x-title-icon-wrap-default-framed > .x-title-icon-default-framed {
            width: 50px;
            height: 25px;
            background-image: url('<?php echo base_url();?>assets/img/logo.png');
            background-size: 100%;
            background-repeat: no-repeat;
         }
      </style>
   </head>
   <body>
      <!-- Contenedor donde tu JS va a montar la vista -->
      <div id="root"></div>
      
      <!-- JS necesarios -->
      <script type="text/javascript" src="<?php echo base_url();?>assets/js/ext/build/ext-all.js"></script>
      <script type="text/javascript" src="<?php echo base_url();?>assets/js/ext/build/classic/locale/locale-es.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
      <script type="text/javascript" src="<?php echo base_url();?>assets/js/SeguimientoPedidos.js"></script>
   </body>
</html>
