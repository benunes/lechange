"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Heart,
  Calendar,
  Package,
  User,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  images: string[];
  condition: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  category: {
    name: string;
    icon: string;
    color: string;
  };
  favorites: Array<{ userId: string }>;
  reports: Array<{
    id: string;
    type: string;
  }>;
  _count: {
    favorites: number;
    reports: number;
  };
}

interface ListingsManagementProps {
  listings: Listing[];
  stats: any[];
}

export function ListingsManagement({ listings, stats }: ListingsManagementProps) {
  const [filteredListings, setFilteredListings] = useState(listings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Filtrer les annonces
  const filterListings = () => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.createdBy.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => {
        switch (statusFilter) {
          case "reported":
            return listing._count.reports > 0;
          case "popular":
            return listing._count.favorites > 5;
          case "recent":
            return new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((listing) => listing.category.name === categoryFilter);
    }

    setFilteredListings(filtered);
  };

  // Supprimer une annonce
  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (response.ok) {
        toast.success("Annonce supprimée avec succès");
        setFilteredListings(filteredListings.filter((l) => l.id !== listingId));
        setIsDeleteDialogOpen(false);
        setDeleteReason("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'annonce");
    }
  };

  // Suspendre/Réactiver une annonce
  const handleToggleListingStatus = async (listingId: string, action: "suspend" | "activate") => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Annonce ${action === "suspend" ? "suspendue" : "réactivée"} avec succès`);
        // Rafraîchir la liste
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalées</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter((l) => l._count.reports > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Populaires</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter((l) => l._count.favorites > 5).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                listings.filter(
                  (l) => new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Titre, description, auteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="reported">Signalées</SelectItem>
                  <SelectItem value="popular">Populaires</SelectItem>
                  <SelectItem value="recent">Récentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {Array.from(new Set(listings.map((l) => l.category.name))).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={filterListings} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des annonces */}
      <Card>
        <CardHeader>
          <CardTitle>Annonces ({filteredListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Annonce</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statistiques</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {listing.images[0] && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {listing.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={listing.createdBy.image || ""} />
                        <AvatarFallback>
                          {listing.createdBy.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{listing.createdBy.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {listing.createdBy.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: `${listing.category.color}20` }}
                    >
                      {listing.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {listing.price ? `${listing.price}€` : "Gratuit"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Heart className="h-3 w-3 mr-1" />
                        {listing._count.favorites}
                      </Badge>
                      {listing._count.reports > 0 && (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          {listing._count.reports}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(listing.createdAt), "dd/MM/yyyy", { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/listings/${listing.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleListingStatus(listing.id, "suspend")}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="reason">Raison de la suppression</Label>
                            <Textarea
                              id="reason"
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="Expliquez pourquoi vous supprimez cette annonce..."
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteListing(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de l'annonce</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations générales</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Titre :</span> {selectedListing.title}
                    </div>
                    <div>
                      <span className="font-medium">Prix :</span>{" "}
                      {selectedListing.price ? `${selectedListing.price}€` : "Gratuit"}
                    </div>
                    <div>
                      <span className="font-medium">État :</span> {selectedListing.condition || "Non spécifié"}
                    </div>
                    <div>
                      <span className="font-medium">Localisation :</span>{" "}
                      {selectedListing.location || "Non spécifiée"}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Statistiques</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Favoris :</span> {selectedListing._count.favorites}
                    </div>
                    <div>
                      <span className="font-medium">Signalements :</span> {selectedListing._count.reports}
                    </div>
                    <div>
                      <span className="font-medium">Créée le :</span>{" "}
                      {format(new Date(selectedListing.createdAt), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm">{selectedListing.description}</p>
              </div>
              {selectedListing.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedListing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
