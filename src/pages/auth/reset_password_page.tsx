import ResetPasswordForm from "../../components/auth/reset_password";

export default function ResetPasswordPage() {
  return (
    <section className="px-8 min-h-[90vh] w-full flex justify-center items-center font-clash">
      <div className="flex flex-col gap-6 py-10">
        <h1 className="text-5xl font-medium text-center">Reset Password</h1>
        <ResetPasswordForm />
      </div>
    </section>
  );
}
