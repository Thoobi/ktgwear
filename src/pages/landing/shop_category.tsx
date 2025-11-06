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
    <div className="px-6 pt-10 pb-40 font-clash">
      <span className="w-full flex flex-col justify-center items-center">
        <Link to={"/shop"} className="text-4xl font-medium uppercase">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-300 p-2">
                <div className="w-full">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-[260px] h-[250px] bg-gray-50 object-contain aspect-square mb-4"
                  />
                </div>
                <div className="px-3 w-full">
                  <h2 className="font-medium uppercase text-2xl">
                    {item.name}
                  </h2>
                  <span className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-lg font-medium">{`₦${item.price.toLocaleString(
                      "en-NG"
                    )}`}</p>
                  </span>
                </div>
                <Link
                  to={`/product/${item.id}`}
                  className="w-full py-2 mt-4 cursor-pointer bg-black text-white font-normal text-center block"
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
