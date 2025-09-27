import RegisterForm from "../../components/auth/register_form";
export default function UserRegister() {
  return (
    <section className="px-8 min-h-[90vh] w-full flex justify-center gap-5 items-center font-clash">
      <div className="flex flex-col gap-6 py-10">
        <h1 className="text-5xl font-medium text-center">
          Account Registration
        </h1>
        <RegisterForm />
      </div>
    </section>
  );
}
