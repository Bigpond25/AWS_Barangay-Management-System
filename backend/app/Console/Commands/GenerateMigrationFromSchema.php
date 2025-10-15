<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateMigrationFromSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schema:generate-migration {model} {--fresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate migration from model schema definition (DEPRECATED - Schema pattern removed)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->error('This command is deprecated. The schema pattern has been removed.');
        $this->info('Please create migrations manually using: php artisan make:migration');
        return 1;
    }
    
    private function generateResidentMigration($fresh = false)
    {
        // DEPRECATED: Schema pattern removed
        $this->error('ResidentSchema no longer exists. Create migrations manually.');
        return 1;
    }
}
