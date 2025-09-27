import AboutUs from "../../components/home/about_us";

const content = [
  {
    label: "Who we are",
    value:
      "KTG wears is an online and in-store leading fashion boutique with an array of carefully curated apparel and accessories to amplify your personal style.",
  },
  {
    label: "Our Mission",
    value:
      "At our core, Our mission is to establish a clothing line that will make available a wide range of clothes for male, female, teengagers and kids; A clothing label that will favourable with clothing enthusiasts and international clothing brands at a global scale.",
  },
  {
    label: "Our Vision",
    value:
      "Our vision is to establish a clothing line whose brand will not only be a household name in Nigeria but a brand that will be reckoned within the international market.",
  },
];
export default function About() {
  return (
    <section className="px-8 py-10 flex flex-col gap-10 font-clash">
      <div className="">
        <span className="pb-3 border-b border-b-gray-300 inline-block mb-5">
          <h2 className="text-4xl font-medium">Our History</h2>
        </span>
        <AboutUs />
      </div>
      <div className="flex flex-row gap-5 justify-center">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="my-10">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt={`About us ${index + 1}`}
              className="w-full h-[50vh] object-cover rounded-2xl"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-between items-center">
        <div
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80)",
            height: "450px",
            width: "650px",
          }}
          className="bg-cover bg-top p-10 rounded-2xl text-white flex flex-col justify-end gap-4"
        >
          <h3 className="text-5xl font-medium">{content[0].label}</h3>
          <p className="text-white font-medium">{content[0].value}</p>
        </div>
        <div className="flex flex-col max-w-xl gap-10">
          {content.slice(1).map((item) => (
            <div
              key={item.label}
              className={`p-8 rounded-2xl ${
                item.label === "Our Vision" ? "bg-green-800" : "bg-green-100"
              }`}
            >
              <h3
                className={`text-2xl font-medium mb-2 text-black ${
                  item.label === "Our Vision" && "text-white"
                }`}
              >
                {item.label}
              </h3>
              <p
                className={`text-gray-700 ${
                  item.label === "Our Vision" && "text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
