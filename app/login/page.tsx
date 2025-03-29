import { getSession } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import LoginForm from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  // Vérifier si l'utilisateur est déjà connecté
  const session = await getSession()

  if (session) {
    redirect(searchParams.redirect || "/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
            K
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kambily Admin</h1>
          <p className="mt-2 text-muted-foreground">Connectez-vous à votre compte administrateur</p>
        </div>

        <LoginForm redirectUrl={searchParams.redirect} />
      </div>
    </div>
  )
}

