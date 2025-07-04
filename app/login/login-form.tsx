"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useLogin } from "@/hooks/api/userAuth"
import { setCookieWithExpiry } from "@/helpers/cookies"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [email, setEmail] = useState("admin@kambily.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { mutate: loginUser, isPending ,} = useLogin()

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  if(isPending) return
loginUser({ email, password },
  {
    onSuccess: (data) => {
      console.log(data)

      setCookieWithExpiry("accessToken", data.access_token);
      setCookieWithExpiry("refreshToken", data.refresh_token);
   
      router.push("/");
    }
  }
)
   
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Entrez vos identifiants pour accéder au tableau de bord</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@kambily.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
                Mot de passe oublié?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isPending}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Se souvenir de moi
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isPending}>
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

