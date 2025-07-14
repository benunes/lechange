import {NewQuestionForm} from "@/components/forum/new-question-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default async function NewQuestionPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login?callbackUrl=/forum/new");
    }

    return (
      <div className="min-h-screen py-8">
        {/* Header Section modernisé */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-3xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-3 py-1 mb-3">
                <HelpCircle className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Forum communautaire
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Pose ta question
                </span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                Partage ta question avec la communauté et obtiens des réponses
                d'experts !
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/20"
            >
              <Link href="/forum" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au forum
              </Link>
            </Button>
          </div>
        </div>

        {/* Form Card simplifié */}
        <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <NewQuestionForm />
          </CardContent>
        </Card>
      </div>
    );
}
