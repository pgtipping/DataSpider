"use client";

import "../app/globals.css";
import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const AmazonProductExtraction = () => {
  const [productUrl, setProductUrl] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProductData = async (url) => {
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
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const url = event.target.elements.url.value.trim();

    if (!url) {
      setError("Please enter a valid Amazon product URL");
      return;
    }

    if (!url.includes("amazon.com")) {
      setError("Please enter a valid Amazon.com URL");
      return;
    }

    fetchProductData(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
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

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 rounded-md flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-50 rounded-md flex items-start"
            >
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </motion.div>
          )}

          {productData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Product Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Title</h3>
                    <p className="mt-1 text-gray-600">{productData.title}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Price</h3>
                    <p className="mt-1 text-gray-600">{productData.price}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Rating
                    </h3>
                    <p className="mt-1 text-gray-600">
                      {productData.rating} ({productData.reviewCount})
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Brand</h3>
                    <p className="mt-1 text-gray-600">{productData.brand}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Availability
                    </h3>
                    <p className="mt-1 text-gray-600">
                      {productData.availability}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Description
                    </h3>
                    <p className="mt-1 text-gray-600">
                      {productData.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Features
                    </h3>
                    <ul className="mt-1 list-disc list-inside text-gray-600">
                      {productData.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {productData.images && productData.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Images
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {productData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="rounded-md object-cover w-full h-32"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmazonProductExtraction;
