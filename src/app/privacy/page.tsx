import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy - SoundSpire" };

// ponytail: placeholder Privacy copy; real legal content comes later.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>SoundSpire collects the information you provide at signup (username, email) and the content you create (reviews, posts, comments, chat messages) to operate and personalize the service.</p>
      <p>We do not sell your personal information. We share data only as needed to run the platform (for example, hosting and media delivery) or when required by law.</p>
      <p>We use cookies to keep you signed in and to secure your session.</p>
      <p>You can request deletion of your account and associated data at any time. See <a href="/delete-account" className="text-[#FF4E27] hover:underline">Delete account</a>.</p>
      <p>By using SoundSpire you consent to this collection and use of your information.</p>
    </LegalPage>
  );
}
