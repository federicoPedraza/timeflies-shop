"use client";

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Conectando con TiendaNube</h2>
        <p className="text-muted-foreground">Verificando autenticación...</p>
      </div>
    </div>
  );
}
