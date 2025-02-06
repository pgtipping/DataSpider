import { NextPage } from "next";
import Head from "next/head";
import styles from "./about.module.css";

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
      <div className={styles.aboutPage}>
        <h1 className={styles.pageTitle}>About DataSpider</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Our Mission</h2>
            <p>
              At DataSpider, our mission is to empower businesses with
              cutting-edge web crawling and data extraction solutions. We
              believe that access to accurate, timely, and structured data is
              crucial for making informed decisions in today's fast-paced
              digital landscape.
            </p>
          </section>
          <section className={styles.section}>
            <h2>Our Story</h2>
            <p>
              Founded in 2015 by a team of data scientists and web developers,
              DataSpider was born out of the need for a more efficient and
              reliable web crawling service. What started as a small project to
              solve our own data collection challenges quickly grew into a
              comprehensive platform serving businesses across various
              industries.
            </p>
          </section>
          <section className={styles.section}>
            <h2>Our Technology</h2>
            <p>
              DataSpider leverages advanced algorithms and machine learning
              techniques to provide intelligent, adaptive web crawling
              solutions. Our infrastructure is designed to handle millions of
              requests while respecting website terms of service and maintaining
              high data quality standards.
            </p>
          </section>
          <section className={styles.section}>
            <h2>Our Team</h2>
            <p>
              We are a diverse team of passionate individuals, including data
              engineers, software developers, machine learning experts, and
              customer success professionals. United by our commitment to
              innovation and customer satisfaction, we work tirelessly to
              deliver the best web crawling experience for our clients.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
