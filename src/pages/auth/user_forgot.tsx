import ForgotPasswordForm from "../../components/auth/forgot_form";
export default function UserForgot() {
  return (
    <section className="px-8 min-h-[90vh] max-md:min-h-screen max-md:px-5 max-md:gap-0 w-full flex justify-center items-center font-clash">
      <div className="flex flex-col gap-6 py-10 max-md:pt-24 max-md:gap-0 max-md:w-full justify-center items-center">
        <h1 className="text-5xl font-medium text-center max-md:text-4xl">
          Forgot Password
        </h1>
        <p className="text-base max-md:text-sm w-md max-md:w-xs text-center">
          Please enter your registered email address to receive a password reset
          link.
        </p>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
