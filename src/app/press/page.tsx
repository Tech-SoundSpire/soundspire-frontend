import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Figtree, IBM_Plex_Mono } from "next/font/google";
import CopyButton from "./CopyButton";
import styles from "./press.module.css";

// Public press kit, ported from "SoundSpire Press Kit.html". The draft's internal banner and
// "Needs:" placeholder blocks (headshot, asset folder link, press email) are left out until
// those assets exist; add them back here when they do.
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-archivo" });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-figtree" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
    title: "Press Kit",
    description:
        "SoundSpire press kit: boilerplate, product overview, founder bio and quote, fact sheet, and brand usage guidelines.",
    alternates: { canonical: "/press" },
};

const UPDATED = "7 October 2026";

const BOILERPLATE_SHORT =
    "SoundSpire is a global music community bringing artists and fans together. Artists create their own community hubs, which fans join to interact with the artist and with each other. Fans can also rate and review music, share fan art, and discover new artists through other listeners rather than algorithms. SoundSpire is available free on Android and web.";
const BOILERPLATE_LONG =
    "SoundSpire is a global music community bringing artists and fans together. Artists create and host official community hubs, where they share exclusive content and talk directly with the people who care most about their work. Fans join the communities of the artists they love, rate and review songs and albums, share fan art, and find new music through other listeners rather than algorithms, an approach closest to Letterboxd for music. Founded by Ashish Paul, SoundSpire is built on the view that artists should own the relationship with their audience instead of renting it from a platform. SoundSpire is available free on Android and web.";
const QUOTE =
    "Artists can have hundreds of thousands of followers and still have no real relationship with any of them. These platforms are built for reach, not for depth, and the moment you stop posting you disappear. SoundSpire exists so artists can build something they actually own, a community that doesn't reset every time an algorithm changes.";

const GLANCE: [string, string][] = [
    ["Public launch", "12 October 2026"],
    ["Platform", "Android and web"],
    ["Category", "Music & Audio, Social"],
    ["Availability", "Global"],
    ["Price", "Free"],
    ["Founder", "Ashish Paul"],
];

const FEATURES: [string, string][] = [
    ["Artist community hubs", "Official spaces where artists build their community, post exclusive content, run forums and open chat, and talk directly with the people who care most about their work. Fans can join for free."],
    ["Reviews and ratings", "Fans rate and review songs and albums, and read what other listeners think. Opinion is treated as a first class part of how music gets found."],
    ["Discovery through people", "Artists, albums and songs surface through genre, taste and other listeners, rather than an algorithmic feed deciding what gets seen."],
    ["Fan art and creative work", "Fans post artwork and creative work inside community spaces, where it stays and accumulates instead of disappearing after 24 hours."],
    ["Built for respectful fandom", "Reporting and blocking throughout, an active moderation team, and community guidelines every member agrees to before taking part."],
];

const FACTS: [string, string][] = [
    ["Product", "SoundSpire"],
    ["What it is", "A global music community bringing artists and fans together, through community hubs, reviews and ratings, and music discovery"],
    ["Public launch", "12 October 2026"],
    ["Platform", "Android and web"],
    ["Category", "Music & Audio, Social"],
    ["Availability", "Global"],
    ["Price", "Free to download and use"],
    ["Founder", "Ashish Paul"],
    ["Website", "soundspire.online"],
    ["Technology partners", "Soundcharts (music data)"],
];

const NAV: [string, string][] = [
    ["glance", "At a glance"], ["about", "Boilerplate"], ["product", "The product"], ["story", "The story"],
    ["founder", "Founder"], ["facts", "Fact sheet"], ["assets", "Brand usage"], ["contact", "Contact"],
];

