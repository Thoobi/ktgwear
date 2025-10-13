import CustomInput from "../custom/customInput";
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { forgotPasswordSchema, zodErrorsToFieldMap } from "../../schemas/auth";

export default function ForgotPasswordForm() {
  const { handleForgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const res = await handleForgotPassword(email);
    if (res.validationErrors) setErrors(res.validationErrors);
  };

  const onChangeField = (value: string) => {
    setEmail(value);
    const parsed = forgotPasswordSchema.safeParse({ email: value });
    if (!parsed.success) {
      const map = zodErrorsToFieldMap(parsed.error);
      setErrors({ email: map.email });
    } else setErrors({});
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 py-10 px-5 w-lg">
      <CustomInput
        label="Email"
        type="email"
        placeholder="Enter your associated email"
        value={email}
        onChange={(e) => onChangeField(e.target.value)}
        error={errors.email}
      />
      <button
        type="submit"
        className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out"
      >
        Reset Password
      </button>
      <div className="flex justify-between">
        <Link to="/account/login" className="text-base text-black underline">
          Remembered your password?
        </Link>
      </div>
    </form>
  );
}
