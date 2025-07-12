"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function TiendanubeCallbackWithSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [envVars, setEnvVars] = useState<{TIENDANUBE_ACCESS_TOKEN: string, TIENDANUBE_USER_ID: string} | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      fetch(`/api/tiendanube/callback?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token && data.user_id) {
            // Guardar solo el user_id en localStorage para referencia
            localStorage.setItem("tiendanube_user_id", data.user_id);
            setEnvVars(data.env_variables);
            setStatus("success");
            setTimeout(() => router.push("/"), 1200);
          } else {
            setStatus("error");
            setErrorMsg(data.error || "No se pudo obtener el token de acceso.");
          }
        })
        .catch(() => {
          setStatus("error");
          setErrorMsg("Error de red o del servidor.");
        });
    } else {
      setStatus("error");
      setErrorMsg("No se recibió el código de autorización.");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Conectando con Tiendanube</h2>
        <Separator className="mb-4" />
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Autorizando tu cuenta, por favor espera...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="rounded-full h-10 w-10 bg-green-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-green-700 font-semibold mb-4">¡Autorización exitosa!</p>
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
              <p className="font-semibold mb-2">⚠️ Importante:</p>
              <p>Agrega las siguientes variables a tu archivo .env:</p>
              <code className="block mt-2 p-2 bg-blue-100 rounded text-xs">
                {envVars ? (
                  <>
                    TIENDANUBE_ACCESS_TOKEN={envVars.TIENDANUBE_ACCESS_TOKEN}<br/>
                    TIENDANUBE_USER_ID={envVars.TIENDANUBE_USER_ID}
                  </>
                ) : (
                  <>
                    TIENDANUBE_ACCESS_TOKEN=tu_access_token_aqui<br/>
                    TIENDANUBE_USER_ID=tu_user_id_aqui
                  </>
                )}
              </code>
            </div>
            <p className="text-sm text-muted-foreground">Redirigiendo al dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="rounded-full h-10 w-10 bg-red-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">✗</span>
            </div>
            <p className="text-red-700 font-semibold mb-2">Ocurrió un error</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </>
        )}
      </Card>
    </div>
  );
}

export default function TiendanubeCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TiendanubeCallbackWithSearchParams />
    </Suspense>
  );
}
