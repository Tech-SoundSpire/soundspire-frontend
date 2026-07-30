import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Community Guidelines - SoundSpire" };

// ponytail: placeholder Guidelines copy; real content comes later.
export default function CommunityGuidelinesPage() {
  return (
    <LegalPage title="Community Guidelines">
      <p>SoundSpire is a place for fans and artists to connect. Keep it welcoming.</p>
      <p><strong>Do:</strong> be respectful, share your genuine opinions, credit others&apos; work, and report content that breaks these rules.</p>
      <p><strong>Don&apos;t:</strong> harass or bully, post hate speech, share sexually explicit or violent content, spam, impersonate others, or post content you don&apos;t have the rights to.</p>
      <p>You can report any message, post, review, or user, and you can block users so you no longer see their content.</p>
      <p>We remove violating content and may suspend accounts that repeatedly break these guidelines.</p>
    </LegalPage>
  );
}
