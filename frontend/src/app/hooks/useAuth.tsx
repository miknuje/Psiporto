import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  _id: string;
  Nome: string;
  Email: string;
  Cargo: string;
}

// Mapeamento de cargos por nível de acesso (para controle futuro)
const accessLevels = {
  "TORVC": ["TORVC", "Administrativo", "Coordenador"], // Exemplo de acesso total
  "Formador": ["Formador", "Administrativo", "Coordenador", "TORVC"], // Apenas Formadores e Administrativo
  "Administrativo": ["Administrativo", "Coordenador"], // Apenas Administrativo
  "Coordenador": ["Coordenador"], // Apenas Coordenadores
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return router.push("/login");
        }

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setUser(response.data);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Função para verificar permissões
  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.Cargo);
  };

  return { user, loading, hasPermission };
}
