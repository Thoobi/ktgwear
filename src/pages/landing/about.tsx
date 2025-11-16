import AboutUs from "../../components/home/about_us";
import { useState, useEffect } from "react";

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
  const [imageCount, setImageCount] = useState(3);

  useEffect(() => {
    const updateImageCount = () => {
      if (window.innerWidth < 1024) {
        setImageCount(1);
      } else {
        setImageCount(3);
      }
    };

    updateImageCount();
    window.addEventListener("resize", updateImageCount);
    return () => window.removeEventListener("resize", updateImageCount);
  }, []);

  return (
    <section className="px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col gap-8 md:gap-10 font-clash mt-10 md:mt-20">
      <div className="">
        <span className="pb-3 border-b border-b-gray-300 inline-block mb-5">
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-medium">
            Our History
          </h2>
        </span>
        <AboutUs />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: imageCount }).map((_, index) => (
          <div key={index} className="my-2 md:my-10">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt={`About us ${index + 1}`}
              className="w-full h-[40vh] sm:h-[45vh] md:h-[50vh] object-cover rounded-xl md:rounded-2xl"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:justify-between items-stretch lg:items-center">
        <div
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80)",
          }}
          className="bg-cover bg-top p-6 sm:p-8 md:p-10 rounded-xl md:rounded-2xl text-white flex flex-col justify-end gap-3 md:gap-4 h-[350px] sm:h-[400px] md:h-[450px] w-full lg:w-[650px] lg:flex-shrink-0"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium">
            {content[0].label}
          </h3>
          <p className="text-white font-medium text-sm sm:text-base">
            {content[0].value}
          </p>
        </div>
        <div className="flex flex-col w-full lg:max-w-xl gap-6 md:gap-10">
          {content.slice(1).map((item) => (
            <div
              key={item.label}
              className={`p-6 sm:p-8 rounded-xl md:rounded-2xl ${
                item.label === "Our Vision" ? "bg-green-800" : "bg-green-100"
              }`}
            >
              <h3
                className={`text-xl sm:text-2xl font-medium mb-2 text-black ${
                  item.label === "Our Vision" && "text-white"
                }`}
              >
                {item.label}
              </h3>
              <p
                className={`text-sm sm:text-base text-gray-700 ${
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
