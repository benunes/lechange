import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

/**
 * Script pour créer des données de test
 * Usage: npx tsx scripts/create-test-data.ts
 */

// Fonction pour générer un ID unique
function generateUserId(): string {
  return randomBytes(16).toString("hex");
}

const testUsers = [
  {
    name: "Alice Martin",
    email: "alice@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Bob Dupont",
    email: "bob@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Clara Rousseau",
    email: "clara@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "David Lefevre",
    email: "david@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Emma Moreau",
    email: "emma@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Fabien Bernard",
    email: "fabien@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Gabrielle Petit",
    email: "gabrielle@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Hugo Laurent",
    email: "hugo@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Inès Dubois",
    email: "ines@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Julien Girard",
    email: "julien@test.com",
    role: "USER" as const,
    image: null,
  },
  {
    name: "Modérateur Test",
    email: "moderator@test.com",
    role: "MODERATOR" as const,
    image: null,
  },
  {
    name: "Admin Test",
    email: "admin@test.com",
    role: "ADMIN" as const,
    image: null,
  },
];

const testQuestions = [
  {
    title: "Comment apprendre JavaScript efficacement ?",
    content: `Salut tout le monde ! 👋

Je suis débutant en programmation et je veux apprendre JavaScript. J'ai quelques questions :

1. Par où commencer ?
2. Quels sont les meilleurs ressources gratuites ?
3. Combien de temps faut-il pour maîtriser les bases ?

Merci d'avance pour vos conseils ! 😊`,
    tags: ["javascript", "apprentissage", "débutant", "programmation"],
  },
  {
    title: "Problème avec React Hooks",
    content: `J'ai un souci avec useEffect qui se déclenche en boucle infinie. Voici mon code :

\`\`\`javascript
useEffect(() => {
  setData(fetchData());
}, [data]);
\`\`\`

Quelqu'un peut m'expliquer ce qui ne va pas ? 🤔`,
    tags: ["react", "hooks", "useeffect", "bug"],
  },
  {
    title: "Meilleurs plugins VSCode pour le développement web ?",
    content: `Quels sont vos plugins VSCode indispensables pour le développement web en 2025 ?

Je cherche notamment pour :
- HTML/CSS
- JavaScript/TypeScript  
- React
- Git

Partagez vos recommandations ! 🛠️`,
    tags: ["vscode", "plugins", "développement", "outils"],
  },
  {
    title: "Comment optimiser les performances d'une application Next.js ?",
    content: `Mon app Next.js devient lente avec beaucoup de données. Quelles sont les meilleures pratiques pour :

- Optimiser le chargement des images
- Gérer les API calls
- Améliorer le SEO
- Optimiser le bundle

Des conseils concrets seraient super utiles ! ⚡`,
    tags: ["nextjs", "performance", "optimisation", "seo"],
  },
  {
    title: "Base de données : PostgreSQL vs MongoDB ?",
    content: `Je commence un nouveau projet et j'hésite entre PostgreSQL et MongoDB.

**Mon contexte :**
- Application e-commerce
- Données relationnelles complexes
- Besoin de scalabilité

Quels sont les avantages/inconvénients de chaque solution ? 🗄️`,
    tags: ["database", "postgresql", "mongodb", "architecture"],
  },
  {
    title: "Conseils pour un premier job en développement ?",
    content: `Je finis mes études et je cherche mon premier emploi de développeur web.

**Questions :**
- Comment préparer un bon portfolio ?
- Quoi mettre en avant sans expérience pro ?
- Comment se préparer aux entretiens techniques ?

Merci pour vos retours d'expérience ! 💼`,
    tags: ["carrière", "portfolio", "entretien", "débutant"],
  },
  {
    title: "Gestion d'état : Redux vs Zustand vs Context API ?",
    content: `Pour un projet React de taille moyenne, quelle solution de gestion d'état recommandez-vous ?

J'ai entendu parler de :
- Redux Toolkit
- Zustand  
- Context API
- Jotai

Avantages/inconvénients de chacun ? 🔄`,
    tags: ["react", "state-management", "redux", "zustand"],
  },
  {
    title: "Sécurité web : les essentiels à connaître ?",
    content: `Quelles sont les vulnérabilités les plus courantes à éviter en développement web ?

Je pense à :
- XSS
- CSRF  
- Injection SQL
- Authentification

Des ressources pour approfondir ? 🔒`,
    tags: ["sécurité", "xss", "csrf", "authentification"],
  },
  {
    title: "TypeScript : worth it pour un petit projet ?",
    content: `Je débute un projet perso en React. Est-ce que TypeScript vaut le coup même pour un petit projet ?

**Pros/Cons que j'ai identifiés :**

✅ Meilleure autocomplétion  
✅ Détection d'erreurs
❌ Setup plus complexe
❌ Courbe d'apprentissage

Vos avis ? 📝`,
    tags: ["typescript", "javascript", "développement"],
  },
  {
    title: "Déploiement : Vercel vs Netlify vs Railway ?",
    content: `Pour déployer une app Next.js avec base de données, quelle plateforme choisir ?

**Critères importants :**
- Facilité d'utilisation
- Prix  
- Performance
- Support de la DB

Vos expériences ? 🚀`,
    tags: ["déploiement", "vercel", "netlify", "railway"],
  },
];

