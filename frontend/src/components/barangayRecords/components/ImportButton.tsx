import React, { useRef, useState } from "react";
import { Download } from "lucide-react";

export default function ImportButton() {
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

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/establishments/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      alert(`✅ Successfully imported ${result.count || "records"} records!`);
    } catch (error: any) {
      console.error(error);
      alert(`❌ Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset input
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
