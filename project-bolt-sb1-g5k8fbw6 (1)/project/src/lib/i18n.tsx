import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'fr' | 'en';

export type TranslationKey =
  | 'appName'
  | 'appTagline'
  | 'login'
  | 'start'
  | 'designedForFarmers'
  | 'formulateFeed'
  | 'withPrecision'
  | 'landingDescription'
  | 'createAccount'
  | 'signIn'
  | 'signupPrompt'
  | 'loginPrompt'
  | 'alreadyHaveAccount'
  | 'noAccount'
  | 'lastName'
  | 'firstName'
  | 'country'
  | 'city'
  | 'phone'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'createMyAccount'
  | 'fillAllFields'
  | 'passwordMinLength'
  | 'passwordsDontMatch'
  | 'phoneFormatError'
  | 'phoneDigits'
  | 'phoneFormatHint'
  | 'searchCountry'
  | 'noCountryFound'
  | 'loginSuccessful'
  | 'welcomeMessage'
  | 'loading'
  | 'emailVerification'
  | 'verificationCodeSent'
  | 'enterCode'
  | 'validateCode'
  | 'verifying'
  | 'checkInboxSpam'
  | 'back'
  | 'backToHome'
  | 'internetRequired'
  | 'internetRequiredDesc'
  | 'retry'
  | 'checking'
  | 'home'
  | 'utility'
  | 'settings'
  | 'about'
  | 'feedType'
  | 'selectFeedType'
  | 'ingredient'
  | 'inclusionPercent'
  | 'pricePerKg'
  | 'total'
  | 'save'
  | 'formulas'
  | 'exportPdf'
  | 'reset'
  | 'calculate'
  | 'formulation'
  | 'analysis'
  | 'nutritionalAnalysis'
  | 'conform'
  | 'tolerance'
  | 'outOfRange'
  | 'inRange'
  | 'tolerancePercent'
  | 'outOfNorm'
  | 'norm'
  | 'analysisPlaceholder'
  | 'analyzingFormula'
  | 'bag50kg'
  | 'saveFormula'
  | 'formulaName'
  | 'savedFormulas'
  | 'noSavedFormulas'
  | 'load'
  | 'cancel'
  | 'connectedAccount'
  | 'user'
  | 'notifications'
  | 'enabled'
  | 'language'
  | 'privacy'
  | 'privacyDesc'
  | 'installApp'
  | 'install'
  | 'logout'
  | 'pravetPlus'
  | 'companyInfo'
  | 'address'
  | 'addressValue'
  | 'ifu'
  | 'phoneWhatsapp'
  | 'youtube'
  | 'aboutApp'
  | 'aboutAppDesc'
  | 'copyright'
  | 'whyUseful'
  | 'usefulIntro1'
  | 'usefulIntro2'
  | 'usefulList1'
  | 'usefulList2'
  | 'usefulList3'
  | 'usefulList4'
  | 'usefulList5'
  | 'usefulOutro'
  | 'feature1Title'
  | 'feature1Text'
  | 'feature2Title'
  | 'feature2Text'
  | 'feature3Title'
  | 'feature3Text'
  | 'feature4Title'
  | 'feature4Text'
  | 'feature5Title'
  | 'feature5Text'
  | 'footer'
  | 'reportTitle'
  | 'partialCost'
  | 'nutrientValue'
  | 'normMin'
  | 'normMax'
  | 'status'
  | 'totalNorms'
  | 'forgotPassword'
  | 'forgotPasswordTitle'
  | 'forgotPasswordPrompt'
  | 'sendResetLink'
  | 'resetLinkSent'
  | 'resetLinkSentDesc'
  | 'backToLogin'
  | 'resetPasswordTitle'
  | 'resetPasswordPrompt'
  | 'newPassword'
  | 'confirmNewPassword'
  | 'updatePassword'
  | 'passwordUpdated'
  | 'passwordUpdatedDesc'
  | 'passwordsMatchError'
  | 'currency'
  | 'currencyLabel'
  | 'myProfile'
  | 'profileInfo'
  | 'editProfile'
  | 'saveProfile'
  | 'profileUpdated'
  | 'profileUpdateError'
  | 'memberSince'
  | 'privacyTitle'
  | 'privacyIntro'
  | 'privacyDataCollection'
  | 'privacyDataCollectionDesc'
  | 'privacyDataUsage'
  | 'privacyDataUsageDesc'
  | 'privacyDataStorage'
  | 'privacyDataStorageDesc'
  | 'privacyUserRights'
  | 'privacyUserRightsDesc'
  | 'privacyContact'
  | 'privacyContactDesc'
  | 'notificationsOn'
  | 'notificationsOff'
  | 'notificationsDisabled'
  | 'profilePhoto'
  | 'changePhoto'
  | 'photoUpdated'
  | 'photoUpdateError'
  | 'shareFormula'
  | 'shareApp'
  | 'shareAppDesc'
  | 'copyLink'
  | 'linkCopied'
  | 'shareVia'
  | 'choosePlan'
  | 'choosePlanDesc'
  | 'paymentMethod'
  | 'payNow'
  | 'processingPayment'
  | 'paymentSuccess'
  | 'paymentSuccessDesc'
  | 'redirectingToFormulation'
  | 'continueToFormulation'
  | 'trialActive'
  | 'adminAccess'
  | 'popular'
  | 'paymentSecure'
  | 'subscriptionExpired'
  | 'subscribeNow'
  | 'subscribeToCalculate'
  | 'adminLogin'
  | 'adminLoginDesc'
  | 'adminPanel'
  | 'updateVersion'
  | 'forceUpdate'
  | 'updateMessage'
  | 'saveConfig'
  | 'configSaved'
  | 'configSaveError'
  | 'updateAvailable'
  | 'updateNow'
  | 'later'
  | 'subscription'
  | 'subscriptionStatus'
  | 'daysLeft'
  | 'expired'
  | 'active'
  | 'trial'
  | 'paid'
  | 'freeLimitReached'
  | 'freeLimitDesc'
  | 'freeTrialsLeft'
  | 'plan24h'
  | 'plan3days'
  | 'plan7days'
  | 'plan14days'
  | 'plan30days'
  | 'subscriptionTimeLeft'
  | 'noTrialsLeft'
  | 'demo'
  | 'demoTitle'
  | 'demoIntro'
  | 'demoStep1Title'
  | 'demoStep1Text'
  | 'demoStep2Title'
  | 'demoStep2Text'
  | 'demoStep3Title'
  | 'demoStep3Text'
  | 'demoStep4Title'
  | 'demoStep4Text'
  | 'demoStep5Title'
  | 'demoStep5Text'
  | 'demoStep6Title'
  | 'demoStep6Text'
  | 'demoPrev'
  | 'demoNext'
  | 'demoFinish'
  | 'demoClose'
  | 'demoStepOf'
  | 'demoVideo'
  | 'demoVideoTagline'
  | 'demoReplay'
  | 'clientName'
  | 'interpretation'
  | 'interpretationPlaceholder';

