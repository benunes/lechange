import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, MessageSquare, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto relative">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500">
              404
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <div className="h-4 w-4 bg-orange-400 rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Page introuvable
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
            Explorons ensemble ce que vous pourriez chercher.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Suggestions rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/listings" className="group">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingBag className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Annonces
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Découvrez les dernières offres et trouvailles
                </p>
              </div>
            </Link>

            <Link href="/forum" className="group">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Forum
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Posez vos questions et trouvez des réponses
                </p>
              </div>
            </Link>
          </div>

          {/* Actions principales */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white border-0 shadow-lg">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>

            <Link href="/listings" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Search className="mr-2 h-4 w-4" />
                Explorer les annonces
              </Button>
            </Link>
          </div>

          {/* Message d'aide */}
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Besoin d'aide ? Contactez-nous via le forum ou créez une nouvelle
              annonce !
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
