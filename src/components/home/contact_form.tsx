import CustomInput from "../custom/customInput";

const data = [
  {
    label: "Location",
    value: "Plot 5 Akiogun Rd, Maroko, Oniru, Victoria Island, Lagos, Nigeria",
    extraContent: "Near Lekki-Ikoyi Link Bridge",
  },
  {
    label: "Email",
    value: "ktgwears@gmail.com",
    extraContent: "All emails will be responded to within 24 hours",
  },
  {
    label: "Contact Center Support",
    value: "+234 123 4567",
    extraContent: "For immediate assistance, please call our support center.",
  },
  {
    label: "Opening Hours",
    value: "Mon - Sun: 9:00 AM - 6:00 PM",
    extraContent: "Note: We are closed on public holidays.",
  },
];
export default function ContactForm() {
  return (
    <div className="flex flex-row gap-5 justify-between">
      <div className="flex flex-col gap-5 w-2/5">
        <CustomInput label="Name" type="text" placeholder="Enter your name" />
        <CustomInput
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <CustomInput
          label="Message"
          type="textarea"
          placeholder="Enter your message"
        />
        <button className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out">
          Submit
        </button>
      </div>
      <div className="w-2/5 flex flex-col gap-5">
        {data.map((item) => (
          <div key={item.label} className="border-b border-b-gray-300 pb-5">
            <h3 className="text-lg font-medium mb-2">{item.label}</h3>
            <p className="text-gray-600">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