export default function PressPage() {
    return (
        <div className={`${styles.root} ${archivo.variable} ${figtree.variable} ${plexMono.variable}`}>
            <header className="masthead">
                <div className="wrap">
                    <p className="kicker"><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>SoundSpire</Link> · Press Kit · Updated {UPDATED}</p>
                    <h1 className="wordmark"><span className="s1">Sound</span><span className="s2">Spire</span></h1>
                    <p className="lede">A global music community bringing artists and fans together.</p>
                    <p className="sub">Artist community hubs, fan reviews and ratings, and music discovery through real people instead of algorithms.</p>
                </div>
            </header>

            <nav aria-label="Press kit sections">
                <div className="wrap">
                    {NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
                </div>
            </nav>

            <section id="glance">
                <div className="wrap">
                    <h2>At a glance</h2>
                    <dl className="glance">
                        {GLANCE.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                    </dl>
                </div>
            </section>

            <section id="about">
                <div className="wrap">
                    <h2>Boilerplate</h2>
                    <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 22 }}>Approved copy for publication. Use either version as written.</p>
                    <div className="copyblock">
                        <div className="copyblock-head">
                            <span className="copyblock-label">Short version · 57 words</span>
                            <CopyButton text={BOILERPLATE_SHORT} />
                        </div>
                        <p>{BOILERPLATE_SHORT}</p>
                    </div>
                    <div className="copyblock">
                        <div className="copyblock-head">
                            <span className="copyblock-label">Standard version · 104 words</span>
                            <CopyButton text={BOILERPLATE_LONG} />
                        </div>
                        <p>{BOILERPLATE_LONG}</p>
                    </div>
                </div>
            </section>

            <section id="product">
                <div className="wrap">
                    <h2>What SoundSpire does</h2>
                    <div className="features">
                        {FEATURES.map(([h, p]) => <div key={h} className="feature"><h3>{h}</h3><p>{p}</p></div>)}
                    </div>
                </div>
            </section>

            <section id="story">
                <div className="wrap">
                    <h2>Why SoundSpire exists</h2>
                    <p>An artist can have a hundred thousand followers and no way to reach the few hundred who genuinely care. Streaming and social platforms are built to maximise reach, and they are very good at it, but reach is rented. The relationship sits with the platform, the audience is reachable only on the platform&apos;s terms, and the moment an artist stops feeding the algorithm, they disappear.</p>
                    <p>A small fraction of any artist&apos;s audience drives a disproportionate share of everything that matters: the repeat listens, the shows, the word of mouth. Those people have nowhere to go that is deeper than a like, and artists have nowhere to take them.</p>
                    <p>SoundSpire is built for that gap. It gives artists a community they own rather than rent, and gives the fans who care most a place to actually belong, alongside a discovery layer where listeners, not algorithms, decide what rises.</p>
                </div>
            </section>

            <section id="founder">
                <div className="wrap">
                    <h2>Founder</h2>
                    <h3>Ashish Paul - Founder</h3>
                    <p>Ashish Paul is the founder of SoundSpire. He spent four years as Head of Strategy at Bawse, and has worked as a consultant across European and US markets. He also runs CTRL+S, an artist management and consulting company. He has worked directly with artists across India, the UK and the US on digital strategy and audience building, the work that led to SoundSpire.</p>
                    <div style={{ marginTop: 34 }}>
                        <div className="copyblock">
                            <div className="copyblock-head">
                                <span className="copyblock-label">Quote · approved for publication</span>
                                <CopyButton text={QUOTE} />
                            </div>
                            <blockquote><p>{QUOTE}</p></blockquote>
                            <p className="attrib">Ashish Paul, Founder, SoundSpire</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="facts">
                <div className="wrap">
                    <h2>Fact sheet</h2>
                    <div className="table-scroll">
                        <table className="facts">
                            <tbody>
                                {FACTS.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section id="assets">
                <div className="wrap">
                    <h2>Brand usage</h2>
                    <ul className="rules">
                        <li>The SoundSpire logo may be reproduced at any size but must not be redrawn, recoloured, stretched or rotated.</li>
                        <li>Write the name as <strong>SoundSpire</strong>, one word, capital S in both halves.</li>
                        <li>For product imagery or interface screenshots, please contact us directly rather than capturing your own.</li>
                    </ul>
                </div>
            </section>

            <section id="contact">
                <div className="wrap">
                    <h2>Press contact</h2>
                    <p className="contact-line">Ashish Paul, Founder</p>
                    <p style={{ color: "var(--muted)", marginTop: 0 }}>Available for interview and comment. Response within 24 hours during launch week.</p>
                </div>
            </section>

            <footer>
                <div className="wrap">
                    <p>SoundSpire · Press kit · Last updated {UPDATED}</p>
                </div>
            </footer>
        </div>
    );
}
