import { Badge } from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  electValue,
} from "@/components/ui/select";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight, Grid3X3, Heart, List, Plus, Search, SlidersHorizontal, Sparkles} from "lucide-react";

async function getListings() {
    const listings = await prisma.listing.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    return listings;
}

async function getCategories() {
    const listings = await prisma.listing.findMany({
        select: {category: true},
        distinct: ['category'],
    });
    return listings.map(l => l.category).filter(Boolean);
}

export default async function ListingsPage() {
    const [listings, categories] = await Promise.all([
        getListings(),
        getCategories()
    ]);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 py-12 mb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Toutes les <span
                                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">annonces</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Découvre {listings.length} annonces de la communauté
                            </p>
                        </div>

                        <Button
                            asChild
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-4 md:mt-0"
                        >
                            <Link href="/listings/new" className="flex items-center gap-2">
                                <Plus className="h-4 w-4"/>
                                Créer une annonce
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Filters */}
                <div
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Rechercher une annonce..."
                                className="pl-10 bg-background/50 border-purple-200/50 focus:border-purple-400"
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4"/>
                                Filtres
                            </Button>

                            <div className="h-6 w-px bg-border mx-2"/>

                            <Button variant="ghost" size="sm">
                                <Grid3X3 className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="sm">
                                <List className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Badge variant="secondary"
                                   className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 transition-colors">
                                Toutes
                            </Badge>
                            {categories.map((category) => (
                                <Badge
                                    key={category}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                                >
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listings Grid */}
                {listings.length === 0 ? (
                    <div className="text-center py-16">
                        <div
                            className="h-24 w-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-12 w-12 text-purple-500"/>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucune annonce disponible</h3>
                        <p className="text-muted-foreground mb-6">
                            Sois le premier à partager quelque chose avec la communauté !
                        </p>
                        <Button asChild
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            <Link href="/listings/new">
                                Créer une annonce
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                        <CardTitle
                                            className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                                            {listing.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 py-2">
                                    <Badge variant="secondary"
                                           className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {listing.category}
                                    </Badge>
                                    {listing.description && (
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {listing.description}
                                        </p>
                                    )}
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
                                        <Link href={`/listings/${listing.id}`} className="flex items-center gap-1">
                                            Voir
                                            <ArrowRight className="h-3 w-3"/>
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
