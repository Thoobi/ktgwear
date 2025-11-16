import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../components/hooks/useCart";

export default function ShopCategoryPage() {
  const { category } = useParams();
  const { allWearables, getAllWears } = useCart();

  useEffect(() => {
    if (!allWearables || allWearables.length === 0) {
      void getAllWears();
    }
  }, [allWearables, getAllWears]);

  const slug = useMemo(
    () => (s: string) => s.toLowerCase().replace(/\s+/g, "-"),
    []
  );

  const items = (allWearables || []).filter((w) => {
    if (!category) return true;
    return slug(w.category || "") === category.toLowerCase();
  });

  return (
    <div className="px-6 pt-10 pb-40 font-clash mt-20 max-md:mt-10">
      <span className="w-full flex flex-col justify-center items-center">
        <Link
          to={"/shop"}
          className="text-4xl max-md:text-2xl font-medium uppercase"
        >
          Shop
        </Link>
        <span className="text-black font-medium uppercase text-lg">
          {category}
        </span>
      </span>
      <div className="w-full flex items-center justify-center mt-10">
        {items.length === 0 ? (
          <p>No items found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-300 p-2">
                <div className="w-full">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-[150px] sm:h-[250px] bg-gray-50 object-contain aspect-square mb-4"
                  />
                </div>
                <div className="px-1 sm:px-3 w-full">
                  <h2 className="font-normal uppercase text-sm sm:text-xl md:text-2xl mb-2 max-md:mb-0">
                    {item.name}
                  </h2>
                  <p className="text-base sm:text-xl font-medium text-black">
                    ₦{item.price.toLocaleString("en-NG")}
                  </p>
                </div>
                <Link
                  to={`/product/${item.id}`}
                  className="w-full py-2 mt-4 max-md:mt-3 cursor-pointer bg-black text-white font-normal text-center block text-sm sm:text-base"
                >
                  View Product
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
