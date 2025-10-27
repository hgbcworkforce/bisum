import { useState, useEffect } from "react";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Tech Lead at Microsoft",
      testimonial:
        "BISUM Conference 2024 was absolutely transformative. The insights I gained have revolutionized how we approach innovation in our team.",

    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      role: "Research Director",
      testimonial:
        "The networking opportunities were unparalleled. I connected with industry leaders who became valuable collaborators for our research projects.",

    },
    {
      id: 3,
      name: "Amanda Rodriguez",
      role: "Startup Founder",
      testimonial:
        "The keynote speeches were inspiring and the workshops provided actionable strategies that I immediately implemented in my startup.",

    },
    {
      id: 4,
      name: "David Lee",
      role: "Software Engineer at Google",
      testimonial:
        "A fantastic event! The quality of the sessions and the expertise of the speakers were top-notch. I'll definitely be back next year.",
    },
    {
      id: 5,
      name: "Emily White",
      role: "UX Designer",
      testimonial:
        "I loved the focus on user-centric design. The workshops were practical, and I left with a notebook full of new ideas and techniques.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(timer); // Cleanup the timer on component unmount
  }, [testimonials.length]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Attendees Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from past attendees about their transformative experiences at
            BISUM Conference
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(-${
                  currentTestimonial * 100
                }% / var(--slides-to-show)))`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                  style={{ "--slides-to-show": "1" }}
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col">
                    <div className="flex-1 text-center">
                      <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                        "{testimonial.testimonial}"
                      </blockquote>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-blue-600 font-medium">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
