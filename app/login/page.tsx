import {LoginForm} from "@/components/auth/login-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowRight, LogIn, Sparkles} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen py-8 flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-4 py-2 mb-4">
                        <LogIn className="h-4 w-4 text-purple-500"/>
                        <span
                            className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Retour sur LeChange
            </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Connexion
            </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Content de te revoir ! Connecte-toi pour accéder à ton compte
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <div
                            className="h-16 w-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-purple-500"/>
                        </div>
                        <CardTitle className="text-xl">Se connecter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LoginForm/>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Tu n'as pas encore de compte ?
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all"
                            >
                                Créer un compte
                                <ArrowRight className="h-3 w-3"/>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-muted-foreground">
                        En te connectant, tu rejoins une communauté de jeunes passionnés ! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
}
