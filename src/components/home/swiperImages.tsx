import { useEffect, useState } from "react";

interface SwiperImage {
  url: string[];
}
export default function SwiperImages({ url }: SwiperImage) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === url.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [url.length]);

  return (
    <div className="w-full bg-grey-300">
      <img
        src={url[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-[90vh]"
      />
    </div>
  );
}
