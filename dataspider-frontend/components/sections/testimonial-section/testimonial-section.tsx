import { FC } from "react";
import TestimonialCard from "./testimonial-card";

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "DataSpider has revolutionized our data collection process. It's fast, reliable, and incredibly easy to use.",
    author: "Jane Doe",
    company: "Tech Innovators Inc.",
  },
  {
    quote:
      "The scalability of DataSpider is unmatched. We've been able to handle our growing data needs effortlessly.",
    author: "John Smith",
    company: "Data Analytics Co.",
  },
];

const TestimonialSection: FC = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
