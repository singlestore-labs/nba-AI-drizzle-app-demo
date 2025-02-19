import { Button } from "@/components/lib/button";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";

type NavbarProps = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

export function Navbar({ isDarkMode, toggleDarkMode }: NavbarProps) {
  return (
    <header
      className={`${
        isDarkMode ? "bg-gray-800" : "bg-nba-white"
      } shadow-md fixed top-0 w-full z-50`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-nba-blue to-nba-red dark:from-nba-red dark:to-nba-white bg-clip-text text-transparent"
        >
          NBA OnTheFly
        </Link>
        <h5
          className="
        text-nba-blue
        dark:text-singlestore-light-purple"
        >
          Presented by{" "}
          <Link
            href="https://portal.singlestore.com/
          "
            target="_blank"
            className="font-semibold  text-nba-blue
            dark:text-singlestore-light-purple"
          >
            SingleStore
          </Link>
        </h5>
        <nav
          className="flex items-center
        gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className={`${
              isDarkMode
                ? "bg-gray-700 text-gray-100"
                : "bg-nba-blue text-nba-white"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
