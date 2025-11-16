import ContactForm from "../../components/home/contact_form";
export default function Contact() {
  return (
    <section className="px-4 sm:px-6 md:px-8 flex flex-col gap-6 md:gap-8 font-clash py-10 md:py-16 mt-10 md:mt-20">
      <div className="flex flex-col gap-2 md:gap-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium">
          GET IN TOUCH WITH US
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md">
          If you have any questions or inquiries, feel free to reach out to us
          using the form below.
        </p>
      </div>
      <ContactForm />
    </section>
  );
}
