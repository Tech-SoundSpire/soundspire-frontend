import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Child Safety Standards - SoundSpire" };

// Published CSAE standards page, required by Google Play's Child Safety Standards
// policy for social apps. Must stay a live, public, non-PDF URL.
export default function ChildSafetyPage() {
  return (
    <LegalPage title="Child Safety Standards">
      <p><strong>Effective date:</strong> 31 July 2026</p>

      <p>SoundSpire has a zero-tolerance policy toward child sexual abuse and exploitation (CSAE) and child sexual abuse material (CSAM). We are committed to preventing, detecting, and responding to any such content or conduct on our platform, and to protecting minors who use our services.</p>

      <h2>1. Our standards</h2>
      <p>The following are strictly prohibited on SoundSpire:</p>
      <ul>
        <li>Any content that sexualizes, exploits, or endangers a minor.</li>
        <li>Child sexual abuse material (CSAM) of any kind.</li>
        <li>Grooming, solicitation, or sexual communication with or about a minor.</li>
        <li>Any attempt to use the platform to facilitate the abuse or exploitation of a child.</li>
      </ul>
      <p>These standards apply to every part of the service - profiles, community hubs, chat, comments, reviews, fan art, and any other user-generated content.</p>

      <h2>2. Preventing and combating CSAE</h2>
      <ul>
        <li><strong>Clear rules:</strong> our <a href="/community-guidelines">Community Guidelines</a> and <a href="/terms">Terms of Service</a> prohibit content that sexualizes minors, and every user agrees to them before participating.</li>
        <li><strong>In-app reporting:</strong> any user can report content or another user directly in the app. Reports of child safety concerns are prioritized.</li>
        <li><strong>Moderation and takedown:</strong> our moderators review reports and can hide or remove content and suspend or ban accounts. We act on child safety reports as a priority.</li>
        <li><strong>Blocking:</strong> users can block other users to stop unwanted contact.</li>
        <li><strong>Age eligibility:</strong> the service is not intended for children under 13, and users between 13 and 17 must have the consent and involvement of a parent or legal guardian.</li>
      </ul>

      <h2>3. Reporting to authorities</h2>
      <p>When we identify or receive a credible report of CSAM or child exploitation, we act promptly to remove it, preserve relevant information, and report to the appropriate regional and national authorities and child-protection organizations as required by law.</p>

      <h2>4. Report a concern</h2>
      <p>To report child safety concerns you can:</p>
      <ul>
        <li>use the in-app <strong>Report</strong> action on any content or user; or</li>
        <li>email our designated child safety contact at <a href="mailto:jishnu@soundspire.online">jishnu@soundspire.online</a>.</li>
      </ul>
      <p>If a child is in immediate danger, contact your local law enforcement or emergency services right away.</p>

      <h2>5. Contact</h2>
      <p>Designated child safety point of contact: <a href="mailto:jishnu@soundspire.online">jishnu@soundspire.online</a></p>
    </LegalPage>
  );
}
