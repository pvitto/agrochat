<?php
// seguridad basica de CodeIgniter: evita acceso directo al archivo
defined('BASEPATH') OR exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <title>Guías Despachadas - Vista para Asesores</title>

      <!-- favicon para el navegador -->
      <link rel="shortcut icon" href="assets/img/favicon.ico" type="image/x-icon">

      <!-- EXT JS: estilos principales -->
      <link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>assets/js/ext/build/classic/theme-neptune-touch/resources/theme-neptune-touch-all.css">

      <!-- FontAwesome: para iconos modernos (camiones, sincronizar, etc.) -->
      <link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>assets/fonts/font-awesome/css/all.min.css">

      <!-- EXT JS: Libreria principal y traduccion al español -->
      <script type="text/javascript" src="<?php echo base_url(); ?>assets/js/ext/build/ext-all.js"></script>
      <script type="text/javascript" src="<?php echo base_url(); ?>assets/js/ext/build/classic/locale/locale-es.js"></script>

      <!-- Socket.IO: para conexion en tiempo real si en el futuro queremos actualizar automaticamente -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

      <!-- nuestro JavaScript personalizado para cargar las guias -->
      <script src="<?php echo base_url(); ?>assets/js/seguimientoguias.js"></script>

      <!-- estilos personalizados para mejorar la apariencia del grid -->
      <style>
         body {
            margin: 0;
            font-family: Arial, sans-serif;
         }

         /* HEADER del panel principal (igual que en la vista de Bodega) */
         .x-panel-header-default-framed {
            border: none !important;
            background-color: #007ac1 !important; /* Azul corporativo */
            color: white !important;
            font-family: Arial, sans-serif !important;
            font-size: 16px !important;
            font-weight: bold !important;
            padding: 6px 10px !important;
            height: 45px !important;
            line-height: 32px !important;
         }

         /* QUITAR borde inferior */
         .x-panel-header-default-framed-top {
            border-bottom: none !important;
         }

         /* ajuste del texto del titulo */
         .x-title-text {
            padding-top: 3px !important;
            display: inline-block;
         }

         /* LOGO integrado al lado izquierdo d */
         #tabla .x-panel-header-title-default-framed > .x-title-icon-wrap-default-framed > .x-title-icon-default-framed {
            width: 50px !important;
            height: 25px !important;
            background-image: url("/agro/assets/img/logo.png");
            background-size: 100% !important;
            background-repeat: no-repeat !important;
            margin-right: 10px;
         }

         /* COLORES de transportadoras en la tabla */
         .color-servientrega { color: green !important; font-weight: bold; }
         .color-coordinadora { color: blue !important; font-weight: bold; }
         .color-chevalier { color: red !important; font-weight: bold; }
         .color-rapidoochoa { color: hotpink !important; font-weight: bold; }
         .color-berlinas { color: saddlebrown !important; font-weight: bold; }
         .color-deprisa { color: #da7422 !important; font-weight: bold; }
         .color-tcc { color: darkorange !important; font-weight: bold; }
         .color-encoexpress { color: #720026 !important; font-weight: bold; }
         .color-interrapidisimo { color: purple !important; font-weight: bold; }

         /* COLORES para la columna de bodega (p1 y A), con borde en el texto */
         .bodega-P1 {
            color: #8b6508 !important; 
            font-weight: bold;
            -webkit-text-stroke: 0.6px #92e8f6; /* borde */
         }

         .bodega-A {
            color: #d33 !important; 
            font-weight: bold;
            -webkit-text-stroke: 0.6px yellow; /* borde  */
         }
<<<<<<< HEAD

         .despachado {
    background-color: #808080 !important; /* gris oscuro */
    color: white !important;
    font-weight: bold;
    padding: 1px 1px;
    border-radius: 1px;  /*bordes redondeados */
    display: inline-block;  /*para que respete el padding */
    text-align: left;
}
/*.despachado {
    background-color: gray !important;
    color: black !important;
    font-weight: normal;  Cambiado de bold a normal 
    text-align: center;  centra el texto 
}*/



=======
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
      </style>
   </head>
   
   <body>
<<<<<<< HEAD
      <!-- el cuerpo queda vacio........
=======
      <!-- el cuerpo queda vacío. EXT JS se encargara de construir la interfaz aqui dinamicamente. -->
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
   </body>
</html>
