import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Delete Your Account - SoundSpire" };

// Publicly reachable (no auth) account-deletion info page. Required for the
// Play Store data-deletion gate. The actual deletion endpoint is auth-only.
export default function DeleteAccountPage() {
  return (
    <LegalPage title="Delete Your Account">
      <p>You can permanently delete your SoundSpire account and its data at any time.</p>

      <h2 className="text-lg font-bold text-white mt-6">From the app</h2>
      <p>Sign in, then go to <strong>Your Profile → Delete account</strong>. Confirm to permanently remove your account.</p>

      <h2 className="text-lg font-bold text-white mt-6">By request</h2>
      <p>If you cannot sign in, email <a href="mailto:support@soundspire.online" className="text-[#FF4E27] hover:underline">support@soundspire.online</a> from your registered address and ask us to delete your account. We will verify and process the request.</p>

      <h2 className="text-lg font-bold text-white mt-6">What gets deleted</h2>
      <p>Your profile, preferences, community subscriptions, posts, fan-art, comments, reactions, chat messages, votes, and notifications are removed. Your reviews are removed from public view.</p>
      <p>Some records may be retained for a limited period where required by law or to prevent abuse, then deleted.</p>
    </LegalPage>
  );
}
