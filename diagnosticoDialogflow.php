<?php

require __DIR__ . '/vendor/autoload.php';

use Google\Cloud\Dialogflow\V2\SessionsClient;
use Google\Cloud\Dialogflow\V2\TextInput;
use Google\Cloud\Dialogflow\V2\QueryInput;

putenv('GOOGLE_APPLICATION_CREDENTIALS=' . __DIR__ . '/dialogflow-key.json');

$projectId = 'chatbotbodegaprueba-sgm9';
$sessionId = 'test_sesion';
$languageCode = 'es';
$mensaje = 'hola';

try {
    $sessionsClient = new SessionsClient();
    $session = $sessionsClient->sessionName($projectId, $sessionId);

    $textInput = new TextInput();
    $textInput->setText($mensaje);
    $textInput->setLanguageCode($languageCode);

    $queryInput = new QueryInput();
    $queryInput->setText($textInput);

    $response = $sessionsClient->detectIntent($session, $queryInput);
    $queryResult = $response->getQueryResult();

    echo "Intent detectado: " . $queryResult->getIntent()->getDisplayName() . "<br>";
    echo "Respuesta del bot: " . $queryResult->getFulfillmentText();
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
