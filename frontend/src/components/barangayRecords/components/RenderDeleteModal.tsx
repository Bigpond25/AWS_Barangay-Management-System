
export default function RenderDeleteModal({
    showDeleteModal,
    selectedItem,
    textItem,
    setShowDeleteModal,
    setSelectedItem,
    handleDelete,
    isDeleting,
}: {
    showDeleteModal: boolean;
    selectedItem: any;
    textItem: string;
    setShowDeleteModal: (value: boolean) => void;
    setSelectedItem: (value: any) => void;
    handleDelete: (establishment: any) => Promise<void>;
    isDeleting: boolean;
}) {
    if (!showDeleteModal || !selectedItem) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{textItem}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => await handleDelete(selectedItem)}
              // disabled={deleteEstablishmentMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };
