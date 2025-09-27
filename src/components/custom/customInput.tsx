interface CustomInputProps {
  label: string;
  type: string;
  placeholder: string;
  className?: string;
}

export default function CustomInput({
  label,
  type,
  placeholder,
  className,
}: CustomInputProps) {
  return (
    <div className={`border ${className}`}>
      <label className="flex flex-col gap-2 p-2 font-clash w-[400px]">
        <span className="text-xs after:content-['*'] after:text-red-500">
          {label}
        </span>
        {type === "textarea" ? (
          <textarea
            placeholder={placeholder}
            className="focus:outline-none focus:ring-0 resize-none min-h-40 text-sm"
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            className="focus:outline-none focus:ring-0 text-sm"
          />
        )}
      </label>
    </div>
  );
}
