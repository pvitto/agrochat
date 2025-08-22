<?php
require __DIR__ . '/vendor/autoload.php';

use Google\Cloud\Dialogflow\V2\Client\SessionsClient;
use Google\Cloud\Dialogflow\V2\TextInput;
use Google\Cloud\Dialogflow\V2\QueryInput;
use Google\Cloud\Dialogflow\V2\DetectIntentRequest;

putenv('GOOGLE_APPLICATION_CREDENTIALS=C:/xampp/htdocs/agro/dialogflow-key.json');

$projectId = 'botbodegaprueba-sgm9';
$sessionId = uniqid();
$languageCode = 'es';
$mensaje = 'Hola';

try {
    $sessionsClient = new SessionsClient([
        'credentials' => getenv('GOOGLE_APPLICATION_CREDENTIALS')
    ]);
    $session = $sessionsClient->sessionName($projectId, $sessionId);

    $textInput = new TextInput();
    $textInput->setText($mensaje);
    $textInput->setLanguageCode($languageCode);

    $queryInput = new QueryInput();
    $queryInput->setText($textInput);

    $detectIntentRequest = new DetectIntentRequest();
    $detectIntentRequest->setSession($session);
    $detectIntentRequest->setQueryInput($queryInput);

    $response = $sessionsClient->detectIntent($detectIntentRequest);
    $queryResult = $response->getQueryResult();

    echo 'Intent: ' . $queryResult->getIntent()->getDisplayName() . "<br>";
    echo 'Respuesta: ' . $queryResult->getFulfillmentText();
} catch (Throwable $e) {
    echo 'Error: ' . $e->getMessage();
}
