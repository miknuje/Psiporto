"use client";

import React, { useState, useEffect } from "react"; // Adicionei o useEffect
import axios from "axios";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicialmente true para exibir o loading

  // Simula o carregamento inicial da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Desativa o loading após 2 segundos (simulação)
    }, 2000);

    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Simula uma requisição para recuperar a senha
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("Um e-mail com instruções foi enviado para o seu endereço.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao enviar o e-mail. Verifique o endereço fornecido.");
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
          <h1 className="text-3xl font-bold text-orange-500">Esqueceu a Senha?</h1>
          <p className="text-gray-600 mt-2">
            Digite seu e-mail para receber instruções de recuperação.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-300 hover:bg-orange-500 text-white py-3 px-4 h-auto rounded-lg font-medium transition duration-200"
          >
            {isLoading ? "Enviando..." : "Enviar Instruções"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-orange-500 hover:text-orange-700">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;