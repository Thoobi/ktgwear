import { useEffect, useState } from "react";
import { getFeaturedCollections } from "../../lib/featuredCollections";
import type { FeaturedCollection } from "../../types/featured";
import { Link } from "react-router-dom";

export default function Featured() {
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getFeaturedCollections();

      if (fetchError) {
        setError("Failed to load featured collections");
        console.error(fetchError);
      } else {
        setCollections(data || []);
      }

      setLoading(false);
    };

    void fetchCollections();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 font-clash">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-80 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 font-clash">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="py-16 px-4 font-clash">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">Featured Collections</h2>
          <p className="text-gray-500">
            No featured collections available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 font-clash">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl max-md:text-3xl font-medium text-start mb-12 max-md:mb-5">
          Featured Collections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img
                  src={collection.image_url}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-medium">{collection.title}</h3>
                  {collection.description && (
                    <p className="text-sm text-gray-200 mb-3">
                      {collection.description}
                    </p>
                  )}
                  {collection.category && (
                    <Link
                      to={
                        collection.category.toLowerCase() === "all"
                          ? "/shop/"
                          : `/shop/${collection.category.toLowerCase()}`
                      }
                      className="inline-block bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Shop {collection.category}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