const testAnswers = [
  // Réponses pour "Comment apprendre JavaScript efficacement ?"
  {
    questionIndex: 0,
    content: `Salut ! Excellente question pour débuter ! 🎯

**Voici ma roadmap recommandée :**

1. **Bases JavaScript** (2-3 semaines)
   - Variables, fonctions, objets
   - DOM manipulation
   - Événements

2. **JavaScript moderne** (2-3 semaines)  
   - ES6+ (arrow functions, destructuring, async/await)
   - Promises
   - Modules

3. **Frameworks** (1-2 mois)
   - React ou Vue.js
   - Projets pratiques

**Ressources gratuites top :**
- freeCodeCamp
- JavaScript.info  
- MDN Documentation
- YouTube (Grafikart en français)

L'important c'est la **pratique** ! Code tous les jours, même 30min 💪`,
    upvotes: 15,
    downvotes: 0,
  },
  {
    questionIndex: 0,
    content: `Je complète la réponse précédente avec quelques conseils pratiques :

**Projets pour débuter :**
- Calculatrice
- Todo List  
- Quiz interactif
- Jeu Pierre-Papier-Ciseaux

**Outils indispensables :**
- VSCode avec extensions
- Chrome DevTools
- Git/GitHub

N'hésite pas à rejoindre des communautés Discord de devs français ! L'entraide est précieuse 🤝`,
    upvotes: 8,
    downvotes: 1,
  },
  // Réponses pour "Problème avec React Hooks"
  {
    questionIndex: 1,
    content: `Le problème vient du fait que tu mets \`data\` dans les dépendances de \`useEffect\` ! 🔄

**Voici ce qui se passe :**
1. useEffect se déclenche
2. setData modifie data  
3. data change → useEffect se redéclenche
4. Boucle infinie !

**Solution :**
\`\`\`javascript
useEffect(() => {
  const getData = async () => {
    const result = await fetchData();
    setData(result);
  };
  getData();
}, []); // Array vide = se déclenche une seule fois
\`\`\`

Si tu as besoin de récupérer les données quand quelque chose change, mets cette chose dans les dépendances, pas \`data\` ! 👍`,
    upvotes: 25,
    downvotes: 0,
  },
  // Réponses pour "Meilleurs plugins VSCode"
  {
    questionIndex: 2,
    content: `Voici ma sélection d'extensions indispensables ! 🛠️

**Développement général :**
- **Prettier** - Formatage automatique
- **ESLint** - Détection d'erreurs
- **Auto Rename Tag** - Renomme les balises HTML
- **Bracket Pair Colorizer** - Colore les parenthèses

**JavaScript/TypeScript :**
- **ES7+ React/Redux/React-Native snippets**
- **JavaScript (ES6) code snippets**
- **TypeScript Hero**

**CSS :**
- **CSS Peek** - Navigation dans le CSS
- **Tailwind CSS IntelliSense**

**Git :**
- **GitLens** - Historique Git avancé
- **Git Graph** - Visualisation des branches

**Bonus :**
- **Live Server** - Serveur de développement
- **Thunder Client** - Client REST intégré

Ces extensions me font gagner un temps fou ! ⚡`,
    upvotes: 20,
    downvotes: 2,
  },
  // Plus de réponses pour d'autres questions...
  {
    questionIndex: 3,
    content: `Excellente question ! Next.js offre pleins d'outils pour optimiser les perfs 🚀

**Images :**
- Utilise \`next/image\` avec lazy loading automatique
- Formats WebP/AVIF automatiques
- Responsive images

**API & Data Fetching :**
- \`getStaticProps\` pour les données statiques
- \`getServerSideProps\` seulement si nécessaire  
- ISR (Incremental Static Regeneration) pour un bon compromis
- SWR ou React Query pour le cache côté client

**Bundle :**
- Analyse avec \`@next/bundle-analyzer\`
- Dynamic imports pour le code splitting
- Tree shaking automatique

**SEO :**
- \`next/head\` pour les meta tags
- Sitemap automatique
- Schema.org markup

**Exemple concret :**
\`\`\`javascript
// Dynamic import pour réduire le bundle initial
const Chart = dynamic(() => import('./Chart'), { ssr: false });
\`\`\`

Ces optimisations peuvent diviser tes temps de chargement par 2-3 ! 📈`,
    upvotes: 18,
    downvotes: 1,
  },
  {
    questionIndex: 4,
    content: `Pour ton contexte e-commerce, je recommande **PostgreSQL** ! 🗄️

**Pourquoi PostgreSQL pour l'e-commerce :**

✅ **ACID compliance** - Transactions sûres (crucial pour les paiements)
✅ **Relations complexes** - Gestion des commandes, produits, utilisateurs
✅ **Requêtes SQL puissantes** - Rapports et analytics
✅ **JSON support** - Flexibilité quand nécessaire
✅ **Écosystème mature** - ORMs, outils, communauté

**MongoDB serait plus adapté pour :**
- Données non-relationnelles
- Prototypage rapide  
- Applications avec beaucoup d'écriture
- Scaling horizontal massif

**Pour ton e-commerce :**
- Utilise PostgreSQL avec Prisma ORM
- Structure tes données relationnelles dès le début
- Tu pourras toujours ajouter Redis pour le cache

La cohérence des données est cruciale en e-commerce ! 💰`,
    upvotes: 12,
    downvotes: 3,
  },
];

