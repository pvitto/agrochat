<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
<<<<<<< HEAD
<head>

<!-- Contenedor del chatbot -->
<div id="chatbot" style="position: fixed; bottom: 10px; right: 20px; width: 320px; height: 400px; border: 1px solid #ccc; background: white; z-index: 9999; display: flex; flex-direction: column; font-family: sans-serif; box-shadow: 0px 0px 10px rgba(0,0,0,0.3);">
    <div style="background: #007bff; color: white; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
        <span>🤖 Chatbot</span>
        <div>
            <button onclick="minimizarChatbot()" style="background: none; border: none; color: white; font-size: 18px; margin-right: 6px; cursor: pointer;">&#8211;</button>
            <button onclick="cerrarChatbot()" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">✖</button>
        </div>
    </div>

    <div id="chatbot-messages" style="flex: 1; padding: 10px; overflow-y: auto; font-size: 14px;">
        <div><b>Bot:</b> ¡Hola! ¿Deseas consultar por <span class="clickable" onclick="enviarGuiaPredefinido('guía')"><b>guía</b></span> o <span class="clickable" onclick="enviarGuiaPredefinido('remisión')"><b>remisión</b></span>? 🧐</div>
    </div>

    <div style="display: flex; border-top: 1px solid #ddd;">
        <input id="guiaInput" type="text" style="flex: 1; padding: 8px; border: none;" placeholder="Escribe aquí...">
        <button onclick="enviarGuia()" style="background: #007bff; color: white; border: none; padding: 8px 12px; cursor: pointer;">Enviar</button>
    </div>
</div>

<div id="chatbot-toggle" onclick="restaurarChatbot()" style="position: fixed; bottom: 10px; right: 20px; width: 140px; height: 40px; background: #007bff; color: white; font-weight: bold; border-radius: 20px; display: none; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0px 0px 8px rgba(0,0,0,0.3); font-family: sans-serif; z-index: 9999;">
    💬 Abrir Chatbot
</div>

<script>
let esperandoTipo = false;
let esperandoNumero = false;
let tipoPendiente = ""; // "remision" o "guia"

const saludos = [
    "hola", "buenos días", "buenas tardes", "buenas noches", "qué más", "buenas", "saludos"
];

// Consulta información real de remisión
async function getRemisionInfo(remision) {
    let formData = new FormData();
    formData.append('tipo', 'remision');
    formData.append('valor', remision);

    try {
        let response = await fetch('<?php echo base_url();?>BodegaGuias/consultarGuiaChatbot', {
            method: 'POST',
            body: formData
        });
        let data = await response.json();

        if (data.ok && data.data) {
            let info = data.data;
            return `<b>Remisión:</b> ${info.TransId}<br>
                <b>Guía:</b> ${info.Guia}<br>
                <b>Cliente:</b> ${info.Cliente}<br>
                <b>Vendedor:</b> ${info.Vendedor}<br>
                <b>Transportadora:</b> ${info.Transportadora}<br>
                <b>TipoGuía:</b> ${info.TipoGuia}<br>
                <b>Fecha despacho:</b> ${info.Fecha}<br>`;
        } else {
            return "No se encontró información para esa remisión.";
        }
    } catch (e) {
        return "Error al conectar con el sistema.";
    }
}

// Consulta información real de guía
async function getGuiaInfo(guia) {
    let formData = new FormData();
    formData.append('tipo', 'guia');
    formData.append('valor', guia);

    try {
        let response = await fetch('<?php echo base_url();?>BodegaGuias/consultarGuiaChatbot', {
            method: 'POST',
            body: formData
        });
        let data = await response.json();

        if (data.ok && data.data) {
            let info = data.data;
            return `<b>Guía:</b> ${info.Guia}<br>
                <b>Remisión:</b> ${info.TransId}<br>
                <b>Cliente:</b> ${info.Cliente}<br>
                <b>Vendedor:</b> ${info.Vendedor}<br>
                <b>Transportadora:</b> ${info.Transportadora}<br>
                <b>TipoGuía:</b> ${info.TipoGuia}<br>
                <b>Fecha despacho:</b> ${info.Fecha}<br>`;
        } else {
            return "No se encontró información para esa guía.";
        }
    } catch (e) {
        return "Error al conectar con el sistema.";
    }
}

