// Test d'une regex qui limite la capture à maximum 3 mots pour éviter de capturer toute la phrase
const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/g;

const testText = "Salut @RHita Majdoul comment ça va ? Et @Jean Pierre aussi !";
console.log("Texte de test:", testText);
console.log("Mentions trouvées (max 3 mots):");

let match;
mentionRegex.lastIndex = 0;
while ((match = mentionRegex.exec(testText)) !== null) {
  console.log('- "' + match[1].trim() + '"');
}

// Test avec différents cas
const tests = [
  "@RHita Majdoul bonjour",
  "Salut @Jean Pierre Dupont !",
  "@Marie comment vas-tu ?",
  "Et @Alex Martin aussi.",
  "@User1 @User2 bonjour",
  "Bonjour @RHita Majdoul, comment allez-vous ?",
  "Hey @John Doe Smith comment ça va ?",
];

console.log("\nTests supplémentaires (max 3 mots):");
tests.forEach((test) => {
  console.log(`\nTexte: "${test}"`);
  const regex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/g;
  let match;
  while ((match = regex.exec(test)) !== null) {
    console.log(`  -> "${match[1].trim()}"`);
  }
});
