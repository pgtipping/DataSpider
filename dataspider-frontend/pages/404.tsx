import React from "react";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | DataSpider</title>
        <meta
          name="description"
          content="The page you're looking for could not be found."
        />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved. Try
            checking the URL or navigate back to home.
          </p>
          <div className="space-x-4">
            <Link
              href="/"
              className={buttonVariants({
                variant: "default",
                size: "lg",
              })}
            >
              Back to Home
            </Link>
            <Link
              href="/examples"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
            >
              View Examples
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
