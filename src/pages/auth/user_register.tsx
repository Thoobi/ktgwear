import RegisterForm from "../../components/auth/register_form";
export default function UserRegister() {
  return (
    <section className="px-8 min-h-[90vh] max-md:min-h-screen max-md:px-5 max-md:gap-0 w-full flex justify-center gap-5 items-center font-clash">
      <div className="flex flex-col gap-6 py-10 max-md:pt-24 max-md:gap-0 max-md:w-full">
        <h1 className="text-5xl font-medium text-center max-md:text-4xl">
          Account Signup
        </h1>
        <RegisterForm />
      </div>
    </section>
  );
}
