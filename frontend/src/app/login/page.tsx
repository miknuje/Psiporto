"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { API_CONFIG } from "@/app/config";

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicialmente true para exibir o loading

  // Simula o carregamento inicial da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Desativa o loading após 2 segundos (simulação)
    }, 2000);

    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        Email: credentials.email,
        Password: credentials.password,
      };

      // URL atualizada para usar API_CONFIG
      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.authEndpoint}/login`,
        payload
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/areas");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  // Exibir o loading enquanto a página está carregando ou o formulário está sendo processado
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          {/* Mensagem de carregamento */}
          <p className="text-lg font-semibold text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Login</h1>
          <p className="text-gray-600 mt-2">Entre com suas credenciais para acessar o sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-orange-500 border-orange-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="remember" className="ml-2 text-gray-700">
                Lembrar-me
              </label>
            </div>
            <Link href="login/forgot-password" className="text-orange-500 hover:text-orange-700">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-300 hover:bg-orange-500 text-white py-3 px-4 h-auto rounded-lg font-medium transition duration-200"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;