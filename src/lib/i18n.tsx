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
};

const translations = fr;

type I18nContextValue = {
  lang: 'fr';
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  let str = translations[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

const i18nValue: I18nContextValue = {
  lang: 'fr',
  t: translate,
};

export function useI18n(): I18nContextValue {
  return i18nValue;
}

export type { TranslationKey };
