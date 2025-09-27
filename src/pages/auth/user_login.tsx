import LoginForm from "../../components/auth/login_form";
export default function UserLogin() {
  return (
    <section className="px-8 min-h-[90vh] w-full flex flex-col justify-center items-center font-clash">
      <div className="flex flex-col gap-6 py-10">
        <h1 className="text-5xl font-medium text-center">Account Login</h1>
        <LoginForm />
      </div>
    </section>
  );
}
