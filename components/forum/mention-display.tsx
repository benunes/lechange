"use client";

import { MentionUser } from "@/lib/utils/mentions";
import Link from "next/link";

interface MentionDisplayProps {
  content: string;
  users: MentionUser[];
  className?: string;
}

export function MentionDisplay({
  content,
  users,
  className = "",
}: MentionDisplayProps) {
  // Fonction pour transformer le texte avec mentions en JSX
  const renderContentWithMentions = (text: string) => {
    // Regex simplifiée qui capture maximum 2 mots (prénom + nom)
    const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Trouver l'utilisateur mentionné (nettoyer les espaces en fin)
      const username = match[1].trim();
      const user = users.find(
        (u) => u.name.toLowerCase() === username.toLowerCase(),
      );

      if (user) {
        // Créer un lien stylisé pour la mention
        parts.push(
          <Link
            key={`mention-${match.index}-${user.id}`}
            href={`/profile/${user.id}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 transition-all duration-200 no-underline hover:scale-105 hover:shadow-sm"
            style={{
              verticalAlign: "middle",
              lineHeight: "1.2",
              display: "inline-flex",
            }}
          >
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
            <span>@{user.name}</span>
          </Link>,
        );
      } else {
        // Si l'utilisateur n'est pas trouvé, afficher la mention sans lien
        parts.push(
          <span
            key={`mention-unknown-${match.index}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm"
            style={{ verticalAlign: "middle" }}
          >
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
            <span>@{username}</span>
          </span>,
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Ajouter le texte restant
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`mention-content ${className}`}>
      {renderContentWithMentions(content).map((part, index) => (
        <span key={index} className="align-baseline">
          {part}
        </span>
      ))}
    </div>
  );
}

// Version simplifiée pour les prévisualisations
export function SimpleMentionDisplay({ content }: { content: string }) {
  const mentionRegex = /@([^@\n\r\t,;.!?()[\]{}]+?)(?=\s|$|[,;.!?()[\]{}])/g;

  return (
    <span className="whitespace-pre-wrap">
      {content.split(mentionRegex).map((part, index) => {
        // Si l'index est impair, c'est un nom d'utilisateur mentionné
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
              style={{ verticalAlign: "baseline" }}
            >
              <span className="w-1 h-1 bg-purple-500 rounded-full flex-shrink-0"></span>
              <span className="leading-none">@{part.trim()}</span>
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}
