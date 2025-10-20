  // Reusable inline input field component
  const InputField = ({
    label,
    placeholder,
    type = 'text',
  }: {
    label: string;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-smblue-300 focus:border-smblue-400 outline-none transition"
      />
    </div>
  );

  export default InputField;
