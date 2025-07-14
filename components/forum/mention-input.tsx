"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { filterUsers, MentionUser } from "@/lib/utils/mentions";
import { User, AtSign } from "lucide-react";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  users: MentionUser[];
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  users,
  className,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [isTypingMention, setIsTypingMention] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Détecter les mentions et afficher les suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    onChange(newValue);

    // Chercher une mention en cours - regex simplifiée (max 2 mots)
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(
      /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)$/,
    );

    if (mentionMatch) {
      const query = mentionMatch[1].trim();
      const start = cursorPosition - mentionMatch[0].length;

      setMentionStart(start);
      setIsTypingMention(true);

      if (query.length === 0) {
        // Afficher tous les utilisateurs si pas de query
        setSuggestions(users.slice(0, 8));
      } else {
        setSuggestions(filterUsers(users, query).slice(0, 8));
      }

      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsTypingMention(false);
    }
  };

  // Gérer les touches de navigation avec amélioration
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
      case "Tab":
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setIsTypingMention(false);
        break;
    }
  };

  // Insérer une mention sélectionnée avec amélioration
  const insertMention = (user: MentionUser) => {
    if (mentionStart === -1) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeMention = value.substring(0, mentionStart);
    const textAfterCursor = value.substring(cursorPosition);

    const newValue = textBeforeMention + `@${user.name} ` + textAfterCursor;
    onChange(newValue);

    setShowSuggestions(false);
    setIsTypingMention(false);

    // Replacer le curseur après la mention
    setTimeout(() => {
      const newCursorPosition = mentionStart + user.name.length + 2;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  // Scroll automatique dans les suggestions
  useEffect(() => {
    if (suggestionsRef.current && selectedIndex >= 0) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className} transition-all duration-200 ${
            isTypingMention
              ? "ring-2 ring-purple-500/20 border-purple-300 dark:border-purple-600"
              : ""
          }`}
        />

        {/* Indicateur de mention active */}
        {isTypingMention && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-purple-500 animate-pulse">
            <AtSign className="h-4 w-4" />
            <span className="text-xs font-medium">Mention</span>
          </div>
        )}
      </div>

      {/* Panel de suggestions amélioré */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 mt-2 w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200">
          <CardContent className="p-0">
            {/* En-tête de la dropdown */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-200/30 dark:border-purple-700/30 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-foreground">
                  Mentionner
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {suggestions.length} utilisateur
                {suggestions.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Liste des suggestions sans scrollbar visible */}
            <div
              className="max-h-80 overflow-y-auto p-2 space-y-1"
              ref={suggestionsRef}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {suggestions.map((user, index) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className={`w-full justify-start p-4 h-auto transition-all duration-200 rounded-lg ${
                    index === selectedIndex
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 scale-[1.02] shadow-lg border border-purple-200/50 dark:border-purple-700/50"
                      : "hover:bg-purple-50/80 dark:hover:bg-purple-900/20 hover:scale-[1.01]"
                  }`}
                  onClick={() => insertMention(user)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Avatar amélioré avec meilleur fallback */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-200/50 dark:ring-purple-700/50 shadow-sm">
                        {user.image ? (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || "User"}
                            className="object-cover"
                            onError={(e) => {
                              console.log(
                                "Avatar failed to load for:",
                                user.name,
                              );
                              // Cacher l'image cassée
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 font-semibold text-sm flex items-center justify-center">
                          {user.name ? (
                            user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      {/* Indicateur de sélection */}
                      {index === selectedIndex && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                          <AtSign className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Informations utilisateur */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {user.name || "Utilisateur anonyme"}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>
                          @
                          {(user.name || "user")
                            .toLowerCase()
                            .replace(/\s+/g, "")}
                        </span>
                        <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                        <span>Utilisateur</span>
                      </div>
                    </div>

                    {/* Badge de mention pour l'élément sélectionné */}
                    {index === selectedIndex && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium shadow-sm">
                          ↵ Sélectionner
                        </div>
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Pied de la dropdown avec instructions */}
            <div className="px-4 py-3 border-t border-purple-200/30 dark:border-purple-700/30 bg-gradient-to-r from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    ↑↓
                  </kbd>
                  <span>Naviguer</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    ↵
                  </kbd>
                  <span>Sélectionner</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    ⎋
                  </kbd>
                  <span>Fermer</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
