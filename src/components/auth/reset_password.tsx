import CustomInput from "../custom/customInput";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { resetPasswordSchema, zodErrorsToFieldMap } from "../../schemas/auth";
import { toast } from "sonner";
import { supabaseAuthError } from "../../lib/supabaseErrors";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password !== confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setErrors(zodErrorsToFieldMap(parsed.error));
      return;
    }

    setLoading(true);
    try {
      // supabase should have parsed the session from the url during the
      // redirect; updateUser will set the new password for the current session
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.debug("reset_password: supabase.updateUser error:", error);
        toast.error(supabaseAuthError(error, "Could not reset password"));
        return;
      }
      console.debug("reset_password: updateUser success");
      toast.success("Password has been reset. You can now log in.");
      // redirect to login
      window.location.assign(`${window.location.origin}/account/login`);
    } catch (err) {
      console.error("Reset password error:", err);
      console.debug("reset_password: unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onChangeField = (field: string, value: string) => {
    if (field === "password") setPassword(value);
    if (field === "confirm") setConfirm(value);

    // live-validate the password field
    if (field === "password") {
      const parsed = resetPasswordSchema.safeParse({ password: value });
      if (!parsed.success) {
        setErrors((prev) => ({
          ...prev,
          password: zodErrorsToFieldMap(parsed.error).password,
        }));
      } else {
        setErrors((prev) => {
          const c = { ...prev };
          delete c.password;
          return c;
        });
      }
    }

    if (field === "confirm") {
      if (value !== password)
        setErrors((prev) => ({ ...prev, confirm: "Passwords do not match" }));
      else
        setErrors((prev) => {
          const c = { ...prev };
          delete c.confirm;
          return c;
        });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 py-10 max-md:py-8 px-5 w-lg max-md:w-full max-md:px-0"
    >
      <CustomInput
        label="New password"
        type="password"
        placeholder="Enter a new password"
        value={password}
        onChange={(e) => onChangeField("password", e.target.value)}
        error={errors.password}
      />
      <CustomInput
        label="Confirm password"
        type="password"
        placeholder="Re-enter your new password"
        value={confirm}
        onChange={(e) => onChangeField("confirm", e.target.value)}
        error={errors.confirm}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
