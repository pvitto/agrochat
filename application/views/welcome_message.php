<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
<head>
    <style>
        table {
            font-family: sans-serif;
            font-weight: 900;
            /*border-collapse: collapse;*/
            width: 100%;
            font-style: italic;
            /*-webkit-text-stroke: thin;*/
            padding:5px;
        }
        
        #header td {
            border-color: black;
        }

        #header {
            font-size: larger;
            text-align: center;
        }
        td {
            border-bottom: 2px solid;   
            border-color: #cacaca;
            font-size:18px;
            font-weight:500;
        }
    </style>
    <title>AGRO-COSTA SAS</title>
    <link rel="shortcut icon" href="assets/img/favicon.ico" type="image/x-icon">
</head>
<body style="margin: 0px; overflow-y: hidden; overflow-x: hidden; background-color: gainsboro;">
<div id="area" style="width: 100%; height: 97vh; margin: 10px -20px 0px 10px;">
    <div style="height: 100%; width: 40%; float: left;  margin: 0px 10px 2px 2px;">
        <div style="height: 33%; width: 100%; border: 2px; border-color: orange; border-style: solid; border-radius: 25px; margin: 0px 0px 10px 0px; position: relative;">
            <div style="position: absolute;z-index: 1;background-image: url('assets/img/logo.png');background-size: cover;background-repeat: round;border-radius: 25px;width: 100%;height: 100%;opacity: 0.1;"></div>
            <center>
            <img src="http://agro-costa.com/images/productos/trenes/1.png" style="width:50%">
            </center>
            <!--<div id="typer" style="position: absolute;z-index: 2;border-radius: 25px;width: 98%;height: 100%; text-align: justify; font-style: italic; font-size: 25px; left: 7px;-webkit-text-stroke-width: thin; overflow-y: hidden;"></div>-->
        </div>
        <div style="height: 65%; width: 100%; border: 2px; border-color: orange; border-style: solid; border-radius: 25px;">
            <!--<video id="video" width="100%" height="100%" style="border-radius: 25px;" muted autoplay>
            </video>-->
            <div id="slide" style="height: 100%; width: 100%; background-repeat: round; background-size: cover; border-radius: 25px;"></div>
        </div>
        <!--<div style="height: 33%; width: 100%; border: 2px; border-color: orange; border-style: solid; border-radius: 25px;"></div>-->
    </div>
    <div style="height: 100%; width: 58%; float: left; overflow: hidden; border: 2px; border-color: orange; border-style: solid; border-radius: 25px;">
        <table id="tabla">
            <tr id="header">
                <td style="width: 10%; text-align:left;font-size:18px;font-weight:600; ">Remision</td>
                <td style="width: 57%;text-align:left;font-size:18px;font-weight:600;">Cliente</td>
				<td style="width: 19%;text-align:left;font-size:18px;font-weight:600;">Vendedor</td>
                <td style="width: 12%;text-align:left;font-size:18px;font-weight:600;">Estado</td>
            </tr>
        </table>
    </div>
</div>
<script src="assets/js/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
<script type="text/javascript" src="assets/js/app.js"></script>
</body>
</html> 