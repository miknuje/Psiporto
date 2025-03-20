import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import React from "react";

interface WithAuthProps {
  allowedRoles: string[];
}

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>, allowedRoles: string[]) {
  return function ProtectedComponent(props: T) {
    const { user, loading, hasPermission } = useAuth();
    const router = useRouter();

    if (loading) {
      return <div className="flex justify-center items-center min-h-screen"><p>Verificando acesso...</p></div>;
    }

    if (!user || !hasPermission(allowedRoles)) {
      router.push("/login"); // Redireciona se não tiver permissão
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
