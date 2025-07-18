# Workflow de développement par Feature Branches

## Structure des branches

- `main` : Branche principale stable
- `FEATURE-{NOM-FONCTIONNALITE}` : Branches de fonctionnalités

## Processus de développement

### 1. Créer une nouvelle feature branch

```bash
# Depuis la branche main
git checkout main
git pull origin main

# Créer et basculer vers la nouvelle branche
git checkout -b FEATURE-{NOM-FONCTIONNALITE}
```

### 2. Développer la fonctionnalité

- Faire les commits nécessaires
- Tester la fonctionnalité
- S'assurer que tout fonctionne correctement

### 3. Merger vers main

```bash
# Revenir sur main et mettre à jour
git checkout main
git pull origin main

# Merger la feature branch
git merge FEATURE-{NOM-FONCTIONNALITE}

# Pousser les changements
git push origin main

# Supprimer la feature branch (optionnel)
git branch -d FEATURE-{NOM-FONCTIONNALITE}
```

## Exemples de noms de branches

- `FEATURE-SEARCH-ADVANCED` : Recherche avancée
- `FEATURE-NOTIFICATIONS-REALTIME` : Notifications en temps réel
- `FEATURE-PAYMENT-INTEGRATION` : Intégration de paiement
- `FEATURE-MOBILE-APP` : Application mobile
- `FEATURE-ADMIN-ANALYTICS` : Analytics pour admin
- `FEATURE-USER-VERIFICATION` : Vérification utilisateur

## Bonnes pratiques

1. **Nommer clairement** : Le nom doit décrire la fonctionnalité
2. **Branches courtes** : Une feature = une branche
3. **Tests avant merge** : Toujours tester avant de merger
4. **Commits atomiques** : Commits petits et cohérents
5. **Documentation** : Mettre à jour la documentation si nécessaire
