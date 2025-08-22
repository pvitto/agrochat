<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Si este archivo está en la raíz de tu proyecto
require_once __DIR__ . '/vendor/autoload.php';

echo "Autoload cargado correctamente.<br>";

if (class_exists('\Google\Cloud\Dialogflow\V2\SessionsClient')) {
    echo "La clase SessionsClient SÍ está disponible.<br>";
} else {
    echo "La clase SessionsClient NO está disponible.<br>";
}
?>
