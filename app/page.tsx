import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight, Filter, Heart, MessageCircle, Plus, Search, Sparkles, TrendingUp, Users, Zap,} from "lucide-react";

async function getListings() {
  const listings = await prisma.listing.findMany({
    take: 8, // Limiter à 8 pour une mise en page plus propre
    orderBy: {
      createdAt: "desc",
    },
  });
  return listings;
}

async function getStats() {
  const [listingsCount, usersCount] = await Promise.all([
    prisma.listing.count(),
    prisma.user.count(),
  ]);
  return {listingsCount, usersCount};
}

export default async function Home() {
  const [listings, stats] = await Promise.all([getListings(), getStats()]);

  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section
            className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 py-20 mb-16">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-purple-500"/>
                <span
                    className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                La plateforme d'échange nouvelle génération
              </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Échange,
              </span>
                <br/>
                <span
                    className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Partage,
              </span>
                <br/>
                <span className="text-foreground">Connecte-toi !</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Découvre une communauté jeune et dynamique où tu peux vendre, acheter,
                poser tes questions et partager tes connaissances avec d'autres.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/register" className="flex items-center gap-2">
                    <Zap className="h-5 w-5"/>
                    Rejoindre la communauté
                    <ArrowRight className="h-4 w-4"/>
                  </Link>
                </Button>

                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/20 transition-all duration-300"
                >
                  <Link href="/listings" className="flex items-center gap-2">
                    <Search className="h-4 w-4"/>
                    Explorer les annonces
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div
                    className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.listingsCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Annonces</div>
                </div>
                <div
                    className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-pink-600">
                    {stats.usersCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Membres</div>
                </div>
                <div
                    className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Disponible</div>
                </div>
                <div
                    className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-muted-foreground">Gratuit</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 mb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LéChange
              </span>
                ?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Une plateforme pensée pour les jeunes, par les jeunes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div
                  className="group p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div
                    className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Annonces Tendances</h3>
                <p className="text-muted-foreground">
                  Découvre les dernières trouvailles et bonnes affaires de la
                  communauté
                </p>
              </div>

              <div
                  className="group p-6 rounded-3xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 border border-pink-200/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div
                    className="h-12 w-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Forum Actif</h3>
                <p className="text-muted-foreground">
                  Pose tes questions, partage tes connaissances et aide la communauté
                </p>
              </div>

              <div
                  className="group p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div
                    className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Communauté Jeune</h3>
                <p className="text-muted-foreground">
                  Connecte-toi avec d'autres jeunes qui partagent tes centres
                  d'intérêt
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Listings */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Dernières{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  annonces
                </span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Découvre les dernières trouvailles de la communauté
                </p>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4"/>
                  Filtrer
                </Button>
                <Button
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Link href="/listings/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4"/>
                    Créer une annonce
                  </Link>
                </Button>
              </div>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-16">
                  <div
                      className="h-24 w-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-12 w-12 text-purple-500"/>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Aucune annonce pour le moment
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sois le premier à partager quelque chose avec la communauté !
                  </p>
                  <Button
                      asChild
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Link href="/listings/new">
                      Créer la première annonce
                    </Link>
                  </Button>
                </div>
            ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {listings.map((listing) => (
                        <Card
                            key={listing.id}
                            className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <CardHeader className="p-0">
                            {listing.images.length > 0 ? (
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                  <Image
                                      src={listing.images[0]}
                                      alt={listing.title}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute top-3 right-3">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                                    >
                                      <Heart className="h-4 w-4"/>
                                    </Button>
                                  </div>
                                </div>
                            ) : (
                                <div
                                    className="h-48 w-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg flex items-center justify-center">
                                  <Sparkles className="h-12 w-12 text-purple-400"/>
                                </div>
                            )}
                            <div className="p-4 pb-2">
                              <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                                {listing.title}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 py-2">
                            <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              {listing.category}
                            </Badge>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center p-4 pt-2">
                            <p className="font-bold text-lg">
                              {listing.price ? (
                                  <span
                                      className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {listing.price} €
                          </span>
                              ) : (
                                  <span className="text-muted-foreground text-sm">
                            Prix non spécifié
                          </span>
                              )}
                            </p>
                            <Button
                                asChild
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                              <Link
                                  href={`/listings/${listing.id}`}
                                  className="flex items-center gap-1"
                              >
                                Voir
                                <ArrowRight className="h-3 w-3"/>
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/20"
                    >
                      <Link
                          href="/listings"
                          className="flex items-center gap-2"
                      >
                        Voir toutes les annonces
                        <ArrowRight className="h-4 w-4"/>
                      </Link>
                    </Button>
                  </div>
                </>
            )}
          </div>
        </section>
    </div>
  );
}
