"use client";

import React, { useState, FormEvent } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ProductData {
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  brand: string;
  availability: string;
  description: string;
  features: string[];
  images: string[];
}

const AmazonProductExtraction = () => {
  const [productUrl, setProductUrl] = useState("");
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Examples", href: "/examples" },
    {
      label: "Amazon Product Extraction",
      href: "/use-cases/amazon-product-extraction",
      active: true,
    },
  ];

  const fetchProductData = async (url: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setProductData(null);

    try {
      const response = await fetch(
        `/api/amazon-product?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch product data");
      }

      setProductData(data.data);
      setSuccessMessage("Product data extracted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = (event.target as HTMLFormElement).elements.namedItem(
      "url"
    ) as HTMLInputElement;
    const urlValue = url.value.trim();

    if (!urlValue) {
      setError("Please enter a valid Amazon product URL");
      return;
    }

    if (!urlValue.includes("amazon.com")) {
      setError("Please enter a valid Amazon.com URL");
      return;
    }

    fetchProductData(urlValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumb items={breadcrumbItems} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            Amazon Product Extraction
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Extract detailed product information from any Amazon product URL
          </p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amazon Product URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                placeholder="https://www.amazon.com/product..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Extracting...
                </>
              ) : (
                "Extract Product Data"
              )}
            </button>
          </form>

          <div className="mt-8">
            {loading && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">
                  Extracting product data...
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center text-red-500">
                <AlertCircle className="h-6 w-6" />
                <span className="ml-2">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-6 w-6" />
                <span className="ml-2">{successMessage}</span>
              </div>
            )}

            {productData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 space-y-6"
              >
                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Product Title</h2>
                  <p className="text-gray-700">{productData?.title}</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Price</h2>
                  <p className="text-gray-700">{productData.price}</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    Rating & Reviews
                  </h2>
                  <p className="text-gray-700">
                    Rating: {productData.rating} ({productData.reviewCount}{" "}
                    reviews)
                  </p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Brand</h2>
                  <p className="text-gray-700">{productData.brand}</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Availability</h2>
                  <p className="text-gray-700">{productData.availability}</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Description</h2>
                  <p className="text-gray-700">{productData.description}</p>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">Features</h2>
                  <ul className="list-inside list-disc space-y-2">
                    {productData?.features?.map(
                      (feature: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {(productData?.images?.length || 0) > 0 && (
                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                      Product Images
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {productData?.images?.map(
                        (image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="h-auto w-full rounded-lg object-cover"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonProductExtraction;
