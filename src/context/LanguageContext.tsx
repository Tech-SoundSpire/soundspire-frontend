'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
    { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
    { code: 'fr', label: 'French', nativeLabel: 'Français' },
    { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
    { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
] as const;

export type LangCode = typeof SUPPORTED_LANGUAGES[number]['code'];

type Translations = Record<string, Record<LangCode, string>>;

const translations: Translations = {
    // Navbar
    'Explore':        { en: 'Explore',       ja: '探索',         ko: '탐색',       fr: 'Explorer',    de: 'Entdecken',  es: 'Explorar',   hi: 'खोजें' },
    'Feed':           { en: 'Feed',          ja: 'フィード',      ko: '피드',       fr: 'Fil',         de: 'Feed',       es: 'Inicio',     hi: 'फ़ीड' },
    'My Music':       { en: 'My Music',      ja: '私の音楽',      ko: '내 음악',    fr: 'Ma Musique',  de: 'Meine Musik',es: 'Mi Música',  hi: 'मेरा संगीत' },
    'My Communities': { en: 'My Communities',ja: 'コミュニティ',  ko: '내 커뮤니티', fr: 'Communautés', de: 'Communities',es: 'Comunidades',hi: 'समुदाय' },
    'Reviews':        { en: 'Reviews',       ja: 'レビュー',      ko: '리뷰',       fr: 'Avis',        de: 'Bewertungen',es: 'Reseñas',    hi: 'समीक्षाएं' },
    'Notifications':  { en: 'Notifications', ja: '通知',          ko: '알림',       fr: 'Notifications',de: 'Benachrichtigungen', es: 'Notificaciones', hi: 'सूचनाएं' },
    'Profile':        { en: 'Profile',       ja: 'プロフィール',  ko: '프로필',     fr: 'Profil',      de: 'Profil',     es: 'Perfil',     hi: 'प्रोफ़ाइल' },
    'Settings':       { en: 'Settings',      ja: '設定',          ko: '설정',       fr: 'Paramètres',  de: 'Einstellungen', es: 'Ajustes', hi: 'सेटिंग्स' },
    'Switch to Fan':  { en: 'Switch to Fan', ja: 'ファンに切替',  ko: '팬으로 전환', fr: 'Mode Fan',    de: 'Fan-Modus',  es: 'Modo Fan',   hi: 'फैन मोड' },
    'Switch to Artist':{ en: 'Switch to Artist', ja: 'アーティストに切替', ko: '아티스트로 전환', fr: 'Mode Artiste', de: 'Künstler-Modus', es: 'Modo Artista', hi: 'कलाकार मोड' },
    // Mobile nav
    'Communities':    { en: 'Communities',   ja: 'コミュニティ',  ko: '커뮤니티',   fr: 'Communautés', de: 'Communities',es: 'Comunidades',hi: 'समुदाय' },
    'Alerts':         { en: 'Alerts',        ja: '通知',          ko: '알림',       fr: 'Alertes',     de: 'Benachrichtigungen', es: 'Alertas', hi: 'अलर्ट' },
    // Settings page
    'Read it your way': { en: 'Read it your way', ja: '言語を選択', ko: '언어 선택', fr: 'Choisir la langue', de: 'Sprache wählen', es: 'Elige tu idioma', hi: 'भाषा चुनें' },
    'Select your language': { en: 'Select your language', ja: '言語を選択してください', ko: '언어를 선택하세요', fr: 'Sélectionnez votre langue', de: 'Sprache auswählen', es: 'Selecciona tu idioma', hi: 'अपनी भाषा चुनें' },
    // Explore
    'SUGGESTED ARTISTS': { en: 'SUGGESTED ARTISTS', ja: 'おすすめアーティスト', ko: '추천 아티스트', fr: 'ARTISTES SUGGÉRÉS', de: 'VORGESCHLAGENE KÜNSTLER', es: 'ARTISTAS SUGERIDOS', hi: 'सुझाए गए कलाकार' },
    'REVIEWS':           { en: 'REVIEWS',           ja: 'レビュー',            ko: '리뷰',           fr: 'AVIS',              de: 'BEWERTUNGEN',              es: 'RESEÑAS',            hi: 'समीक्षाएं' },
    'GENRES':            { en: 'GENRES',            ja: 'ジャンル',            ko: '장르',           fr: 'GENRES',            de: 'GENRES',                  es: 'GÉNEROS',            hi: 'शैलियां' },
    'See More':          { en: 'See More',          ja: 'もっと見る',          ko: '더 보기',        fr: 'Voir plus',         de: 'Mehr sehen',              es: 'Ver más',            hi: 'और देखें' },
    'Show Less':         { en: 'Show Less',         ja: '少なく表示',          ko: '접기',           fr: 'Voir moins',        de: 'Weniger anzeigen',        es: 'Ver menos',          hi: 'कम दिखाएं' },
    'See All':           { en: 'See All',           ja: 'すべて見る',          ko: '전체 보기',      fr: 'Tout voir',         de: 'Alle anzeigen',           es: 'Ver todo',           hi: 'सब देखें' },
    'Read More':         { en: 'Read More',         ja: '続きを読む',          ko: '더 읽기',        fr: 'Lire plus',         de: 'Mehr lesen',              es: 'Leer más',           hi: 'और पढ़ें' },
    // Notifications
    'Today':             { en: 'Today',             ja: '今日',               ko: '오늘',           fr: "Aujourd'hui",       de: 'Heute',                   es: 'Hoy',                hi: 'आज' },
    'This Week':         { en: 'This Week',         ja: '今週',               ko: '이번 주',        fr: 'Cette semaine',     de: 'Diese Woche',             es: 'Esta semana',        hi: 'इस सप्ताह' },
    'Earlier':           { en: 'Earlier',           ja: '以前',               ko: '이전',           fr: 'Plus tôt',          de: 'Früher',                  es: 'Antes',              hi: 'पहले' },
    'No notifications':  { en: 'No notifications',  ja: '通知なし',            ko: '알림 없음',      fr: 'Aucune notification',de: 'Keine Benachrichtigungen',es: 'Sin notificaciones', hi: 'कोई सूचना नहीं' },
    // Feed
    'No posts yet':      { en: 'No posts yet',      ja: '投稿なし',            ko: '게시물 없음',    fr: 'Aucune publication', de: 'Keine Beiträge',          es: 'Sin publicaciones',  hi: 'कोई पोस्ट नहीं' },
    // Reviews
    'Submit Review':     { en: 'Submit Review',     ja: 'レビューを投稿',      ko: '리뷰 작성',      fr: 'Soumettre un avis', de: 'Bewertung einreichen',    es: 'Enviar reseña',      hi: 'समीक्षा सबमिट करें' },
    // Communities
    'Search Results':    { en: 'Search Results',    ja: '検索結果',            ko: '검색 결과',      fr: 'Résultats',         de: 'Suchergebnisse',          es: 'Resultados',         hi: 'खोज परिणाम' },
    'Go to Community':   { en: 'Go to Community',   ja: 'コミュニティへ',      ko: '커뮤니티 이동',  fr: 'Voir la communauté',de: 'Zur Community',           es: 'Ir a comunidad',     hi: 'समुदाय पर जाएं' },
    'No Communities Found.': { en: 'No Communities Found.', ja: 'コミュニティなし', ko: '커뮤니티 없음', fr: 'Aucune communauté', de: 'Keine Communities', es: 'Sin comunidades', hi: 'कोई समुदाय नहीं' },
    'Search all communities...': { en: 'Search all communities...', ja: 'コミュニティを検索...', ko: '커뮤니티 검색...', fr: 'Rechercher...', de: 'Suchen...', es: 'Buscar comunidades...', hi: 'समुदाय खोजें...' },
    'Search posts...':   { en: 'Search posts...', ja: '投稿を検索...', ko: '게시물 검색...', fr: 'Rechercher...', de: 'Beiträge suchen...', es: 'Buscar publicaciones...', hi: 'पोस्ट खोजें...' },
    'Edit Profile':      { en: 'Edit Profile',      ja: 'プロフィール編集',    ko: '프로필 편집',    fr: 'Modifier le profil',de: 'Profil bearbeiten',       es: 'Editar perfil',      hi: 'प्रोफ़ाइल संपादित करें' },
    'Save Edits':        { en: 'Save Edits',        ja: '保存',               ko: '저장',           fr: 'Enregistrer',       de: 'Speichern',               es: 'Guardar',            hi: 'सहेजें' },
    'Saving...':         { en: 'Saving...',         ja: '保存中...',           ko: '저장 중...',     fr: 'Enregistrement...', de: 'Speichern...',            es: 'Guardando...',       hi: 'सहेज रहे हैं...' },
    'Validating...':     { en: 'Validating...',     ja: '確認中...',           ko: '확인 중...',     fr: 'Validation...',     de: 'Validierung...',          es: 'Validando...',       hi: 'सत्यापित हो रहा है...' },
    'Cancel':            { en: 'Cancel',            ja: 'キャンセル',          ko: '취소',           fr: 'Annuler',           de: 'Abbrechen',               es: 'Cancelar',           hi: 'रद्द करें' },
    'Logout':            { en: 'Logout',            ja: 'ログアウト',          ko: '로그아웃',       fr: 'Déconnexion',       de: 'Abmelden',                es: 'Cerrar sesión',      hi: 'लॉग आउट' },
    'Change':            { en: 'Change',            ja: '変更',               ko: '변경',           fr: 'Changer',           de: 'Ändern',                  es: 'Cambiar',            hi: 'बदलें' },
    'My Subscriptions':  { en: 'My Subscriptions',  ja: 'サブスクリプション',  ko: '내 구독',        fr: 'Mes abonnements',   de: 'Meine Abonnements',       es: 'Mis suscripciones',  hi: 'मेरी सदस्यताएं' },
    // Community header nav
    'Home':              { en: 'Home',              ja: 'ホーム',             ko: '홈',             fr: 'Accueil',           de: 'Startseite',              es: 'Inicio',             hi: 'होम' },
    'About':             { en: 'About',             ja: '概要',               ko: '소개',           fr: 'À propos',          de: 'Über',                    es: 'Acerca de',          hi: 'परिचय' },
    'Artist Forum':      { en: 'Artist Forum',      ja: 'アーティストフォーラム', ko: '아티스트 포럼', fr: "Forum d'artiste",   de: 'Künstlerforum',           es: 'Foro del artista',   hi: 'कलाकार फोरम' },
    'All Chat':          { en: 'All Chat',          ja: 'チャット',            ko: '전체 채팅',      fr: 'Discussion',        de: 'Alle Chats',              es: 'Chat general',       hi: 'सभी चैट' },
    'Fan Art':           { en: 'Fan Art',           ja: 'ファンアート',        ko: '팬 아트',        fr: 'Fan Art',           de: 'Fan-Kunst',               es: 'Fan Art',            hi: 'फैन आर्ट' },
    'Suggestions':       { en: 'Suggestions',       ja: '提案',               ko: '제안',           fr: 'Suggestions',       de: 'Vorschläge',              es: 'Sugerencias',        hi: 'सुझाव' },
    // Community about page sections
    'Community Highlights': { en: 'Community Highlights', ja: 'コミュニティハイライト', ko: '커뮤니티 하이라이트', fr: 'Points forts', de: 'Community-Highlights', es: 'Destacados', hi: 'समुदाय की झलकियां' },
    'Reviews by the SoundSpire Team': { en: 'Reviews by the SoundSpire Team', ja: 'SoundSpireチームのレビュー', ko: 'SoundSpire 팀 리뷰', fr: "Avis de l'équipe SoundSpire", de: 'Bewertungen des SoundSpire-Teams', es: 'Reseñas del equipo SoundSpire', hi: 'SoundSpire टीम की समीक्षाएं' },
    'No bio available yet.': { en: 'No bio available yet.', ja: 'まだ自己紹介がありません。', ko: '아직 소개가 없습니다.', fr: 'Pas encore de bio.', de: 'Noch keine Bio verfügbar.', es: 'Aún no hay biografía.', hi: 'अभी तक कोई परिचय नहीं।' },
    'No reviews yet.':   { en: 'No reviews yet.',   ja: 'まだレビューがありません。', ko: '아직 리뷰가 없습니다.', fr: "Pas encore d'avis.", de: 'Noch keine Bewertungen.', es: 'Aún no hay reseñas.', hi: 'अभी तक कोई समीक्षा नहीं।' },
    'Be a part of the TRIBE': { en: 'Be a part of the TRIBE', ja: 'TRIBEの一員になろう', ko: 'TRIBE의 일원이 되세요', fr: 'Rejoignez la TRIBU', de: 'Werde Teil des TRIBE', es: 'Sé parte de la TRIBU', hi: 'TRIBE का हिस्सा बनें' },
    'Get Access to the Screens': { en: 'Get Access to the Screens', ja: 'スクリーンにアクセス', ko: '스크린에 접근하세요', fr: 'Accédez aux Screens', de: 'Zugang zu den Screens', es: 'Accede a las Pantallas', hi: 'स्क्रीन तक पहुंचें' },
    'Tap into the Global Community': { en: 'Tap into the Global Community', ja: 'グローバルコミュニティに参加', ko: '글로벌 커뮤니티에 참여하세요', fr: 'Rejoignez la communauté mondiale', de: 'Globale Community entdecken', es: 'Únete a la comunidad global', hi: 'वैश्विक समुदाय से जुड़ें' },
    'Email':             { en: 'Email',             ja: 'メール',             ko: '이메일',         fr: 'E-mail',            de: 'E-Mail',                  es: 'Correo',             hi: 'ईमेल' },
    'Phone Number':      { en: 'Phone Number',      ja: '電話番号',            ko: '전화번호',       fr: 'Téléphone',         de: 'Telefonnummer',           es: 'Teléfono',           hi: 'फ़ोन नंबर' },
    'Gender':            { en: 'Gender',            ja: '性別',               ko: '성별',           fr: 'Genre',             de: 'Geschlecht',              es: 'Género',             hi: 'लिंग' },
    'City':              { en: 'City',              ja: '都市',               ko: '도시',           fr: 'Ville',             de: 'Stadt',                   es: 'Ciudad',             hi: 'शहर' },
    'Country':           { en: 'Country',           ja: '国',                 ko: '국가',           fr: 'Pays',              de: 'Land',                    es: 'País',               hi: 'देश' },
    'Username':          { en: 'Username',          ja: 'ユーザー名',          ko: '사용자명',       fr: "Nom d'utilisateur", de: 'Benutzername',            es: 'Usuario',            hi: 'उपयोगकर्ता नाम' },
    'Date of Birth':     { en: 'Date of Birth',     ja: '生年月日',            ko: '생년월일',       fr: 'Date de naissance', de: 'Geburtsdatum',            es: 'Fecha de nacimiento',hi: 'जन्म तिथि' },
};

interface LanguageContextType {
    lang: LangCode;
    setLang: (lang: LangCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<LangCode>('en');

    useEffect(() => {
        const stored = localStorage.getItem('ss_lang') as LangCode | null;
        if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
            setLangState(stored);
        }
    }, []);

    const setLang = (l: LangCode) => {
        setLangState(l);
        localStorage.setItem('ss_lang', l);
    };

    const t = (key: string): string => translations[key]?.[lang] ?? key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
