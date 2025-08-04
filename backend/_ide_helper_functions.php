<?php

/**
 * Laravel Helper Functions for IDE Support
 * 
 * This file provides function declarations for Laravel helper functions
 * to prevent IDE warnings in configuration files.
 */

if (!function_exists('env')) {
    /**
     * Gets the value of an environment variable.
     */
    function env(string $key, mixed $default = null): mixed
    {
        return $default;
    }
}

if (!function_exists('database_path')) {
    /**
     * Get the database path.
     */
    function database_path(string $path = ''): string
    {
        return '';
    }
}

if (!function_exists('base_path')) {
    /**
     * Get the base path of the Laravel installation.
     */
    function base_path(string $path = ''): string
    {
        return '';
    }
}

if (!function_exists('storage_path')) {
    /**
     * Get the storage path.
     */
    function storage_path(string $path = ''): string
    {
        return '';
    }
}