type Translations = Record<TranslationKey, string>;

const fr: Translations = {
  appName: 'Feed Formular',
  appTagline: 'Formulation d\'aliment volaille',
  login: 'Connexion',
  start: 'Démarrer',
  designedForFarmers: 'Conçu pour les éleveurs',
  formulateFeed: 'Formulez votre aliment',
  withPrecision: 'en toute précision',
  landingDescription: 'Calculez automatiquement le coût et la valeur nutritionnelle de vos formules d\'aliment pour volaille. Comparez vos résultats aux normes recommandées et optimisez vos rations sans dépenser inutilement.',
  createAccount: 'Créer un compte',
  signIn: 'Se connecter',
  signupPrompt: 'Inscrivez-vous pour utiliser Feed Formular',
  loginPrompt: 'Connectez-vous à votre compte',
  alreadyHaveAccount: 'Vous avez déjà un compte ?',
  noAccount: 'Pas encore de compte ?',
  lastName: 'Nom',
  firstName: 'Prénom',
  country: 'Pays',
  city: 'Ville',
  phone: 'Téléphone',
  email: 'Adresse email',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  createMyAccount: 'Créer mon compte',
  fillAllFields: 'Veuillez remplir tous les champs.',
  passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères.',
  passwordsDontMatch: 'Les mots de passe ne correspondent pas.',
  phoneFormatError: 'Le numéro de téléphone doit contenir {n} chiffres pour {country}.',
  phoneDigits: 'chiffres',
  phoneFormatHint: 'Format',
  searchCountry: 'Rechercher un pays...',
  noCountryFound: 'Aucun pays trouvé',
  loginSuccessful: 'Connexion réussie',
  welcomeMessage: 'Bienvenue dans Feed Formular. Vous allez être redirigé vers l\'application.',
  loading: 'Chargement...',
  emailVerification: 'Vérification par email',
  verificationCodeSent: 'Un code de vérification a été envoyé à',
  enterCode: 'Code de vérification',
  validateCode: 'Valider le code',
  verifying: 'Vérification...',
  checkInboxSpam: 'Vérifiez votre boîte de réception et les spams.',
  back: 'Retour',
  backToHome: 'Accueil',
  internetRequired: 'Connexion internet requise',
  internetRequiredDesc: 'Feed Formular a besoin d\'une connexion internet pour vérifier votre compte et fonctionner. Veuillez vous connecter à internet puis réessayer.',
  retry: 'Réessayer',
  checking: 'Vérification...',
  home: 'Accueil',
  utility: 'Utilité',
  settings: 'Paramètres',
  about: 'À propos',
  feedType: 'Type d\'aliment',
  selectFeedType: 'Sélectionnez type d\'aliments',
  ingredient: 'Ingrédient',
  inclusionPercent: '% Inclusion',
  pricePerKg: 'Prix /kg',
  total: 'Total',
  save: 'Sauvegarder',
  formulas: 'Formules',
  exportPdf: 'Export PDF',
  reset: 'Réinitialiser',
  calculate: 'Calculer',
  formulation: 'Formulation',
  analysis: 'Analyse',
  nutritionalAnalysis: 'Analyse nutritionnelle',
  conform: 'Conforme',
  tolerance: 'Tolérance',
  outOfRange: 'Hors norme',
  inRange: 'Dans l\'intervalle',
  tolerancePercent: 'Tolérance ±8%',
  outOfNorm: 'Hors norme',
  norm: 'Norme',
  analysisPlaceholder: 'L\'analyse nutritionnelle apparaîtra après avoir cliqué sur « Calculer ».',
  analyzingFormula: 'Analyse de la formule en cours...',
  bag50kg: 'Prix sac 50 kg',
  saveFormula: 'Sauvegarder la formule',
  formulaName: 'Nom de la formule',
  savedFormulas: 'Formules sauvegardées',
  noSavedFormulas: 'Aucune formule sauvegardée pour le moment.',
  load: 'Charger',
  cancel: 'Annuler',
  connectedAccount: 'Compte connecté',
  user: 'Utilisateur',
  notifications: 'Notifications',
  enabled: 'Activées',
  language: 'Langue',
  privacy: 'Confidentialité',
  privacyDesc: 'Vos données sont privées',
  installApp: 'Installer l\'application',
  install: 'Installer',
  logout: 'Déconnexion',
  pravetPlus: 'PRAVET PLUS',
  companyInfo: 'Informations sur l\'entreprise',
  address: 'Adresse',
  addressValue: 'Bénin, Zinvié',
  ifu: 'IFU',
  phoneWhatsapp: 'Téléphone (WhatsApp et Appel)',
  youtube: 'YouTube',
  aboutApp: 'À propos de l\'application',
  aboutAppDesc: 'Feed Formular est une application mobile conçue par PRAVET PLUS pour aider les éleveurs de volaille à formuler leur aliment avec précision. Elle permet de calculer le coût de revient, d\'analyser la valeur nutritionnelle des formules et de les comparer aux normes recommandées — le tout directement sur votre téléphone, à la ferme.',
  copyright: '© 2026 PRAVET PLUS — Tous droits réservés',
  whyUseful: 'Pourquoi Feed Formular est utile',
  usefulIntro1: 'Pour un éleveur de volaille, l\'aliment représente 60 à 70% du coût total de production. Une formule bien équilibrée permet à la fois de réduire les coûts et d\'améliorer les performances de croissance et de ponte.',
  usefulIntro2: 'Avec',
  usefulList1: 'Calculer le prix de revient de votre aliment au kg et au sac de 50 kg en temps réel',
  usefulList2: 'Vérifier que votre formule couvre les besoins nutritionnels (protéines, énergie, calcium, acides aminés...)',
  usefulList3: 'Détecter les carences ou les excès grâce à un code couleur simple : vert, orange, rouge',
  usefulList4: 'Tester plusieurs combinaisons d\'ingrédients pour trouver la formule la plus économique',
  usefulList5: 'Travailler hors-ligne, directement à la ferme, sans dépendre d\'une connexion internet',
  usefulOutro: 'Plus besoin de tableaux complexes ou de calculs manuels sources d\'erreurs : l\'application fait les calculs nutritionnels pondérés automatiquement à partir des valeurs de chaque ingrédient.',
  feature1Title: 'Calcul du coût de revient',
  feature1Text: 'Obtenez instantanément le prix au kg et au sac de 50 kg à partir des prix de vos ingrédients et de leurs pourcentages d\'inclusion.',
  feature2Title: 'Analyse nutritionnelle automatique',
  feature2Text: 'Comparez automatiquement vos formules aux normes nutritionnelles de chaque type d\'aliment volaille (protéines, énergie, calcium, acides aminés...).',
  feature3Title: '28 ingrédients intégrés',
  feature3Text: 'Maïs, sorgho, soja, concentrés, huiles, minéraux... tous les ingrédients avec leurs valeurs nutritionnelles prêtes à l\'emploi.',
  feature4Title: 'Contrôle qualité par code couleur',
  feature4Text: 'Code couleur vert/orange/rouge pour identifier rapidement les écarts par rapport aux normes recommandées et corriger votre formule.',
  feature5Title: 'Pensé pour les éleveurs',
  feature5Text: 'Interface simple en français, optimisée pour mobile, pensée pour le terrain et les conditions réelles de la ferme.',
  footer: 'Feed Formular — PRAVET PLUS, Bénin, Zinvié | +229 01 61 37 09 79',
  reportTitle: 'Rapport de Formulation d\'Aliment Volaille',
  partialCost: 'Coût partiel',
  nutrientValue: 'Valeur',
  normMin: 'Norme Min',
  normMax: 'Norme Max',
  status: 'Statut',
  totalNorms: 'Total normes',
  forgotPassword: 'Mot de passe oublié ?',
  forgotPasswordTitle: 'Réinitialiser le mot de passe',
  forgotPasswordPrompt: 'Entrez votre adresse email. Vous recevrez un lien pour créer un nouveau mot de passe.',
  sendResetLink: 'Envoyer le lien',
  resetLinkSent: 'Lien envoyé',
  resetLinkSentDesc: 'Un email avec un lien de réinitialisation a été envoyé à',
  backToLogin: 'Retour à la connexion',
  resetPasswordTitle: 'Nouveau mot de passe',
  resetPasswordPrompt: 'Choisissez un nouveau mot de passe pour votre compte.',
  newPassword: 'Nouveau mot de passe',
  confirmNewPassword: 'Confirmer le nouveau mot de passe',
  updatePassword: 'Mettre à jour le mot de passe',
  passwordUpdated: 'Mot de passe mis à jour',
  passwordUpdatedDesc: 'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
  passwordsMatchError: 'Les mots de passe ne correspondent pas.',
  currency: 'Devise',
  currencyLabel: 'Devise',
  myProfile: 'Mon profil',
  profileInfo: 'Informations personnelles',
  editProfile: 'Modifier le profil',
  saveProfile: 'Enregistrer le profil',
  profileUpdated: 'Profil mis à jour avec succès.',
  profileUpdateError: 'Erreur lors de la mise à jour du profil.',
  memberSince: 'Membre depuis',
  privacyTitle: 'Confidentialité et protection des données',
  privacyIntro: 'Chez PRAVET PLUS, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique quelles données nous collectons, comment nous les utilisons et quels sont vos droits.',
  privacyDataCollection: 'Données collectées',
  privacyDataCollectionDesc: 'Lors de la création de votre compte, nous collectons votre nom, prénom, pays, ville, numéro de téléphone et adresse email. Ces informations sont nécessaires pour identifier votre compte et personnaliser votre expérience.',
  privacyDataUsage: 'Utilisation des données',
  privacyDataUsageDesc: 'Vos données sont utilisées uniquement pour le fonctionnement de l\'application Feed Formular : gestion de votre profil, sauvegarde de vos formules d\'aliment et calculs nutritionnels. Nous ne vendons ni ne partageons vos données avec des tiers.',
  privacyDataStorage: 'Stockage et sécurité',
  privacyDataStorageDesc: 'Vos données sont stockées de manière sécurisée sur nos serveurs avec un chiffrement de bout en bout. Chaque utilisateur ne peut accéder qu\'à ses propres données grâce à des politiques de sécurité strictes.',
  privacyUserRights: 'Vos droits',
  privacyUserRightsDesc: 'Vous disposez d\'un droit d\'accès, de modification et de suppression de vos données personnelles. Vous pouvez modifier votre profil à tout moment depuis les paramètres, ou vous déconnecter pour mettre fin à votre session.',
  privacyContact: 'Nous contacter',
  privacyContactDesc: 'Pour toute question concernant vos données personnelles, vous pouvez nous contacter via WhatsApp ou par téléphone au +229 01 61 37 09 79, ou par email à l\'adresse indiquée dans la section À propos.',
  notificationsOn: 'Activées',
  notificationsOff: 'Désactivées',
  notificationsDisabled: 'Désactivées',
  profilePhoto: 'Photo de profil',
  changePhoto: 'Changer la photo',
  photoUpdated: 'Photo de profil mise à jour.',
  photoUpdateError: 'Erreur lors du téléchargement de la photo.',
  shareFormula: 'Partager la formule',
  shareApp: 'Partager l\'application',
  shareAppDesc: 'Partagez Feed Formular avec vos amis et collègues éleveurs',
  copyLink: 'Copier le lien',
  linkCopied: 'Lien copié !',
  shareVia: 'Partager via...',
  choosePlan: 'Choisissez votre abonnement',
  choosePlanDesc: 'Profitez de toutes les fonctionnalités de Feed Formular',
  paymentMethod: 'Mode de paiement',
  payNow: 'Payer maintenant',
  processingPayment: 'Traitement du paiement...',
  paymentSuccess: 'Paiement réussi !',
  paymentSuccessDesc: 'Votre abonnement est actif. Vous pouvez maintenant accéder à la formulation.',
  redirectingToFormulation: 'Redirection vers la formulation...',
  continueToFormulation: 'Continuer vers la formulation',
  trialActive: 'Essai gratuit actif — {days} jours restants',
  adminAccess: 'Accès administrateur — toutes les fonctionnalités sont débloquées',
  popular: 'Populaire',
  paymentSecure: 'Paiement sécurisé. Vos données sont protégées.',
  subscriptionExpired: 'Votre abonnement a expiré. Renouvelez pour continuer à utiliser le calcul.',
  subscribeNow: "S'abonner",
  subscribeToCalculate: 'Abonnez-vous pour utiliser le calcul',
  adminLogin: 'Connexion administrateur',
  adminLoginDesc: 'Accès réservé à DJAGOUN NICAISE',
  adminPanel: 'Panneau d\'administration',
  updateVersion: 'Version de l\'application',
  forceUpdate: 'Forcer la mise à jour',
  updateMessage: 'Message de mise à jour',
  saveConfig: 'Enregistrer la configuration',
  configSaved: 'Configuration enregistrée. Les utilisateurs verront la notification de mise à jour.',
  configSaveError: 'Erreur lors de l\'enregistrement de la configuration.',
  updateAvailable: 'Mise à jour disponible',
  updateNow: 'Mettre à jour',
  later: 'Plus tard',
  subscription: 'Abonnement',
  subscriptionStatus: 'Statut de l\'abonnement',
  daysLeft: 'jours restants',
  expired: 'Expiré',
  active: 'Actif',
  trial: 'Essai gratuit',
  paid: 'Payant',
  freeLimitReached: 'Limite gratuite atteinte',
  freeLimitDesc: 'Vous avez utilisé vos 3 essais gratuits. Choisissez un abonnement pour continuer à utiliser le calcul.',
  freeTrialsLeft: 'Essais gratuits restants : {n}/3',
  plan24h: '24 heures',
  plan3days: '3 jours',
  plan7days: '7 jours',
  plan14days: '14 jours',
  plan30days: '1 mois (30 jours)',
  subscriptionTimeLeft: 'Abonnement actif : {time}',
  noTrialsLeft: '0 essai gratuit restant',
  demo: 'Voir la démo',
  demoTitle: 'Guide d\'utilisation',
  demoIntro: 'Découvrez en 6 étapes comment formuler votre aliment avec Feed Formular.',
  demoStep1Title: '1. Choisissez le type d\'aliment',
  demoStep1Text: 'Sur l\'écran de formulation, ouvrez le menu « Type d\'aliment » et sélectionnez la catégorie adaptée à vos volailles (démarrage chair, ponte 1, poulette, etc.). Les normes nutritionnelles correspondantes seront utilisées pour l\'analyse.',
  demoStep2Title: '2. Entrez les ingrédients et leurs pourcentages',
  demoStep2Text: 'Pour chaque ingrédient de la liste (maïs, son, tourteau de soja, concentré...), saisissez son pourcentage d\'inclusion. Le total doit atteindre 100% : un indicateur en haut de l\'écran devient vert quand c\'est le cas.',
  demoStep3Title: '3. Indiquez les prix',
  demoStep3Text: 'Saisissez le prix au kilogramme de chaque ingrédient que vous utilisez. Vous pouvez changer la devise (FCFA, dollar, euro) dans les paramètres.',
  demoStep4Title: '4. Calculez',
  demoStep4Text: 'Appuyez sur le bouton « Calculer ». L\'application affiche immédiatement le coût de votre formule au kg et au sac de 50 kg, ainsi que l\'analyse nutritionnelle complète.',
  demoStep5Title: '5. Vérifiez l\'analyse et suivez les recommandations',
  demoStep5Text: 'Comparez chaque valeur aux normes grâce au code couleur : vert = conforme, orange = dans la tolérance (±8%), rouge = hors norme. Sous le tableau, des recommandations intelligentes s\'affichent : l\'application vous dit quels ingrédients ajouter ou réduire, sans aggraver un autre écart. Recalculez après ajustement.',
  demoStep6Title: '6. Sauvegardez et exportez',
  demoStep6Text: 'Sauvegardez votre formule avec un nom pour la retrouver plus tard, partagez-la par WhatsApp, ou exportez-la en PDF pour l\'imprimer. Vos formules sont accessibles dans l\'onglet « Formules ».',
  demoPrev: 'Précédent',
  demoNext: 'Suivant',
  demoFinish: 'Terminer',
  demoClose: 'Fermer',
  demoStepOf: 'Étape {current} sur {total}',
  demoVideo: 'Démo vidéo',
  demoVideoTagline: 'Regarder l\'application en action',
  demoReplay: 'Revoir la vidéo',
  clientName: 'Nom du client',
  interpretation: 'Recommandations',
  interpretationPlaceholder: 'Recommandations indisponibles. Vérifiez que le type d\'aliment est sélectionné et que le total atteint 100%.',
};

