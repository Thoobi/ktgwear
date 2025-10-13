import { useState } from "react";
import { RiEyeOffLine, RiEyeLine } from "react-icons/ri";
interface CustomInputProps {
  label: string;
  type: string;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string | null;
}

export default function CustomInput({
  label,
  type = "text",
  placeholder,
  className,
  value,
  onChange,
  error,
}: CustomInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className={`border ${className}`}>
      <label className="flex flex-col gap-2 p-2 font-clash w-full">
        <span className="text-xs after:content-['*'] after:text-red-500">
          {label}
        </span>
        {type === "textarea" ? (
          <textarea
            placeholder={placeholder}
            className="focus:outline-none focus:ring-0 resize-none min-h-40 text-sm"
            value={value}
            onChange={onChange}
          />
        ) : (
          <div
            className={`flex items-center ${
              type === "password" ? "justify-between" : "justify-center"
            } w-full`}
          >
            <input
              type={
                type === "password"
                  ? passwordVisible
                    ? "text"
                    : "password"
                  : type
              }
              placeholder={placeholder}
              className={`focus:outline-none focus:ring-0 text-base ${
                type === "password" ? "w-[80%]" : "w-full"
              }`}
              value={value}
              onChange={onChange}
            />
            {type.toLowerCase() === "password" && (
              <span
                className="cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <RiEyeLine size={18} />
                ) : (
                  <RiEyeOffLine size={18} />
                )}
              </span>
            )}
          </div>
        )}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </label>
    </div>
  );
}
