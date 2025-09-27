import { useState } from "react";
import { RiEyeOffLine, RiEyeLine } from "react-icons/ri";
interface CustomInputProps {
  label: string;
  type: string;
  placeholder: string;
  className?: string;
}

export default function CustomInput({
  label,
  type = "text",
  placeholder,
  className,
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
      </label>
    </div>
  );
}
