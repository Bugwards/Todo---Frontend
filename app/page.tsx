"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem("seenOnboarding");
    if (!seen) {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <div className="font-sans flex flex-col items-center justify-between min-h-screen p-8 sm:p-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-xl text-gray-900 dark:text-white">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center max-w-4xl">
        <div className="flex items-center gap-2">
          <Image src="/to-do-logo.png" alt="ToDo App Logo" width={70} height={50} />
          <h1 className="text-xl font-bold tracking-tight text-white">TaskMate</h1>
        </div>
        <Link
          href="/sign-in"
          className="rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-3 text-m font-medium hover:opacity-80 transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col items-center text-center gap-6 mt-20 bg-gray-900 dark:bg-gray-800 p-20 rounded-lg shadow-lg max-w-3xl">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="text-white">Welcome to{" "}</span>
          <span className="text-blue-600 dark:text-blue-400">TaskMate</span>
        </h2>
        <p className=" text-gray-300 dark:text-gray-300 max-w-md">
          Organize your day <br /> Crush your goals <br /> Stay productive <br /> <span className="font-bold text-xl">All in one place</span>
        </p>

        <div className="flex gap-4 mt-6">
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white rounded-full px-6 py-3 text-base font-medium hover:bg-blue-700 transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="text-white border border-gray-400 dark:border-gray-600 rounded-full px-6 py-3 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black transition-all"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} TaskMate. All rights reserved.
      </footer>
    </div>
  );
}
