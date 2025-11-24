import CustomInput from "../custom/customInput";
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { loginSchema, zodErrorsToFieldMap } from "../../schemas/auth";

export default function LoginForm() {
  const { handleLogin, isLoginLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const res = await handleLogin({ email, password });
    if (res.validationErrors) setErrors(res.validationErrors);
  };

  const onChangeField = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    const model = {
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
    };
    const parsed = loginSchema.safeParse(model);
    if (!parsed.success) {
      const map = zodErrorsToFieldMap(parsed.error);
      setErrors((prev) => ({ ...prev, [field]: map[field] }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 py-10 px-5 max-md:px-0 w-lg max-md:w-full"
    >
      <CustomInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => onChangeField("email", e.target.value)}
        error={errors.email}
      />
      <CustomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => onChangeField("password", e.target.value)}
        error={errors.password}
      />
      <div className="flex justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="w-4 h-4" />
          Remember me
        </label>
        <Link to="/account/forgot" className="text-base underline">
          Forgot Password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isLoginLoading}
        className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out"
      >
        {isLoginLoading ? "Logging in..." : "Login"}
      </button>
      <div className="flex justify-center">
        <p className="text-base text-black">
          Don't have an account?{" "}
          <a href="/account/signup" className="underline">
            Sign Up
          </a>
        </p>
      </div>
    </form>
  );
}
