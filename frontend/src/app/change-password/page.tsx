"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/app/components/ui/button"
import { API_CONFIG } from "@/app/config" 

export default function ChangePassword() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Validação básica
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos os campos são obrigatórios.")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.")
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      // Atualizado para usar API_CONFIG
      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.authEndpoint}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccess("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao alterar a senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-orange-500 text-center mb-8">Mudar Senha</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
              Senha Atual
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Digite sua senha atual"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Digite sua nova senha"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-orange-300 p-3 w-full rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Confirme sua nova senha"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-300 hover:bg-orange-500 text-white py-3 px-4 h-auto rounded-lg font-medium transition duration-200"
          >
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </div>
    </div>
  )
}