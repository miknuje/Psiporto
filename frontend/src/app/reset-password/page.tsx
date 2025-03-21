"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

const ResetPasswordPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Captura email e token da URL ao carregar a página
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
  
    console.log("Token recebido:", tokenParam);
    console.log("Email recebido:", emailParam);
  
    if (!emailParam || !tokenParam) {
      setError("Link inválido ou expirado.");
    } else {
      setEmail(emailParam);
      setToken(tokenParam);
    }
  }, [searchParams]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
  
    // Verifica se os valores estão definidos
    if (!email || !token || !newPassword) {
      setError("Erro interno: Dados ausentes.");
      setIsLoading(false);
      return;
    }
  
    // Debugging: Log dos valores antes de enviar
    console.log("Enviando:", { Email: email, resetToken: token, newPassword });
  
    // Verifica se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        Email: email,
        resetToken: token,
        newPassword,
      });
  
      setMessage("Senha redefinida com sucesso. Você será redirecionado para o login.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Erro na requisição:", err.response?.data);
      setError(err.response?.data?.error || "Erro ao redefinir a senha.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Redefinir Senha</h1>
          <p className="text-gray-600 mt-2">Digite sua nova senha abaixo.</p>
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
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Digite sua nova senha"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirme sua Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Confirme sua nova senha"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || !token}
            className="w-full bg-orange-300 hover:bg-orange-500 text-white py-3 px-4 h-auto rounded-lg font-medium transition duration-200"
          >
            {isLoading ? "Redefinindo..." : "Redefinir Senha"}
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

export default ResetPasswordPage;