const en: Translations = {
  appName: 'Feed Formular',
  appTagline: 'Poultry feed formulation',
  login: 'Login',
  start: 'Start',
  designedForFarmers: 'Designed for farmers',
  formulateFeed: 'Formulate your feed',
  withPrecision: 'with precision',
  landingDescription: 'Automatically calculate the cost and nutritional value of your poultry feed formulas. Compare your results with recommended standards and optimize your rations without unnecessary spending.',
  createAccount: 'Create an account',
  signIn: 'Sign in',
  signupPrompt: 'Sign up to use Feed Formular',
  loginPrompt: 'Sign in to your account',
  alreadyHaveAccount: 'Already have an account?',
  noAccount: 'No account yet?',
  lastName: 'Last name',
  firstName: 'First name',
  country: 'Country',
  city: 'City',
  phone: 'Phone',
  email: 'Email address',
  password: 'Password',
  confirmPassword: 'Confirm password',
  createMyAccount: 'Create my account',
  fillAllFields: 'Please fill in all fields.',
  passwordMinLength: 'Password must be at least 6 characters.',
  passwordsDontMatch: 'Passwords do not match.',
  phoneFormatError: 'The phone number must contain {n} digits for {country}.',
  phoneDigits: 'digits',
  phoneFormatHint: 'Format',
  searchCountry: 'Search a country...',
  noCountryFound: 'No country found',
  loginSuccessful: 'Login successful',
  welcomeMessage: 'Welcome to Feed Formular. You will be redirected to the app.',
  loading: 'Loading...',
  emailVerification: 'Email verification',
  verificationCodeSent: 'A verification code has been sent to',
  enterCode: 'Verification code',
  validateCode: 'Validate code',
  verifying: 'Verifying...',
  checkInboxSpam: 'Check your inbox and spam folder.',
  back: 'Back',
  backToHome: 'Home',
  internetRequired: 'Internet connection required',
  internetRequiredDesc: 'Feed Formular needs an internet connection to verify your account and work. Please connect to the internet and try again.',
  retry: 'Retry',
  checking: 'Checking...',
  home: 'Home',
  utility: 'Benefits',
  settings: 'Settings',
  about: 'About',
  feedType: 'Feed type',
  selectFeedType: 'Select feed type',
  ingredient: 'Ingredient',
  inclusionPercent: '% Inclusion',
  pricePerKg: 'Price /kg',
  total: 'Total',
  save: 'Save',
  formulas: 'Formulas',
  exportPdf: 'Export PDF',
  reset: 'Reset',
  calculate: 'Calculate',
  formulation: 'Formulation',
  analysis: 'Analysis',
  nutritionalAnalysis: 'Nutritional analysis',
  conform: 'Compliant',
  tolerance: 'Tolerance',
  outOfRange: 'Out of range',
  inRange: 'Within range',
  tolerancePercent: 'Tolerance ±8%',
  outOfNorm: 'Out of standard',
  norm: 'Standard',
  analysisPlaceholder: 'The nutritional analysis will appear after clicking "Calculate".',
  analyzingFormula: 'Analyzing formula...',
  bag50kg: '50 kg bag price',
  saveFormula: 'Save formula',
  formulaName: 'Formula name',
  savedFormulas: 'Saved formulas',
  noSavedFormulas: 'No saved formulas yet.',
  load: 'Load',
  cancel: 'Cancel',
  connectedAccount: 'Connected account',
  user: 'User',
  notifications: 'Notifications',
  enabled: 'Enabled',
  language: 'Language',
  privacy: 'Privacy',
  privacyDesc: 'Your data is private',
  installApp: 'Install the app',
  install: 'Install',
  logout: 'Log out',
  pravetPlus: 'PRAVET PLUS',
  companyInfo: 'Company information',
  address: 'Address',
  addressValue: 'Benin, Zinvié',
  ifu: 'Tax ID (IFU)',
  phoneWhatsapp: 'Phone (WhatsApp & calls)',
  youtube: 'YouTube',
  aboutApp: 'About the app',
  aboutAppDesc: 'Feed Formular is a mobile app designed by PRAVET PLUS to help poultry farmers formulate their feed with precision. It calculates production cost, analyzes the nutritional value of formulas and compares them with recommended standards — all directly on your phone, on the farm.',
  copyright: '© 2026 PRAVET PLUS — All rights reserved',
  whyUseful: 'Why Feed Formular is useful',
  usefulIntro1: 'For a poultry farmer, feed represents 60 to 70% of total production cost. A well-balanced formula both reduces costs and improves growth and laying performance.',
  usefulIntro2: 'With',
  usefulList1: 'Calculate your feed cost per kg and per 50 kg bag in real time',
  usefulList2: 'Check that your formula covers nutritional needs (protein, energy, calcium, amino acids...)',
  usefulList3: 'Detect deficiencies or excesses with a simple color code: green, orange, red',
  usefulList4: 'Test several ingredient combinations to find the most economical formula',
  usefulList5: 'Work offline, directly on the farm, without depending on an internet connection',
  usefulOutro: 'No more complex spreadsheets or error-prone manual calculations: the app automatically performs the weighted nutritional calculations from each ingredient\'s values.',
  feature1Title: 'Production cost calculation',
  feature1Text: 'Instantly get the price per kg and per 50 kg bag from your ingredient prices and inclusion percentages.',
  feature2Title: 'Automatic nutritional analysis',
  feature2Text: 'Automatically compare your formulas with the nutritional standards of each poultry feed type (protein, energy, calcium, amino acids...).',
  feature3Title: '28 built-in ingredients',
  feature3Text: 'Corn, sorghum, soy, concentrates, oils, minerals... all ingredients with their nutritional values ready to use.',
  feature4Title: 'Color-coded quality control',
  feature4Text: 'Green/orange/red color code to quickly spot deviations from recommended standards and fix your formula.',
  feature5Title: 'Designed for farmers',
  feature5Text: 'Simple interface, mobile-optimized, built for the field and real farm conditions.',
  footer: 'Feed Formular — PRAVET PLUS, Benin, Zinvié | +229 01 61 37 09 79',
  reportTitle: 'Poultry Feed Formulation Report',
  partialCost: 'Partial cost',
  nutrientValue: 'Value',
  normMin: 'Min standard',
  normMax: 'Max standard',
  status: 'Status',
  totalNorms: 'Total standards',
  forgotPassword: 'Forgot password?',
  forgotPasswordTitle: 'Reset password',
  forgotPasswordPrompt: 'Enter your email address. You will receive a link to create a new password.',
  sendResetLink: 'Send link',
  resetLinkSent: 'Link sent',
  resetLinkSentDesc: 'An email with a reset link has been sent to',
  backToLogin: 'Back to login',
  resetPasswordTitle: 'New password',
  resetPasswordPrompt: 'Choose a new password for your account.',
  newPassword: 'New password',
  confirmNewPassword: 'Confirm new password',
  updatePassword: 'Update password',
  passwordUpdated: 'Password updated',
  passwordUpdatedDesc: 'Your password has been changed successfully. You can now sign in with your new password.',
  passwordsMatchError: 'Passwords do not match.',
  currency: 'Currency',
  currencyLabel: 'Currency',
  myProfile: 'My profile',
  profileInfo: 'Personal information',
  editProfile: 'Edit profile',
  saveProfile: 'Save profile',
  profileUpdated: 'Profile updated successfully.',
  profileUpdateError: 'Error updating profile.',
  memberSince: 'Member since',
  privacyTitle: 'Privacy and data protection',
  privacyIntro: 'At PRAVET PLUS, we take the protection of your personal data very seriously. This policy explains what data we collect, how we use it and what your rights are.',
  privacyDataCollection: 'Data collected',
  privacyDataCollectionDesc: 'When creating your account, we collect your last name, first name, country, city, phone number and email address. This information is required to identify your account and personalize your experience.',
  privacyDataUsage: 'Data usage',
  privacyDataUsageDesc: 'Your data is used only for the operation of the Feed Formular app: profile management, saving your feed formulas and nutritional calculations. We never sell or share your data with third parties.',
  privacyDataStorage: 'Storage and security',
  privacyDataStorageDesc: 'Your data is stored securely on our servers with end-to-end encryption. Each user can only access their own data thanks to strict security policies.',
  privacyUserRights: 'Your rights',
  privacyUserRightsDesc: 'You have the right to access, modify and delete your personal data. You can edit your profile at any time from the settings, or log out to end your session.',
  privacyContact: 'Contact us',
  privacyContactDesc: 'For any question about your personal data, you can reach us via WhatsApp or by phone at +229 01 61 37 09 79, or by email at the address listed in the About section.',
  notificationsOn: 'Enabled',
  notificationsOff: 'Disabled',
  notificationsDisabled: 'Disabled',
  profilePhoto: 'Profile photo',
  changePhoto: 'Change photo',
  photoUpdated: 'Profile photo updated.',
  photoUpdateError: 'Error uploading the photo.',
  shareFormula: 'Share formula',
  shareApp: 'Share the app',
  shareAppDesc: 'Share Feed Formular with your friends and fellow farmers',
  copyLink: 'Copy link',
  linkCopied: 'Link copied!',
  shareVia: 'Share via...',
  choosePlan: 'Choose your plan',
  choosePlanDesc: 'Enjoy all Feed Formular features',
  paymentMethod: 'Payment method',
  payNow: 'Pay now',
  processingPayment: 'Processing payment...',
  paymentSuccess: 'Payment successful!',
  paymentSuccessDesc: 'Your subscription is active. You can now access formulation.',
  redirectingToFormulation: 'Redirecting to formulation...',
  continueToFormulation: 'Continue to formulation',
  trialActive: 'Free trial active — {days} days left',
  adminAccess: 'Administrator access — all features unlocked',
  popular: 'Popular',
  paymentSecure: 'Secure payment. Your data is protected.',
  subscriptionExpired: 'Your subscription has expired. Renew to keep using the calculator.',
  subscribeNow: 'Subscribe',
  subscribeToCalculate: 'Subscribe to use the calculator',
  adminLogin: 'Administrator login',
  adminLoginDesc: 'Access reserved for DJAGOUN NICAISE',
  adminPanel: 'Admin panel',
  updateVersion: 'App version',
  forceUpdate: 'Force update',
  updateMessage: 'Update message',
  saveConfig: 'Save configuration',
  configSaved: 'Configuration saved. Users will see the update notification.',
  configSaveError: 'Error saving the configuration.',
  updateAvailable: 'Update available',
  updateNow: 'Update',
  later: 'Later',
  subscription: 'Subscription',
  subscriptionStatus: 'Subscription status',
  daysLeft: 'days left',
  expired: 'Expired',
  active: 'Active',
  trial: 'Free trial',
  paid: 'Paid',
  freeLimitReached: 'Free limit reached',
  freeLimitDesc: 'You have used your 3 free trials. Choose a subscription to keep using the calculator.',
  freeTrialsLeft: 'Free trials left: {n}/3',
  plan24h: '24 hours',
  plan3days: '3 days',
  plan7days: '7 days',
  plan14days: '14 days',
  plan30days: '1 month (30 days)',
  subscriptionTimeLeft: 'Active subscription: {time}',
  noTrialsLeft: '0 free trials left',
  demo: 'View demo',
  demoTitle: 'User guide',
  demoIntro: 'Discover in 6 steps how to formulate your feed with Feed Formular.',
  demoStep1Title: '1. Choose the feed type',
  demoStep1Text: 'On the formulation screen, open the "Feed type" menu and select the category suited to your birds (broiler starter, layer 1, pullet, etc.). The matching nutritional standards will be used for the analysis.',
  demoStep2Title: '2. Enter ingredients and percentages',
  demoStep2Text: 'For each ingredient in the list (corn, bran, soybean meal, concentrate...), enter its inclusion percentage. The total must reach 100%: the indicator at the top of the screen turns green when it does.',
  demoStep3Title: '3. Enter the prices',
  demoStep3Text: 'Enter the price per kilogram of each ingredient you use. You can change the currency (FCFA, dollar, euro) in the settings.',
  demoStep4Title: '4. Calculate',
  demoStep4Text: 'Press the "Calculate" button. The app immediately shows your formula\'s cost per kg and per 50 kg bag, along with the full nutritional analysis.',
  demoStep5Title: '5. Check the analysis and follow the recommendations',
  demoStep5Text: 'Compare each value against the standards using the color code: green = compliant, orange = within tolerance (±8%), red = out of standard. Below the table, smart recommendations appear: the app tells you which ingredients to add or reduce, without worsening another deviation. Recalculate after adjusting.',
  demoStep6Title: '6. Save and export',
  demoStep6Text: 'Save your formula with a name to find it later, share it via WhatsApp, or export it as a PDF to print. Your formulas are available in the "Formulas" tab.',
  demoPrev: 'Previous',
  demoNext: 'Next',
  demoFinish: 'Finish',
  demoClose: 'Close',
  demoStepOf: 'Step {current} of {total}',
  demoVideo: 'Video demo',
  demoVideoTagline: 'Watch the app in action',
  demoReplay: 'Replay video',
  clientName: 'Client name',
  interpretation: 'Recommendations',
  interpretationPlaceholder: 'Recommendations unavailable. Make sure the feed type is selected and the total reaches 100%.',
};

const translations: Record<Language, Translations> = { fr, en };

const LANG_KEY = 'feed_formular_language';

type I18nContextValue = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'fr' || saved === 'en') return saved;
    } catch { /* ignore */ }
    return 'fr';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch { /* ignore */ }
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let str = translations[lang][key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
