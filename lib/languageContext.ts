import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'de' | 'rs' | 'it' | 'fr' | 'es' | 'pt' | 'jp';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  emoji: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', emoji: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪', emoji: '🇩🇪' },
  { code: 'rs', name: 'Serbian', flag: '🇷🇸', emoji: '🇷🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', emoji: '🇮🇹' },
  { code: 'fr', name: 'French', flag: '🇫🇷', emoji: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', emoji: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', emoji: '🇵🇹' },
  { code: 'jp', name: 'Japanese', flag: '🇯🇵', emoji: '🇯🇵' },
];

export interface Translation {
  [key: string]: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    'welcome.title': 'Welcome to GRP Database',
    'welcome.description': 'GRP Database is an unofficial community hub designed to make GTA Roleplay easier and more enjoyable. Our goal is to gather valuable information in one place — from item values and clothing options to beginner tips and guides — helping players quickly find what they need while playing on the server.',
    'welcome.disclaimer': 'GRP Database is NOT official or affiliated with the developers of the game.',
    'admin.access': 'Admin Access',
    'admin.panel': 'Admin Panel',
    'admin.login': 'Admin Login',
    'admin.description': 'You are currently logged in as an administrator. Access the admin panel to manage the database and system settings.',
    'admin.login_description': 'Are you an administrator? Access the admin panel to manage the database and system settings.',
    'values.title': 'Item Values',
    'values.description': 'Find current market values for vehicles, clothing, and items.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Track your battlepass progress and rewards.',
    'beginner.title': 'Beginner Help',
    'beginner.description': 'Essential guides for new players.',
    'bunker.title': 'Bunker Help',
    'bunker.description': 'Bunker management and optimization guides.',
    'events.title': 'Events',
    'events.description': 'Server events and activities.',
    'lifeinvader.title': 'LifeInvader Templates',
    'lifeinvader.description': 'Pre-formatted ad templates for LifeInvader.',
    'improvements.title': 'Improvements',
    'improvements.description': 'Suggest improvements and report bugs.',
    'suggestions.title': 'Suggestions',
    'suggestions.description': 'Submit your suggestions for the database.',
    'treasure.title': 'Treasure Helper',
    'treasure.description': 'Find treasure locations and rewards.',
    'pet.title': 'Pet Timer',
    'pet.description': 'Track your pet feeding schedule.',
    'ai.format_my_ad': 'Format My Ad',
    'ai.description': 'Use AI to format your ads according to policy.',
  },
  de: {
    'welcome.title': 'Willkommen bei GRP Database',
    'welcome.description': 'GRP Database ist ein inoffizieller Community-Hub, der GTA Roleplay einfacher und unterhaltsamer machen soll. Unser Ziel ist es, wertvolle Informationen an einem Ort zu sammeln — von Artikelwerten und Kleidungsoptionen bis hin zu Anfängertipps und Leitfäden — um Spielern zu helfen, schnell zu finden, was sie beim Spielen auf dem Server benötigen.',
    'welcome.disclaimer': 'GRP Database ist NICHT offiziell oder mit den Entwicklern des Spiels verbunden.',
    'admin.access': 'Admin-Zugang',
    'admin.panel': 'Admin-Panel',
    'admin.login': 'Admin-Anmeldung',
    'admin.description': 'Sie sind als Administrator angemeldet. Greifen Sie auf das Admin-Panel zu, um die Datenbank und Systemeinstellungen zu verwalten.',
    'admin.login_description': 'Sind Sie Administrator? Greifen Sie auf das Admin-Panel zu, um die Datenbank und Systemeinstellungen zu verwalten.',
    'values.title': 'Artikelwerte',
    'values.description': 'Finden Sie aktuelle Marktwerte für Fahrzeuge, Kleidung und Artikel.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Verfolgen Sie Ihren Battlepass-Fortschritt und Belohnungen.',
    'beginner.title': 'Anfängerhilfe',
    'beginner.description': 'Wesentliche Leitfäden für neue Spieler.',
    'bunker.title': 'Bunker-Hilfe',
    'bunker.description': 'Bunker-Management und Optimierungsleitfäden.',
    'events.title': 'Veranstaltungen',
    'events.description': 'Server-Events und Aktivitäten.',
    'lifeinvader.title': 'LifeInvader Vorlagen',
    'lifeinvader.description': 'Vorgefertigte Anzeigenvorlagen für LifeInvader.',
    'improvements.title': 'Verbesserungen',
    'improvements.description': 'Schlagen Sie Verbesserungen vor und melden Sie Bugs.',
    'suggestions.title': 'Vorschläge',
    'suggestions.description': 'Reichen Sie Ihre Vorschläge für die Datenbank ein.',
    'treasure.title': 'Schatzhelfer',
    'treasure.description': 'Finden Sie Schatzstandorte und Belohnungen.',
    'pet.title': 'Haustier-Timer',
    'pet.description': 'Verfolgen Sie Ihren Haustierfütterungsplan.',
    'ai.format_my_ad': 'Meine Anzeige formatieren',
    'ai.description': 'Verwenden Sie KI, um Ihre Anzeigen nach Richtlinien zu formatieren.',
  },
  rs: {
    'welcome.title': 'Добродошао у GRP Database',
    'welcome.description': 'GRP Database је незванични заједнички центар дизајниран да учини GTA Roleplay лакшим и пријатнијим. Наш циљ је да прикупимо вредне информације на једном месту — од вредности предмета и опција одеће до савета за почетнике и водича — помажући играчима да брзо пронађу оно што им треба док играју на серверу.',
    'welcome.disclaimer': 'GRP Database НИЈЕ званичан или повезан са програмерима игре.',
    'admin.access': 'Admin Приступ',
    'admin.panel': 'Admin Панел',
    'admin.login': 'Admin Пријава',
    'admin.description': 'Тренутно сте пријављени као администратор. Приступите admin панелу да управљате базом података и системским подешавањима.',
    'admin.login_description': 'Да ли сте администратор? Приступите admin панелу да управљате базом података и системским подешавањима.',
    'values.title': 'Вредности Предмета',
    'values.description': 'Пронађите тренутне тржишне вредности за возила, одећу и предмете.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Пратите свој battlepass напредак и награде.',
    'beginner.title': 'Помоћ за Почетнике',
    'beginner.description': 'Основни водичи за нове играче.',
    'bunker.title': 'Помоћ за Бункер',
    'bunker.description': 'Водичи за управљање бункером и оптимизацију.',
    'events.title': 'Догађаји',
    'events.description': 'Серверски догађаји и активности.',
    'lifeinvader.title': 'LifeInvader Шаблони',
    'lifeinvader.description': 'Унапред форматирани шаблони огласа за LifeInvader.',
    'improvements.title': 'Побољшања',
    'improvements.description': 'Предложите побољшања и пријавите грешке.',
    'suggestions.title': 'Предлози',
    'suggestions.description': 'Пошаљите своје предлоге за базу података.',
    'treasure.title': 'Помоћник за Благо',
    'treasure.description': 'Пронађите локације блага и награде.',
    'pet.title': 'Таймер за Љубимце',
    'pet.description': 'Пратите свој распоред храњења љубимаца.',
    'ai.format_my_ad': 'Форматирај мој оглас',
    'ai.description': 'Користите АИ да форматирате своје огласе према политици.',
  },
  it: {
    'welcome.title': 'Benvenuto in GRP Database',
    'welcome.description': 'GRP Database è un hub comunitario non ufficiale progettato per rendere GTA Roleplay più facile e divertente. Il nostro obiettivo è raccogliere informazioni preziose in un unico posto — dai valori degli oggetti alle opzioni di abbigliamento, dai consigli per principianti alle guide — aiutando i giocatori a trovare rapidamente ciò di cui hanno bisogno mentre giocano sul server.',
    'welcome.disclaimer': 'GRP Database NON è ufficiale o affiliato agli sviluppatori del gioco.',
    'admin.access': 'Accesso Admin',
    'admin.panel': 'Pannello Admin',
    'admin.login': 'Login Admin',
    'admin.description': 'Sei attualmente connesso come amministratore. Accedi al pannello admin per gestire il database e le impostazioni di sistema.',
    'admin.login_description': 'Sei un amministratore? Accedi al pannello admin per gestire il database e le impostazioni di sistema.',
    'values.title': 'Valori Oggetti',
    'values.description': 'Trova i valori di mercato attuali per veicoli, abbigliamento e oggetti.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Traccia i tuoi progressi e ricompense del battlepass.',
    'beginner.title': 'Aiuto Principianti',
    'beginner.description': 'Guide essenziali per nuovi giocatori.',
    'bunker.title': 'Aiuto Bunker',
    'bunker.description': 'Guide per la gestione e ottimizzazione del bunker.',
    'events.title': 'Eventi',
    'events.description': 'Eventi e attività del server.',
    'lifeinvader.title': 'Modelli LifeInvader',
    'lifeinvader.description': 'Modelli di annunci pre-formattati per LifeInvader.',
    'improvements.title': 'Miglioramenti',
    'improvements.description': 'Suggerisci miglioramenti e segnala bug.',
    'suggestions.title': 'Suggerimenti',
    'suggestions.description': 'Invia i tuoi suggerimenti per il database.',
    'treasure.title': 'Helper Tesoro',
    'treasure.description': 'Trova le posizioni dei tesori e le ricompense.',
    'pet.title': 'Timer Animale',
    'pet.description': 'Traccia il tuo programma di alimentazione degli animali.',
    'ai.format_my_ad': 'Formatta il mio annuncio',
    'ai.description': 'Usa l\'AI per formattare i tuoi annunci secondo le politiche.',
  },
  fr: {
    'welcome.title': 'Bienvenue sur GRP Database',
    'welcome.description': 'GRP Database est un hub communautaire non officiel conçu pour rendre GTA Roleplay plus facile et plus agréable. Notre objectif est de rassembler des informations précieuses en un seul endroit — des valeurs d\'articles aux options de vêtements, des conseils pour débutants aux guides — aidant les joueurs à trouver rapidement ce dont ils ont besoin en jouant sur le serveur.',
    'welcome.disclaimer': 'GRP Database N\'EST PAS officiel ou affilié aux développeurs du jeu.',
    'admin.access': 'Accès Admin',
    'admin.panel': 'Panneau Admin',
    'admin.login': 'Connexion Admin',
    'admin.description': 'Vous êtes actuellement connecté en tant qu\'administrateur. Accédez au panneau admin pour gérer la base de données et les paramètres système.',
    'admin.login_description': 'Êtes-vous administrateur? Accédez au panneau admin pour gérer la base de données et les paramètres système.',
    'values.title': 'Valeurs Objets',
    'values.description': 'Trouvez les valeurs de marché actuelles pour les véhicules, vêtements et objets.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Suivez vos progrès et récompenses du battlepass.',
    'beginner.title': 'Aide Débutant',
    'beginner.description': 'Guides essentiels pour les nouveaux joueurs.',
    'bunker.title': 'Aide Bunker',
    'bunker.description': 'Guides de gestion et d\'optimisation du bunker.',
    'events.title': 'Événements',
    'events.description': 'Événements et activités du serveur.',
    'lifeinvader.title': 'Modèles LifeInvader',
    'lifeinvader.description': 'Modèles d\'annonces pré-formatés pour LifeInvader.',
    'improvements.title': 'Améliorations',
    'improvements.description': 'Suggérez des améliorations et signalez des bugs.',
    'suggestions.title': 'Suggestions',
    'suggestions.description': 'Soumettez vos suggestions pour la base de données.',
    'treasure.title': 'Helper Trésor',
    'treasure.description': 'Trouvez les emplacements de trésors et récompenses.',
    'pet.title': 'Minuteur Animal',
    'pet.description': 'Suivez votre planning d\'alimentation des animaux.',
    'ai.format_my_ad': 'Formater mon annonce',
    'ai.description': 'Utilisez l\'IA pour formater vos annonces selon les politiques.',
  },
  es: {
    'welcome.title': 'Bienvenido a GRP Database',
    'welcome.description': 'GRP Database es un centro comunitario no oficial diseñado para hacer GTA Roleplay más fácil y agradable. Nuestro objetivo es recopilar información valiosa en un solo lugar — desde valores de artículos y opciones de ropa hasta consejos para principiantes y guías — ayudando a los jugadores a encontrar rápidamente lo que necesitan mientras juegan en el servidor.',
    'welcome.disclaimer': 'GRP Database NO es oficial o afiliado a los desarrolladores del juego.',
    'admin.access': 'Acceso Admin',
    'admin.panel': 'Panel Admin',
    'admin.login': 'Inicio de Sesión Admin',
    'admin.description': 'Actualmente estás conectado como administrador. Accede al panel admin para gestionar la base de datos y configuraciones del sistema.',
    'admin.login_description': '¿Eres administrador? Accede al panel admin para gestionar la base de datos y configuraciones del sistema.',
    'values.title': 'Valores de Artículos',
    'values.description': 'Encuentra los valores de mercado actuales para vehículos, ropa y artículos.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Rastrea tu progreso y recompensas del battlepass.',
    'beginner.title': 'Ayuda para Principiantes',
    'beginner.description': 'Guías esenciales para nuevos jugadores.',
    'bunker.title': 'Ayuda Bunker',
    'bunker.description': 'Guías de gestión y optimización del bunker.',
    'events.title': 'Eventos',
    'events.description': 'Eventos y actividades del servidor.',
    'lifeinvader.title': 'Plantillas LifeInvader',
    'lifeinvader.description': 'Plantillas de anuncios pre-formateadas para LifeInvader.',
    'improvements.title': 'Mejoras',
    'improvements.description': 'Sugiere mejoras y reporta errores.',
    'suggestions.title': 'Sugerencias',
    'suggestions.description': 'Envía tus sugerencias para la base de datos.',
    'treasure.title': 'Helper Tesoro',
    'treasure.description': 'Encuentra ubicaciones de tesoros y recompensas.',
    'pet.title': 'Timer Mascota',
    'pet.description': 'Rastrea tu horario de alimentación de mascotas.',
    'ai.format_my_ad': 'Formatear mi anuncio',
    'ai.description': 'Usa IA para formatear tus anuncios según las políticas.',
  },
  pt: {
    'welcome.title': 'Bem-vindo ao GRP Database',
    'welcome.description': 'GRP Database é um centro comunitário não oficial projetado para tornar GTA Roleplay mais fácil e agradável. Nosso objetivo é reunir informações valiosas em um só lugar — desde valores de itens e opções de roupas até dicas para iniciantes e guias — ajudando os jogadores a encontrar rapidamente o que precisam enquanto jogam no servidor.',
    'welcome.disclaimer': 'GRP Database NÃO é oficial ou afiliado aos desenvolvedores do jogo.',
    'admin.access': 'Acesso Admin',
    'admin.panel': 'Painel Admin',
    'admin.login': 'Login Admin',
    'admin.description': 'Você está atualmente conectado como administrador. Acesse o painel admin para gerenciar o banco de dados e configurações do sistema.',
    'admin.login_description': 'Você é administrador? Acesse o painel admin para gerenciar o banco de dados e configurações do sistema.',
    'values.title': 'Valores de Itens',
    'values.description': 'Encontre os valores de mercado atuais para veículos, roupas e itens.',
    'battlepass.title': 'Battlepass',
    'battlepass.description': 'Acompanhe seu progresso e recompensas do battlepass.',
    'beginner.title': 'Ajuda para Iniciantes',
    'beginner.description': 'Guias essenciais para novos jogadores.',
    'bunker.title': 'Ajuda Bunker',
    'bunker.description': 'Guias de gerenciamento e otimização do bunker.',
    'events.title': 'Eventos',
    'events.description': 'Eventos e atividades do servidor.',
    'lifeinvader.title': 'Modelos LifeInvader',
    'lifeinvader.description': 'Modelos de anúncios pré-formatados para LifeInvader.',
    'improvements.title': 'Melhorias',
    'improvements.description': 'Sugira melhorias e reporte bugs.',
    'suggestions.title': 'Sugestões',
    'suggestions.description': 'Envie suas sugestões para o banco de dados.',
    'treasure.title': 'Helper Tesouro',
    'treasure.description': 'Encontre locais de tesouros e recompensas.',
    'pet.title': 'Timer Animal',
    'pet.description': 'Acompanhe seu cronograma de alimentação de animais.',
    'ai.format_my_ad': 'Formatar meu anúncio',
    'ai.description': 'Use IA para formatar seus anúncios de acordo com as políticas.',
  },
  jp: {
    'welcome.title': 'GRP Databaseへようこそ',
    'welcome.description': 'GRP Databaseは、GTAロールプレイをより簡単で楽しいものにするために設計された非公式のコミュニティハブです。私たちの目標は、アイテムの価値や衣装オプションから初心者向けのヒントやガイドまで、価値ある情報を一箇所に集めることです。プレイヤーがサーバーでプレイしている間に必要なものを素早く見つけられるよう支援します。',
    'welcome.disclaimer': 'GRP Databaseは公式ではなく、ゲームの開発者とも提携していません。',
    'admin.access': '管理者アクセス',
    'admin.panel': '管理者パネル',
    'admin.login': '管理者ログイン',
    'admin.description': '現在管理者としてログインしています。データベースとシステム設定を管理するには管理者パネルにアクセスしてください。',
    'admin.login_description': 'あなたは管理者ですか？データベースとシステム設定を管理するには管理者パネルにアクセスしてください。',
    'values.title': 'アイテム価値',
    'values.description': '車両、衣装、アイテムの現在の市場価値を確認してください。',
    'battlepass.title': 'バトルパス',
    'battlepass.description': 'バトルパスの進捗と報酬を追跡してください。',
    'beginner.title': '初心者ヘルプ',
    'beginner.description': '新しいプレイヤー向けの基本ガイド。',
    'bunker.title': 'バンカーへルプ',
    'bunker.description': 'バンカー管理と最適化ガイド。',
    'events.title': 'イベント',
    'events.description': 'サーバーイベントとアクティビティ。',
    'lifeinvader.title': 'LifeInvaderテンプレート',
    'lifeinvader.description': 'LifeInvader用の事前フォーマット済み広告テンプレート。',
    'improvements.title': '改善',
    'improvements.description': '改善を提案し、バグを報告してください。',
    'suggestions.title': '提案',
    'suggestions.description': 'データベースへの提案を送信してください。',
    'treasure.title': 'トレジャーヘルパー',
    'treasure.description': '宝物の場所と報酬を見つけてください。',
    'pet.title': 'ペットタイマー',
    'pet.description': 'ペットの餌やりスケジュールを追跡してください。',
    'ai.format_my_ad': '広告をフォーマット',
    'ai.description': 'AIを使用して政策に従って広告をフォーマットしてください。',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('grp-language') as Language;
    if (savedLanguage && LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    const supportedBrowserLang = LANGUAGES.find(lang =>
      browserLang === lang.code ||
      (browserLang === 'pt' && lang.code === 'pt') ||
      (browserLang === 'zh' && lang.code === 'jp')
    )?.code;

    if (supportedBrowserLang) {
      setLanguage(supportedBrowserLang);
      return;
    }

    setLanguage('en');
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('grp-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
