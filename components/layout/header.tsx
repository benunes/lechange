"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import {
  HelpCircle,
  LogOut,
  MessageSquare,
  PlusCircle,
  Settings,
  Sparkles,
  UserCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { NotificationsBadge } from "../notifications/notifications-badge";
import { useUserRole } from "@/lib/hooks/use-user-role";

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const { isAdmin } = useUserRole();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="w-full flex h-20 items-center justify-between px-6 sm:px-8 md:px-12 lg:px-16 ">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 rounded-full">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  LéChange
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  Échange & Partage
                </span>
              </div>
            </Link>
          </motion.div>

          <nav className="flex items-center gap-2">
            {/* Navigation principale */}
            <div className="hidden md:flex items-center gap-1 mr-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="relative group hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-300"
                    >
                      <Link href="/forum" className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Forum</span>
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Questions & Réponses</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="relative group hover:bg-orange-500/10 hover:text-orange-600 transition-all duration-300"
                    >
                      <Link
                        href="/listings"
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Annonces</span>
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-100"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toutes les annonces</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <ThemeToggle />
            </motion.div>

            {isPending ? (
              <motion.div
                className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            ) : session ? (
              <div className="flex items-center gap-1">
                {/* Badge de notifications */}
                <NotificationsBadge />

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300"
                      >
                        <Link href="/messages">
                          <MessageSquare className="h-5 w-5" />
                          <motion.div
                            className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mes Messages</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="hover:bg-green-500/10 hover:text-green-600 transition-all duration-300"
                      >
                        <Link href="/listings/new">
                          <PlusCircle className="h-5 w-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Créer une annonce</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-300"
                      >
                        <Link href={`/profile/${session.user.id}`}>
                          <UserCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mon Profil</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-500/10 hover:text-red-600 transition-all duration-300"
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Déconnexion</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                {/* Admin Settings Button - visible only to admin users */}
                {isAdmin && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="hover:bg-yellow-500/10 hover:text-yellow-600 transition-all duration-300"
                        >
                          <Link href="/admin">
                            <Settings className="h-5 w-5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Paramètres Admin</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="hover:bg-purple-500/10 hover:text-purple-600"
                  >
                    <Link href="/login">Se connecter</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/register">S'inscrire</Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </nav>
        </div>
      </motion.header>
    </TooltipProvider>
  );
}