async function createTestUsers() {
  console.log("👥 Création des utilisateurs de test...");

  const hashedPassword = await bcrypt.hash("password", 12);
  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️ Utilisateur ${userData.email} existe déjà`);
        createdUsers.push(existingUser);
        continue;
      }

      const userId = generateUserId();
      const user = await prisma.user.create({
        data: {
          id: userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          image: userData.image,
          emailVerified: true,
          accounts: {
            create: {
              id: generateUserId(),
              provider: "credential",
              providerId: "credential",
              password: hashedPassword,
            },
          },
        },
      });

      createdUsers.push(user);
      console.log(
        `   ✅ ${user.name} (${user.email}) créé avec rôle ${user.role}`,
      );
    } catch (error) {
      console.error(`   ❌ Erreur création ${userData.email}:`, error);
    }
  }

  return createdUsers;
}

async function createTestQuestions(users: any[]) {
  console.log("❓ Création des questions de test...");

  // Récupérer les catégories du forum
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log(
      "   ⚠️ Aucune catégorie de forum trouvée, création sans catégorie",
    );
  }

  const createdQuestions = [];
  const regularUsers = users.filter((u) => u.role === "USER");

  if (regularUsers.length === 0) {
    console.log("   ⚠️ Aucun utilisateur normal trouvé");
    return [];
  }

  for (let i = 0; i < testQuestions.length; i++) {
    const questionData = testQuestions[i];
    const randomUser =
      regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const randomCategory =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]
        : null;

    try {
      const question = await prisma.question.create({
        data: {
          title: questionData.title,
          content: questionData.content,
          tags: questionData.tags,
          authorId: randomUser.id,
          categoryId: randomCategory?.id || null,
        },
      });

      createdQuestions.push(question);
      console.log(`   ✅ Question "${question.title}" par ${randomUser.name}`);
    } catch (error) {
      console.error(`   ❌ Erreur création question ${i}:`, error);
    }
  }

  return createdQuestions;
}

async function createTestAnswers(users: any[], questions: any[]) {
  console.log("💬 Création des réponses de test...");

  const regularUsers = users.filter((u) => u.role === "USER");

  if (regularUsers.length === 0 || questions.length === 0) {
    console.log(
      "   ⚠️ Pas d'utilisateurs ou de questions pour créer des réponses",
    );
    return;
  }

  for (const answerData of testAnswers) {
    if (answerData.questionIndex >= questions.length) {
      console.log(
        `   ⚠️ Question index ${answerData.questionIndex} introuvable`,
      );
      continue;
    }

    const question = questions[answerData.questionIndex];
    const randomUser =
      regularUsers[Math.floor(Math.random() * regularUsers.length)];

    try {
      const answer = await prisma.answer.create({
        data: {
          content: answerData.content,
          questionId: question.id,
          authorId: randomUser.id,
          upvotes: answerData.upvotes || 0,
          downvotes: answerData.downvotes || 0,
        },
      });

      // Créer quelques votes pour certaines réponses
      if (answerData.upvotes > 0) {
        const votersCount = Math.min(
          answerData.upvotes,
          regularUsers.length - 1,
        );
        const voters = regularUsers
          .filter((u) => u.id !== randomUser.id)
          .slice(0, votersCount);

        for (const voter of voters) {
          await prisma.answerVote
            .create({
              data: {
                userId: voter.id,
                answerId: answer.id,
                isUpvote: true,
              },
            })
            .catch(() => {}); // Ignorer les doublons
        }
      }

      console.log(
        `   ✅ Réponse par ${randomUser.name} (${answerData.upvotes} votes)`,
      );
    } catch (error) {
      console.error(`   ❌ Erreur création réponse:`, error);
    }
  }
}

async function createTestListings(users: any[]) {
  console.log("📦 Création d'annonces de test...");

  // Récupérer les catégories d'annonces
  const listingCategories = await prisma.listingCategory.findMany({
    where: { parentId: { not: null } }, // Seulement les sous-catégories
  });

  if (listingCategories.length === 0) {
    console.log("   ⚠️ Aucune catégorie d'annonce trouvée");
    return;
  }

  const sampleListings = [
    {
      title: "iPhone 14 Pro comme neuf",
      description:
        "iPhone 14 Pro 128Go couleur violet, acheté il y a 6 mois. Très peu utilisé, toujours dans sa coque. Vendu avec chargeur et boîte d'origine.",
      price: 850,
      condition: "tres-bon",
      location: "Paris 15e",
    },
    {
      title: "MacBook Air M2 2023",
      description:
        "MacBook Air M2 13 pouces, 256Go SSD, 8Go RAM. Excellent état, utilisé principalement pour les études. Clavier français.",
      price: 1200,
      condition: "bon",
      location: "Lyon",
    },
    {
      title: "Console PS5 avec jeux",
      description:
        "PlayStation 5 standard avec 3 jeux : Spider-Man, FIFA 24, et Call of Duty. Achetée neuve, très bon état.",
      price: 550,
      condition: "tres-bon",
      location: "Marseille",
    },
    {
      title: "Cours de mathématiques",
      description:
        "Étudiante en école d'ingénieur propose cours de maths niveau lycée et prépa. Disponible le soir et weekend.",
      price: 25,
      condition: null,
      location: "Toulouse",
    },
    {
      title: "Vélo de course Trek",
      description:
        "Vélo de course Trek Émonda ALR 5, taille 56cm. Très bon état, révisé récemment. Parfait pour débuter ou s'entraîner.",
      price: 800,
      condition: "bon",
      location: "Nantes",
    },
  ];

  const regularUsers = users.filter((u) => u.role === "USER");

  if (regularUsers.length === 0) {
    console.log(
      "   ⚠️ Aucun utilisateur normal trouvé pour créer des annonces",
    );
    return;
  }

  for (const listingData of sampleListings) {
    const randomUser =
      regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const randomCategory =
      listingCategories[Math.floor(Math.random() * listingCategories.length)];

    try {
      const listing = await prisma.listing.create({
        data: {
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          condition: listingData.condition,
          location: listingData.location,
          categoryId: randomCategory.id,
          createdById: randomUser.id,
          images: [], // Pas d'images pour les tests
        },
      });

      console.log(`   ✅ Annonce "${listing.title}" par ${randomUser.name}`);
    } catch (error) {
      console.error(`   ❌ Erreur création annonce:`, error);
    }
  }
}

async function createTestData() {
  try {
    console.log("🚀 Création des données de test...\n");

    const users = await createTestUsers();
    console.log("");

    const questions = await createTestQuestions(users);
    console.log("");

    await createTestAnswers(users, questions);
    console.log("");

    await createTestListings(users);
    console.log("");

    // Statistiques finales
    const stats = {
      users: await prisma.user.count(),
      questions: await prisma.question.count(),
      answers: await prisma.answer.count(),
      listings: await prisma.listing.count(),
    };

    console.log("📊 Statistiques finales :");
    console.log(`   👥 Utilisateurs : ${stats.users}`);
    console.log(`   ❓ Questions : ${stats.questions}`);
    console.log(`   💬 Réponses : ${stats.answers}`);
    console.log(`   📦 Annonces : ${stats.listings}`);

    console.log("\n🎉 Données de test créées avec succès !");
    console.log("\n🔑 Connexion pour tous les utilisateurs :");
    console.log("   Email : [nom]@test.com (ex: alice@test.com)");
    console.log("   Mot de passe : password");
    console.log("\n👑 Comptes privilégiés :");
    console.log("   Admin : admin@test.com / password");
    console.log("   Modérateur : moderator@test.com / password");
  } catch (error) {
    console.error("❌ Erreur lors de la création des données de test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  createTestData();
}

export { createTestData };
