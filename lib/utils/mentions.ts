export interface MentionUser {
  id: string;
  name: string;
  image?: string;
}

export interface MentionMatch {
  start: number;
  end: number;
  username: string;
  userId?: string;
}

// Fonction pour extraire les mentions d'un texte
export function extractMentions(text: string): MentionMatch[] {
  // Regex simple qui capture maximum 2 mots après @
  const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g;
  const mentions: MentionMatch[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      start: match.index,
      end: match.index + match[0].length,
      username: match[1].trim(),
    });
  }

  return mentions;
}

// Fonction pour remplacer les mentions par des liens ou des composants stylisés
export function replaceMentionsWithLinks(
  text: string,
  users: MentionUser[],
): string {
  const mentions = extractMentions(text);
  let result = text;

  // Traiter les mentions en ordre inverse pour ne pas décaler les indices
  for (let i = mentions.length - 1; i >= 0; i--) {
    const mention = mentions[i];
    const user = users.find(
      (u) => u.name.toLowerCase() === mention.username.toLowerCase(),
    );

    if (user) {
      const mentionHtml = `<span class="mention" data-user-id="${user.id}">@${user.name}</span>`;
      result =
        result.substring(0, mention.start) +
        mentionHtml +
        result.substring(mention.end);
    }
  }

  return result;
}

// Fonction pour obtenir les IDs des utilisateurs mentionnés
export function getMentionedUserIds(
  text: string,
  users: MentionUser[],
): string[] {
  const mentions = extractMentions(text);
  const userIds: string[] = [];

  mentions.forEach((mention) => {
    const user = users.find(
      (u) => u.name.toLowerCase() === mention.username.toLowerCase(),
    );
    if (user && !userIds.includes(user.id)) {
      userIds.push(user.id);
    }
  });

  return userIds;
}

// Fonction pour filtrer les utilisateurs selon une recherche
export function filterUsers(
  users: MentionUser[],
  query: string,
): MentionUser[] {
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  return users
    .filter((user) => user.name.toLowerCase().includes(lowerQuery))
    .slice(0, 5); // Limiter à 5 suggestions
}