async function enviarGuia() {
    const input = document.getElementById("guiaInput");
    const mensajeOriginal = input.value.trim();
    const chat = document.getElementById("chatbot-messages");
    if (!mensajeOriginal) return;

    chat.innerHTML += `<div><b>Tú:</b> ${mensajeOriginal}</div>`;
    input.value = "";
    scrollChat();

    const mensaje = mensajeOriginal.toLowerCase();
    const numero = mensaje.match(/\d{5,}/);

    // Saludos y conversación básica
    if (saludos.some(s => mensaje.includes(s)) || mensaje.includes("cómo estás")) {
        chat.innerHTML += `<div><b>Bot:</b> ¡Hola! 😊 ¿Sobre qué guía o remisión necesitas información?</div>`;
        esperandoTipo = false; esperandoNumero = false; tipoPendiente = "";
        scrollChat(); return;
    }
    if (mensaje.includes("gracias")) {
        chat.innerHTML += `<div><b>Bot:</b> ¡De nada! Si quieres otra consulta de remisión o guía, dime el número.</div>`;
        return;
    }
    if (mensaje.includes("quién eres") || mensaje.includes("eres un bot")) {
        chat.innerHTML += `<div><b>Bot:</b> Soy el chatbot, conectado a la base de datos en tiempo real.</div>`;
        return;
    }

    // Consultas directas de remisión o guía (cortas o largas)
    if ((mensaje.includes("remision") || mensaje.includes("remisión")) && numero) {
        chat.innerHTML += `<div><b>Bot:</b> Consultando información...</div>`;
        scrollChat();
        const info = await getRemisionInfo(numero[0]);
        chat.innerHTML += `<div><b>Bot:</b> ${info}</div>`;
        scrollChat();
        esperandoTipo = false; esperandoNumero = false; tipoPendiente = "";
        return;
    }
    if (mensaje.includes("guia") && numero) {
        chat.innerHTML += `<div><b>Bot:</b> Consultando información...</div>`;
        scrollChat();
        const info = await getGuiaInfo(numero[0]);
        chat.innerHTML += `<div><b>Bot:</b> ${info}</div>`;
        scrollChat();
        esperandoTipo = false; esperandoNumero = false; tipoPendiente = "";
        return;
    }

    // Solo escriben "remision" o "guia" (sin número)
    if (mensaje === "remision" || mensaje === "remisión") {
        chat.innerHTML += `<div><b>Bot:</b> Por favor dime el número de remisión que deseas consultar.</div>`;
        esperandoTipo = true; tipoPendiente = "remision"; esperandoNumero = true;
        return;
    }
    if (mensaje === "guia") {
        chat.innerHTML += `<div><b>Bot:</b> Por favor dime el número de guía que deseas consultar.</div>`;
        esperandoTipo = true; tipoPendiente = "guia"; esperandoNumero = true;
        return;
    }

    // Si está esperando un número después de preguntar por remisión o guía
    if (esperandoNumero && numero) {
        if (tipoPendiente === "remision") {
            chat.innerHTML += `<div><b>Bot:</b> Consultando información...</div>`;
            scrollChat();
            const info = await getRemisionInfo(numero[0]);
            chat.innerHTML += `<div><b>Bot:</b> ${info}</div>`;
            scrollChat();
        } else if (tipoPendiente === "guia") {
            chat.innerHTML += `<div><b>Bot:</b> Consultando información...</div>`;
            scrollChat();
            const info = await getGuiaInfo(numero[0]);
            chat.innerHTML += `<div><b>Bot:</b> ${info}</div>`;
            scrollChat();
        }
        esperandoNumero = false; tipoPendiente = ""; esperandoTipo = false;
        return;
    }

    // Si solo escriben el número y antes no pidieron guía/remisión
    if (numero) {
        chat.innerHTML += `<div><b>Bot:</b> ¿Quieres consultar una <b>remisión</b> o una <b>guía</b>? Por favor dime cuál y el número.</div>`;
        esperandoTipo = true; esperandoNumero = false;
        return;
    }

    // Si nada coincide, respuesta estándar IA
    chat.innerHTML += `<div><b>Bot:</b> Disculpa, no entendí tu consulta.<br>
    Puedes preguntarme por tu <b>guía</b> o <b>remisión</b> escribiendo, por ejemplo:<br>
    <i>consultar remisión 12345</i> o <i>guía 67890</i></div>`;
    esperandoNumero = false; tipoPendiente = ""; esperandoTipo = false;
    scrollChat();
}

