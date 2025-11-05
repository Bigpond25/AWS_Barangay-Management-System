import React, { useRef, useState } from "react";
import { Download } from "lucide-react";
import { establishmentService } from "@/services/establishments/establishment.service";

export default function ImportButton({
  onImportSuccess
}: {
  onImportSuccess?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      await establishmentService.importEstablishments(file);
      onImportSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleFileSelect}
        disabled={isUploading}
        className="cursor-pointer flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {isUploading ? "Uploading..." : "Import xlsx/xls"}
      </button>

      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
