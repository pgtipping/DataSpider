import { NextPage } from "next";
import Head from "next/head";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About DataSpider - Our Story and Mission</title>
        <meta
          name="description"
          content="Learn about DataSpider's mission, story, technology, and team behind our advanced web crawling solutions."
        />
      </Head>
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            About DataSpider
          </h1>
          <div className="space-y-12">
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                At DataSpider, our mission is to empower businesses with
                cutting-edge web crawling and data extraction solutions. We
                believe that access to accurate, timely, and structured data is
                crucial for making informed decisions in today's fast-paced
                digital landscape.
              </p>
            </section>
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground">
                Founded in 2015 by a team of data scientists and web developers,
                DataSpider was born out of the need for a more efficient and
                reliable web crawling service. What started as a small project
                to solve our own data collection challenges quickly grew into a
                comprehensive platform serving businesses across various
                industries.
              </p>
            </section>
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Our Technology</h2>
              <p className="text-muted-foreground">
                DataSpider leverages advanced algorithms and machine learning
                techniques to provide intelligent, adaptive web crawling
                solutions. Our infrastructure is designed to handle millions of
                requests while respecting website terms of service and
                maintaining high data quality standards.
              </p>
            </section>
            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Our Team</h2>
              <p className="text-muted-foreground">
                We are a diverse team of passionate individuals, including data
                engineers, software developers, machine learning experts, and
                customer success professionals. United by our commitment to
                innovation and customer satisfaction, we work tirelessly to
                deliver the best web crawling experience for our clients.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
