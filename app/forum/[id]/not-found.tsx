import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, MessageSquare, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function QuestionNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Question introuvable
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Cette question n'existe pas ou a été supprimée par son auteur ou un
            modérateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Link href="/forum" className="w-full">
              <Button className="w-full" variant="default">
                <Search className="mr-2 h-4 w-4" />
                Parcourir le forum
              </Button>
            </Link>

            <Link href="/forum/new" className="w-full">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Poser une question
              </Button>
            </Link>

            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
