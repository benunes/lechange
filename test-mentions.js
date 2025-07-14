// Test avec une regex plus précise qui s'arrête à la ponctuation
const mentionRegex =
  /@([A-Za-zÀ-ÿ0-9]+(?:\s+[A-Za-zÀ-ÿ0-9]+)*)(?=\s|$|[,.!?;:])/g;

const testText = "Salut @RHita Majdoul comment ça va ? Et @Jean Pierre aussi !";
console.log("Texte de test:", testText);
console.log("Mentions trouvées:");

let match;
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
];

console.log("\nTests supplémentaires:");
tests.forEach((test) => {
  console.log(`\nTexte: "${test}"`);
  const regex = /@([A-Za-zÀ-ÿ0-9]+(?:\s+[A-Za-zÀ-ÿ0-9]+)*)(?=\s|$|[,.!?;:])/g;
  let match;
  while ((match = regex.exec(test)) !== null) {
    console.log(`  -> "${match[1].trim()}"`);
  }
});
