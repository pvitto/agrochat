<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
   <head>
      
      <style>
         .pordespacho{
            background-color: indianred;
         }
         .ubicado {
            background-color: orange;
         }
         .despachado {
            background-color: gray;
         }
         .empacado {
            background-color: lightgreen;
         }
         .activo {
            background-color: lightgreen;
         }
         .inactivo {
            background-color: indianred;
         }
         #tabla .x-panel-header-title-default-framed > .x-title-icon-wrap-default-framed > .x-title-icon-default-framed {
            width: 50px;
            height: 25px;
            background-image: url(/agro/assets/img/logo.png);
            background-size: 100%;
            background-repeat: no-repeat;
         }
         .x-panel-header-default-framed {
         border: 5px solid #97213f !important;
         }
         .x-panel-header-default-framed-top {
         background-color: #97213f !important;
         }
         .x-panel-default-framed {
         border-color: #0e0e0e !important;
      }

      </style>
      <meta charset="UTF-8">
      <link rel = "stylesheet" type = "text/css" href = "assets/js/ext/build/classic/theme-neptune-touch/resources/theme-neptune-touch-all.css" />
      <link rel = "stylesheet" type = "text/css" href = "assets/fonts/font-awesome/css/all.min.css" />
      <script type = "text/javascript" src = "assets/js/ext/build/ext-all.js"> </script>
      <script type = "text/javascript" src = "assets/js/ext/build/classic/locale/locale-es.js"> </script>	  
      <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
      <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
      <script type="text/javascript" src="assets/js/bodegadespacho.js"></script>
      <title>AGRO-COSTA SAS</title>
      <link rel="shortcut icon" href="assets/img/favicon.ico" type="image/x-icon">
   </head>
</html>
