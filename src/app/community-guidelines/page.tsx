import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Community Guidelines - SoundSpire" };

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage title="Community Guidelines" pdfUrl="https://soundspirepublicassets.s3.ap-south-1.amazonaws.com/publicDocs/soundspire-community-guidelines.pdf">
      <p><strong>Effective date:</strong> 31 July 2026</p>

      <p>SoundSpire is a place for fans and artists to connect over music. These Community Guidelines explain what is and isn&apos;t allowed so everyone has a safe, welcoming experience. They apply to everything you do on the SoundSpire mobile app, website, and related services (the &quot;<strong>Services</strong>&quot;) - reviews, ratings, posts, comments, community messages, fan art, profiles, and how you treat other people.</p>
      <p>These Guidelines are part of, and should be read with, our <a href="/terms">Terms of Service</a> and (for artists) our <a href="/artist-terms">Artist Terms &amp; Conditions</a>. Breaking these Guidelines can lead to content removal, loss of features, or account suspension or termination.</p>

      <h2>1. Be respectful</h2>
      <p>Treat other fans and artists the way you&apos;d want to be treated. Disagreement about music is welcome; personal attacks are not.</p>
      <ul>
        <li>No harassment, bullying, or targeted abuse.</li>
        <li>No threats of violence or wishing harm on anyone.</li>
        <li>No hate speech or attacks based on race, ethnicity, national origin, caste, religion, sex, gender, sexual orientation, disability, or any other protected characteristic.</li>
      </ul>

      <h2>2. Keep it lawful and safe</h2>
      <ul>
        <li>No content that is illegal or promotes illegal activity.</li>
        <li>No content that sexualizes minors in any way. This is a zero-tolerance rule and we report it to the authorities.</li>
        <li>No sexually explicit or pornographic content.</li>
        <li>No graphic violence, gore, or content that glorifies self-harm, suicide, or eating disorders.</li>
        <li>No promotion of dangerous or regulated goods (weapons, drugs) or of scams and fraud.</li>
      </ul>

      <h2>3. Respect intellectual property</h2>
      <ul>
        <li>Only upload music, art, images, video, or text that you created or have permission to use.</li>
        <li>Don&apos;t post others&apos; copyrighted work without authorization.</li>
        <li>Artists: make sure you&apos;ve cleared samples and secured rights from collaborators, labels, and rights holders before uploading (see the <a href="/artist-terms">Artist Terms</a>).</li>
      </ul>

      <h2>4. Be authentic</h2>
      <ul>
        <li>Don&apos;t impersonate other people, artists, or brands.</li>
        <li>Don&apos;t misrepresent who you are or your affiliation.</li>
        <li>No spam, mass unsolicited promotion, or link schemes.</li>
        <li>Don&apos;t manipulate the platform: no fake accounts, bought followers, or artificially inflated reviews, ratings, or engagement.</li>
      </ul>

      <h2>5. Keep reviews honest</h2>
      <p>Reviews and ratings should reflect your genuine opinion and experience. Don&apos;t post fake, paid-for, or coordinated reviews, and don&apos;t review to harass an artist or another user.</p>

      <h2>6. Protect privacy</h2>
      <ul>
        <li>Don&apos;t share other people&apos;s private or personal information (doxxing).</li>
        <li>Don&apos;t post someone&apos;s private images or messages without their consent.</li>
      </ul>

      <h2>7. Reporting and blocking</h2>
      <p>If you see content or behavior that breaks these Guidelines:</p>
      <ul>
        <li><strong>Report</strong> it. You can report any message, post, review, fan art, or user from within the app or website.</li>
        <li><strong>Block</strong> users you don&apos;t want to interact with. Blocking hides their content from you across the Services.</li>
      </ul>
      <p>Reports are reviewed by our moderators. We may remove content, hide it, warn, suspend, or ban accounts depending on the severity and history of violations. We may act without prior notice when needed to protect people or comply with the law.</p>

      <h2>8. For artists and community hosts</h2>
      <p>If you run a community hub, you help set its tone. Moderate reasonably, apply these Guidelines to your space, and don&apos;t use your community to harass, deceive, or exploit fans. See the <a href="/artist-terms">Artist Terms &amp; Conditions</a> for more.</p>

      <h2>9. Enforcement</h2>
      <p>Consequences for breaking these Guidelines depend on what happened and your history on the platform. They range from content removal to temporary suspension to permanent account termination. Serious violations - especially those involving child safety or credible threats - can result in immediate removal and referral to law enforcement.</p>

      <h2>10. Changes and contact</h2>
      <p>We may update these Guidelines from time to time and will post the updated version with a new &quot;Last updated&quot; date. Questions or concerns? Contact us at <a href="mailto:support@soundspire.online">support@soundspire.online</a>.</p>
    </LegalPage>
  );
}
