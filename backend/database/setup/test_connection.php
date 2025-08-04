<?php

/**
 * PostgreSQL Connection Test for AWS Barangay Management System
 * 
 * This script tests the database connection and verifies PostgreSQL setup
 * Run: php database/setup/test_connection.php
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\QueryException;

// Load environment variables
if (file_exists(__DIR__ . '/../../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
    $dotenv->load();
}

echo "🔍 Testing PostgreSQL Connection for AWS Barangay Management System\n";
echo "=" . str_repeat("=", 60) . "\n\n";

// Database configuration
$config = [
    'driver' => 'pgsql',
    'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port' => $_ENV['DB_PORT'] ?? '5432',
    'database' => $_ENV['DB_DATABASE'] ?? 'barangay_management',
    'username' => $_ENV['DB_USERNAME'] ?? 'postgres',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8',
    'prefix' => '',
    'schema' => 'public',
    'sslmode' => $_ENV['DB_SSLMODE'] ?? 'prefer',
];

echo "📋 Configuration:\n";
echo "   Host: {$config['host']}:{$config['port']}\n";
echo "   Database: {$config['database']}\n";
echo "   Username: {$config['username']}\n";
echo "   SSL Mode: {$config['sslmode']}\n\n";

try {
    // Test 1: Check PHP Extensions
    echo "🔧 Checking PHP Extensions...\n";
    
    if (!extension_loaded('pdo')) {
        throw new Exception("❌ PDO extension not loaded");
    }
    echo "   ✅ PDO extension loaded\n";
    
    if (!extension_loaded('pdo_pgsql')) {
        throw new Exception("❌ PDO PostgreSQL extension not loaded");
    }
    echo "   ✅ PDO PostgreSQL extension loaded\n";
    
    // Test 2: Basic Connection
    echo "\n🔌 Testing Database Connection...\n";
    
    $capsule = new Capsule;
    $capsule->addConnection($config);
    $capsule->setAsGlobal();
    $capsule->bootEloquent();
    
    $connection = $capsule->getConnection();
    $connection->getPdo();
    
    echo "   ✅ Database connection successful\n";
    
    // Test 3: Check PostgreSQL Version
    echo "\n📊 PostgreSQL Information...\n";
    
    $version = $connection->selectOne("SELECT version() as version");
    echo "   Version: " . $version->version . "\n";
    
    // Test 4: Check UUID Extension
    echo "\n🆔 Checking UUID Extension...\n";
    
    $uuidExt = $connection->selectOne(
        "SELECT COUNT(*) as count FROM pg_extension WHERE extname = 'uuid-ossp'"
    );
    
    if ($uuidExt->count > 0) {
        echo "   ✅ UUID-OSSP extension is installed\n";
        
        // Test UUID generation
        $uuid = $connection->selectOne("SELECT uuid_generate_v4() as uuid");
        echo "   🔗 Sample UUID: " . $uuid->uuid . "\n";
    } else {
        echo "   ⚠️  UUID-OSSP extension not installed\n";
        echo "   💡 Run: CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n";
    }
    
    // Test 5: Check Database Permissions
    echo "\n🔐 Checking Database Permissions...\n";
    
    try {
        // Test table creation
        $connection->statement("
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_field VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        echo "   ✅ Can create tables\n";
        
        // Test data insertion
        $connection->statement("
            INSERT INTO connection_test (test_field) VALUES ('Connection test successful')
        ");
        echo "   ✅ Can insert data\n";
        
        // Test data reading
        $result = $connection->selectOne("SELECT COUNT(*) as count FROM connection_test");
        echo "   ✅ Can read data (found {$result->count} records)\n";
        
        // Cleanup
        $connection->statement("DROP TABLE connection_test");
        echo "   ✅ Can drop tables\n";
        
    } catch (QueryException $e) {
        echo "   ❌ Permission error: " . $e->getMessage() . "\n";
    }
    
    // Test 6: Check for Existing Migrations
    echo "\n📁 Checking Migration Status...\n";
    
    try {
        $migrations = $connection->selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_name = 'migrations' AND table_schema = 'public'
        ");
        
        if ($migrations->count > 0) {
            $migrationCount = $connection->selectOne("SELECT COUNT(*) as count FROM migrations");
            echo "   ✅ Migrations table exists ({$migrationCount->count} migrations found)\n";
        } else {
            echo "   ℹ️  Migrations table doesn't exist (fresh database)\n";
        }
    } catch (QueryException $e) {
        echo "   ℹ️  Could not check migrations: " . $e->getMessage() . "\n";
    }
    
    echo "\n🎉 Connection Test Completed Successfully!\n";
    echo "=" . str_repeat("=", 60) . "\n";
    echo "✅ Your PostgreSQL setup is ready for the Barangay Management System\n\n";
    
    echo "📝 Next Steps:\n";
    echo "1. Run migrations: php artisan migrate\n";
    echo "2. Seed database: php artisan db:seed\n";
    echo "3. Start development: php artisan serve\n\n";
    
} catch (Exception $e) {
    echo "\n❌ Connection Test Failed!\n";
    echo "=" . str_repeat("=", 60) . "\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    
    echo "🔧 Troubleshooting Steps:\n";
    echo "1. Install PHP PostgreSQL extensions (pdo_pgsql, pgsql)\n";
    echo "2. Verify PostgreSQL is running on port {$config['port']}\n";
    echo "3. Check database credentials in .env file\n";
    echo "4. Ensure database '{$config['database']}' exists\n";
    echo "5. Run the PostgreSQL setup script: database/setup/postgres_setup.sql\n\n";
    
    exit(1);
}
