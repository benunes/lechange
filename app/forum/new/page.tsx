import {NewQuestionForm} from "@/components/forum/new-question-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft, HelpCircle, MessageCircle} from "lucide-react";
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
            {/* Header Section */}
            <div
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-3xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <div
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-4 py-2 mb-4">
                            <HelpCircle className="h-4 w-4 text-purple-500"/>
                            <span
                                className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nouvelle question
              </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Pose ta{" "}
                            <span
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                question
              </span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            La communauté est là pour t'aider ! Pose ta question et obtiens des
                            réponses de qualité.
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/20"
                    >
                        <Link href="/forum" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4"/>
                            Retour au forum
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center pb-6">
                    <div
                        className="h-16 w-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-purple-500"/>
                    </div>
                    <CardTitle className="text-2xl">Détails de ta question</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Sois précis dans ta question pour obtenir les meilleures réponses
                    </p>
                </CardHeader>
                <CardContent>
                    <NewQuestionForm/>
                </CardContent>
            </Card>
        </div>
    );
}
