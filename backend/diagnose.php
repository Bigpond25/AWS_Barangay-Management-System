<?php

require __DIR__.'/vendor/autoload.php';

echo "Checking configuration files...\n\n";

$configPath = __DIR__ . '/config';
$files = scandir($configPath);

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'php') continue;
    
    $filePath = $configPath . '/' . $file;
    echo "Checking: $file\n";
    
    try {
        $config = require $filePath;
        
        if (!is_array($config)) {
            echo "  ERROR: Returns " . gettype($config) . " instead of array\n";
        } else {
            // Check for numeric keys where arrays are expected
            foreach ($config as $key => $value) {
                if (is_int($key) && !is_array($value)) {
                    echo "  WARNING: Key '$key' has non-array value: " . gettype($value) . "\n";
                }
            }
            echo "  OK - Returns array\n";
        }
    } catch (Throwable $e) {
        echo "  EXCEPTION: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

echo "\nChecking .env file...\n";
if (file_exists(__DIR__ . '/.env')) {
    echo "OK - .env exists\n";
    $envContent = file_get_contents(__DIR__ . '/.env');
    
    // Check for APP_KEY
    if (strpos($envContent, 'APP_KEY=') !== false) {
        preg_match('/APP_KEY=(.*)/', $envContent, $matches);
        $key = trim($matches[1] ?? '');
        if (empty($key)) {
            echo "ERROR - APP_KEY is empty\n";
        } else {
            echo "OK - APP_KEY is set\n";
        }
    } else {
        echo "ERROR - APP_KEY not found\n";
    }
} else {
    echo "ERROR - .env file not found\n";
}