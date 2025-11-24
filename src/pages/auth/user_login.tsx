import LoginForm from "../../components/auth/login_form";
export default function UserLogin() {
  return (
    <section className="px-8 max-md:px-5 min-h-[90vh] max-md:min-h-screen w-full flex flex-col justify-center items-center font-clash">
      <div className="flex flex-col gap-6 max-md:gap-0 py-10 max-md:pt-24 max-md:w-full">
        <h1 className="text-5xl font-medium text-center max-md:text-3xl">
          Account Login
        </h1>
        <LoginForm />
      </div>
    </section>
  );
}
