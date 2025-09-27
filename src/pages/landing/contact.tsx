import ContactForm from "../../components/home/contact_form";
export default function Contact() {
  return (
    <section className="px-8 flex flex-col gap-8 font-clash py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-medium">GET IN TOUCH WITH US</h1>
        <p className="text-base text-gray-600 max-w-md">
          If you have any questions or inquiries, feel free to reach out to us
          using the form below.
        </p>
      </div>
      <ContactForm />
    </section>
  );
}
