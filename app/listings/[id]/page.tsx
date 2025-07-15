import {ContactSellerButton} from "@/components/listings/contact-seller-button";
import { ReportButton } from "@/components/reports/report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {auth} from "@/lib/auth";
import { prisma } from "@/lib/db";
import {headers} from "next/headers";
import Image from "next/image";
import {notFound} from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Euro,
  Heart,
  Share,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";

async function getListing(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: tre,
          },
        },
      },
    });
    return listing;
}

export default async function ListingPage({
  params,
}: {
  parms: Promise<{ id: string }>; // Correction: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params; // Correction: await params
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user.id === listing.createdById;

  return (
    <div className="min-h-screen py-8">
      {/* Header avec breadcrumb */}
      <div className="mb-8">
        <Button
          asChild
          variant="ghost"
          className="mb-6 hover:bg-orange-50 hover:text-orange-600"
        >
          <Link href="/listings" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux annonces
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Section Images */}
        <div className="space-y-4">
          {listing.images.length > 0 ? (
            <>
              <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="relative h-96 w-full">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Galerie pour images supplémentaires */}
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((image, index) => (
                    <Card
                      key={index}
                      className="border-0 overflow-hidden aspect-square"
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={image}
                          alt={`${listing.title} ${index + 2}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {index === 3 && listing.images.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              +{listing.images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-muted-foreground">
                    Aucune image disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section Détails */}
        <div className="space-y-6">
          {/* Titre et Prix */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/20 rounded-full px-4 py-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Annonce
                  </span>
                </div>
                {!isOwner && session && (
                  <ReportButton listingId={listing.id} className="h-8 w-8" />
                )}
              </div>

              <CardTitle className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                {listing.title}
              </CardTitle>

              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  {listing.category.name}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {listing.price ? (
                    <div className="flex items-center gap-2">
                      <Euro className="h-6 w-6 text-green-600" />
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {listing.price} €
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      Prix non spécifié
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Vendeur */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Vendeur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {listing.createdBy.image ? (
                    <Image
                      src={listing.createdBy.image}
                      alt={listing.createdBy.name || "Avatar"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-500" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {listing.createdBy.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Membre actif</p>
                </div>

                <Button variant="outline" size="sm">
                  Voir le profil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {listing.description || "Aucune description fournie."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isOwner && session ? (
            <Card className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Intéressé par cette annonce ?
                  </h3>
                  <p className="text-muted-foreground">
                    Contacte {listing.createdBy.name} pour en savoir plus !
                  </p>
                </div>
                <ContactSellerButton
                  listingId={listing.id}
                  sellerId={listing.createdById}
                />
              </CardContent>
            </Card>
          ) : isOwner ? (
            <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center p-6">
                <h3 className="text-lg font-semibold mb-2">
                  C'est ton annonce !
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tu peux la modifier ou voir les messages reçus
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">Modifier l'annonce</Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Link href="/messages">Voir les messages</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/10 dark:to-red-950/10 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">
                  Connecte-toi pour contacter le vendeur
                </h3>
                <p className="text-muted-foreground mb-4">
                  Rejoins la communauté pour échanger avec{" "}
                  {listing.createdBy.name}
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Link href="/login">Se connecter</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
