import CustomInput from "../custom/customInput";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { signupSchema, zodErrorsToFieldMap } from "../../schemas/auth";

export default function RegisterForm() {
  const { handleSignup, isSignupLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password !== confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }
    const res = await handleSignup({ email, password, username: name });
    if (res.validationErrors) setErrors(res.validationErrors);
  };

  const onChangeField = (field: string, value: string) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirm") setConfirm(value);

    // validate using zod, but only show the error for the current field
    const model = {
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
      username: field === "name" ? value : name,
    };
    const parsed = signupSchema.safeParse(model);
    if (!parsed.success) {
      const map = zodErrorsToFieldMap(parsed.error);
      const key = field === "name" ? "username" : field;
      setErrors((prev) => ({ ...prev, [key]: map[key] }));
    } else {
      const key = field === "name" ? "username" : field;
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 py-10 px-5 w-lg">
      <CustomInput
        label="Name"
        type="text"
        placeholder="Enter your full name"
        className="w-full"
        value={name}
        onChange={(e) => onChangeField("name", e.target.value)}
        error={errors.username}
      />
      <CustomInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        className="w-full"
        value={email}
        onChange={(e) => onChangeField("email", e.target.value)}
        error={errors.email}
      />
      <CustomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        className="w-full"
        value={password}
        onChange={(e) => onChangeField("password", e.target.value)}
        error={errors.password}
      />
      <CustomInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        className="w-full"
        value={confirm}
        onChange={(e) => onChangeField("confirm", e.target.value)}
        error={errors.confirm}
      />
      <button
        type="submit"
        disabled={isSignupLoading}
        className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out"
      >
        {isSignupLoading ? "Signing up..." : "Create account"}
      </button>
      <div className="flex justify-center">
        <p className="text-base text-black">
          Already have an account?{" "}
          <a href="/account/login" className="underline">
            Log In
          </a>
        </p>
      </div>
    </form>
  );
}