// Permite que al hacer clic en "guía" o "remisión" se llene el input y se envíe automáticamente
function enviarGuiaPredefinido(tipo) {
    document.getElementById("guiaInput").value = tipo;
    enviarGuia();
}

function reiniciar() {
    document.getElementById("chatbot-messages").innerHTML += `<div><b>Bot:</b> ¿Deseas consultar por <span class="clickable" onclick="enviarGuiaPredefinido('guía')"><b>guía</b></span> o <span class="clickable" onclick="enviarGuiaPredefinido('remisión')"><b>remisión</b></span>? 🧐</div>`;
    scrollChat();
}

function salir() {
    document.getElementById("chatbot-messages").innerHTML = `<div><b>Bot:</b> Sesión finalizada. Si necesitas algo, solo di <b>hola</b> 👋</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("guiaInput").addEventListener("keyup", function(event) {
        if (event.key === "Enter") enviarGuia();
    });
});

function scrollChat() {
    document.getElementById("chatbot-messages").scrollTop = document.getElementById("chatbot-messages").scrollHeight;
}
function minimizarChatbot() {
    document.getElementById("chatbot").style.display = "none";
    document.getElementById("chatbot-toggle").style.display = "flex";
}
function restaurarChatbot() {
    document.getElementById("chatbot").style.display = "flex";
    document.getElementById("chatbot-toggle").style.display = "none";
}
function cerrarChatbot() {
    document.getElementById("chatbot").style.display = "none";
    document.getElementById("chatbot-toggle").style.display = "none";
}
</script>

<!-- Estilos -->
<style>
@keyframes fadeInUp {
    from { transform: translateY(50px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
}
#chatbot { animation: fadeInUp 0.5s ease-out; }
.clickable {
    color: #007bff;
    font-weight: bold;
    cursor: pointer;
}
.picked { background-color: indianred; }
.recogiendo { background-color: orange; }
.empacando { background-color: yellow; }
.empacado { background-color: lightgreen; }
</style>

<!-- Recursos -->
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="<?php echo base_url();?>assets/js/ext/build/classic/theme-neptune-touch/resources/theme-neptune-touch-all.css" />
<link rel="stylesheet" type="text/css" href="<?php echo base_url();?>assets/fonts/font-awesome/css/all.min.css" />
<script type="text/javascript" src="<?php echo base_url();?>assets/js/ext/build/ext-all.js"></script>
<script type="text/javascript" src="<?php echo base_url();?>assets/js/ext/build/classic/locale/locale-es.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
<script type="text/javascript" src="assets/js/SeguimientoPedidos.js"></script>
<title>AGRO-COSTA SAS</title>
<link rel="shortcut icon" href="assets/img/favicon.ico" type="image/x-icon">

</head>
<body>
<!-- Aquí va el resto de TU estructura de la vista: menús, grids, ExtJS, todo igual... -->
</body>
=======
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
>>>>>>> d237607dea62ab0e8d15f95ccbf1d17d516758be
</html>
