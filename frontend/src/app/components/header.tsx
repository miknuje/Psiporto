"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Função para extrair o primeiro e o último nome
  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.split(" ");
    if (names.length === 1) return names[0]; // Caso só tenha um nome
    return `${names[0]} ${names[names.length - 1]}`; // Primeiro e último nome
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      setUserName(JSON.parse(user).Nome);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (isMenuOpen && !e.target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => {
    return pathname === path
      ? "text-orange-500 font-medium"
      : "text-gray-600 hover:text-orange-500";
  };

  const toggleDropdown = (name: any) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const navItems = [
    { name: "Áreas", path: "/areas" },
    { name: "Serviços", path: "#servicos" },
    { name: "Candidatos", path: "/candidatos" },
    { name: "Sumários", path: "#sumarios" },
    { name: "Sessões", path: "#sessoes" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-500 font-poppins">
              <Image
                src="/images/logo.png"
                alt="PsiPorto Logo"
                width={150}
                height={50}
                className="object-contain"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`${isActive(item.path)} transition-colors duration-200 text-base py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all hover:after:w-full`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/test"
              className={`${isActive("/test")} transition-colors duration-200 flex items-center text-base py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all hover:after:w-full`}
            >
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full mr-2">Novo</span>
              Componentes
            </Link>
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {!isLoggedIn ? (
              <Button
                variant="outline"
                className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-4 py-2 text-sm"
                onClick={() => router.push("/login")}
              >
                Entrar
              </Button>
            ) : (
              <>
                <span className="text-gray-600">Bem-vindo, {getFirstAndLastName(userName)}</span>
                <Button
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-4 py-2 text-sm"
                  onClick={handleChangePassword}
                >
                  Mudar Password
                </Button>
                <Button
                  className="bg-orange-300 hover:bg-orange-500 text-white px-4 py-2 text-sm"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center lg:hidden space-x-3">
            <Link href="/test">
              <Button size="sm" variant="secondary" className="bg-orange-300 text-white hover:bg-orange-500 mr-2">
                Componentes
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="h-10 w-10 rounded-full"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t mobile-menu-container">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-gray-600 hover:text-orange-300 transition-colors py-2 border-b border-gray-100 flex justify-between items-center"
                  onClick={toggleMenu}
                >
                  {item.name}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-3">
                {!isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="bg-orange-300 border-orange-300 text-white hover:bg-yellow-200 w-full text-sm py-2"
                    onClick={() => router.push("/login")}
                  >
                    Entrar
                  </Button>
                ) : (
                  <>
                    <span className="text-gray-600 text-center">Bem-vindo, {getFirstAndLastName(userName)}</span>
                    <Button
                      variant="outline"
                      className="bg-orange-300 border-orange-300 text-white hover:bg-yellow-200 w-full text-sm py-2"
                      onClick={handleChangePassword}
                    >
                      Mudar Password
                    </Button>
                    <Button
                      className="bg-orange-300 hover:bg-orange-500 text-white w-full text-sm py-2"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}