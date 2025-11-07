<?php

namespace App\Services;

use App\Contracts\StorageInterface;


class LocalStorageService implements StorageInterface
{
    public function upload($file, $path)
    {
        return \Storage::putFile($path, $file);
    }

    public function delete($path)
    {
        return \Storage::delete($path);
    }
}

