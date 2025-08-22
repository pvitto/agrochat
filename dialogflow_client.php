<?php
require __DIR__ . '/vendor/autoload.php';

use Google\Cloud\Dialogflow\V2\Client\SessionsClient;
use Google\Cloud\Dialogflow\V2\TextInput;
use Google\Cloud\Dialogflow\V2\QueryInput;
use Google\Cloud\Dialogflow\V2\DetectIntentRequest;

function consultarDialogflow($mensaje) {
    $projectId = 'botbodegaprueba-sgm9';
    $sessionId = uniqid();
    $languageCode = 'es';

    try {
        $sessionsClient = new SessionsClient([
            'credentials' => 'C:/xampp/htdocs/agro/dialogflow-key.json'
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

        // Extrae parámetros (convierte a array plano PHP)
        $parameters = [];
        foreach ($queryResult->getParameters()->getFields() as $key => $value) {
            // Detecta tipo de valor (número o string)
            if ($value->hasNumberValue()) {
                $parameters[$key] = $value->getNumberValue();
            } elseif ($value->hasStringValue()) {
                $parameters[$key] = $value->getStringValue();
            } else {
                $parameters[$key] = $value->__toString();
            }
        }

        return [
            'intent' => $queryResult->getIntent()->getDisplayName(),
            'fulfillmentText' => $queryResult->getFulfillmentText(),
            'parameters' => $parameters
        ];

    } catch (Throwable $e) {
        return [
            'intent' => 'Error',
            'fulfillmentText' => 'Error al conectar: ' . $e->getMessage(),
            'parameters' => []
        ];
    }
}
