<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
   <head>
      
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
            background-image: url(/agro/assets/img/logo.png);
            background-size: 100%;
            background-repeat: no-repeat;
         } 
         
      </style>
      <meta charset="UTF-8">
      <link rel = "stylesheet" type = "text/css" href = "<?php echo base_url();?>assets/js/ext/build/classic/theme-neptune-touch/resources/theme-neptune-touch-all.css" />
      <link rel = "stylesheet" type = "text/css" href = "<?php echo base_url();?>assets/fonts/font-awesome/css/all.min.css" />
      <script type = "text/javascript" src = "<?php echo base_url();?>assets/js/ext/build/ext-all.js"> </script>
      <script type = "text/javascript" src = "<?php echo base_url();?>assets/js/ext/build/classic/locale/locale-es.js"> </script>	  
      <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
      <!--<script type="text/javascript" src="<?php // echo base_url();?>assets/js/SeguimientoPedidos.js"></script>-->
      

      <link rel="shortcut icon" href="http://192.168.0.205/agro/assets/img/favicon.ico" type="image/x-icon">

      <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AG-SOFT</title>
  <link rel="stylesheet" href="styles.css">

<style>
body, html {
  margin: auto;
  padding: 0;
  height: 90%;
width: 90%;
  font-family: Arial, sans-serif;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  text-align: center;
}

.logo-container img {
  width: auto;
  height: auto;
  margin-bottom: 5px;
}

.logo-container h1 {
  font-size: 24px;
}

.tiles-container {
  flex: 1; /* Para que ocupe todo el espacio restante */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s ease;
}

.tile:hover {
  background-color: #e0e0e0;
}

/* Media query para pantallas mayores a 800px */
@media only screen and (min-width: 800px) {
  .tiles-container {
    grid-template-columns: repeat(3, 1fr);
    font-size:20px;
  }
}

/* Media query para pantallas menores a 800px */
@media only screen and (max-width: 800px) {
  .tiles-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    font-size:14px;
  }
}
</style>




   </head>
   <body>
  <div class="container">
    <div class="logo-container">
      <a href="http://192.168.0.205/agro/home/"><img src="/agro/assets/img/logo.png" style="width:180px" alt="Logo"></a>
      <h1 style="font-size:30px;">AG-SOFT</h1>
    </div>
    <div class="tiles-container">
      <a href="http://192.168.0.205/agro/BodegaAdmin" class="tile" target="_blank" style="background-color:#d1b787;color:#fff;font-weight:bold;">Packing Bodega Admin</a>
      <a href="http://192.168.0.205/agro/Bodega" class="tile" target="_blank" style="background-color:#e9c788;color:#fff;font-weight:bold;">Packing Bodega Operarios</a>
      <a href="http://192.168.0.205/agro/traslado/" class="tile" target="_blank" style="background-color:#000;color:#fff;font-weight:bold;">Traslados</a>
      <a href="http://192.168.0.205/agro/localizar/" class="tile" target="_blank" style="background-color:#157fcc;color:#fff;font-weight:bold;">Despachos</a>
      <a href="http://192.168.0.205/agro/localizaciones/" class="tile" target="_blank" style="background-color:#97213f;color:#fff;font-weight:bold;">Localizar ITEMS</a>
      <a href="#" class="tile"></a>
    </div>
  </div>


</html>
