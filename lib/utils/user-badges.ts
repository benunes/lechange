// Système de badges utilisateur basé sur l'activité
export type UserBadge = {
  name: string;
  color: string;
  description: string;
};

export function getUserBadge(userStats: {
  questionsCount: number;
  answersCount: number;
  totalUpvotes: number;
  bestAnswersCount?: number;
}): UserBadge {
  const {
    questionsCount,
    answersCount,
    totalUpvotes,
    bestAnswersCount = 0,
  } = userStats;
  const totalActivity = questionsCount + answersCount;

  // Badge Expert (au moins 5 meilleures réponses)
  if (bestAnswersCount >= 5) {
    return {
      name: "Expert",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      description: "Expert reconnu de la communauté",
    };
  }

  // Badge Star (plus de 50 upvotes)
  if (totalUpvotes >= 50) {
    return {
      name: "Star",
      color: "bg-gradient-to-r from-pink-500 to-purple-500",
      description: "Contributeur populaire",
    };
  }

  // Badge Mentor (au moins 20 réponses)
  if (answersCount >= 20) {
    return {
      name: "Mentor",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      description: "Aide régulièrement la communauté",
    };
  }

  // Badge Actif (au moins 10 contributions)
  if (totalActivity >= 10) {
    return {
      name: "Actif",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      description: "Membre actif du forum",
    };
  }

  // Badge Participant (au moins 5 contributions)
  if (totalActivity >= 5) {
    return {
      name: "Participant",
      color: "bg-gradient-to-r from-indigo-500 to-blue-500",
      description: "Commence à s'impliquer",
    };
  }

  // Badge Débutant (par défaut)
  return {
    name: "Nouveau",
    color: "bg-gray-400",
    description: "Nouveau membre",
  };
}
