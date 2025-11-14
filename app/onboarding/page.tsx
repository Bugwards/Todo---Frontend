"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const slides = [
    {
    id: 1,
    img: "/checkmark.png",
    text: <>
            <span className="font-bold italic text-2xl">Do It</span>
            <br />
            Your ultimate task management app to boost productivity.
          </>,
  },
  {
    id: 2,
    img: "/todo1.png",
    text: <>
            <span className="font-bold italic text-2xl">Plan your tasks To-Do</span>
            <br />
            Stay organized and never skip anything important
          </>
  },
  {
    id: 3,
    img: "/todo2.png",
    text:<>
            <span className="font-bold italic text-2xl">Weekly Planner</span>
            <br />
            Plan your week effectively and achieve your goals with ease
        </> 
  },
  {
    id: 4,
    img: "/todo3.png",
    text: <>
            <span className="font-bold italic text-2xl">Collaborate with your team</span>
            <br />
            Create team tasks, invite people, and manage your work together easily
          </>
  },
  {
    id: 5,
    img: "/todo4.png",
    text:<>
            <span className="font-bold italic text-2xl">Secure & Reliable</span>
            <br />
            Your data is safe with us <br />We prioritize your privacy and security
          </>
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("seenOnboarding");
    if (seen) router.push("/");
  }, [router]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("seenOnboarding", "true");
      router.push("/");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("seenOnboarding", "true");
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl text-gray-400 dark:text-white transition-colors duration-300">
      {/* HEADER */}
      <div className="w-full flex justify-end">
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            Skip
          </button>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center justify-center flex-1 text-center space-y-8">
        <Image
          src={slides[currentSlide].img}
          alt="Onboarding illustration"
          width={160}
          height={160}
          className="drop-shadow-lg"
        />
        <p className="text-lg sm:text-xl max-w-xs">{slides[currentSlide].text}</p>
      </div>

      {/* PROGRESS + BUTTON */}
      <div className="flex flex-col items-center mb-10 space-y-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide
                  ? "bg-blue-600 dark:bg-blue-400 scale-110"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
            ></div>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="bg-blue-600 text-white dark:bg-blue-500 dark:text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next →"}
        </button>
      </div>
    </div>
  );
}
