import ResetPasswordForm from "../../components/auth/reset_password";

export default function ResetPasswordPage() {
  return (
    <section className="px-8 min-h-[90vh] max-md:min-h-screen max-md:px-5 max-md:gap-0 w-full flex justify-center items-center font-clash">
      <div className="flex flex-col gap-6 py-10 max-md:pt-24 max-md:gap-0 max-md:w-full">
        <h1 className="text-5xl font-medium text-center max-md:text-4xl">
          Reset Password
        </h1>
        <ResetPasswordForm />
      </div>
    </section>
  );
}
