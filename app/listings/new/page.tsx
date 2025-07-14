import {NewListingForm} from "@/components/listings/new-listing-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft, PlusCircle, Sparkles} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default async function NewListingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen py-8">
            {/* Header Section */}
            <div
                className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <div
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/20 rounded-full px-4 py-2 mb-4">
                            <PlusCircle className="h-4 w-4 text-green-500"/>
                            <span
                                className="text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Nouvelle annonce
              </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Créer une{" "}
                            <span
                                className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                annonce
              </span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Partage tes objets avec la communauté ! Que tu vendes ou donnes,
                            chaque annonce compte.
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/20"
                    >
                        <Link href="/listings" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4"/>
                            Retour aux annonces
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center pb-6">
                    <div
                        className="h-16 w-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-green-500"/>
                    </div>
                    <CardTitle className="text-2xl">Détails de ton annonce</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Remplis les informations pour que ton annonce soit attractive
                    </p>
                </CardHeader>
                <CardContent>
                    <NewListingForm/>
                </CardContent>
            </Card>
        </div>
    );
}
