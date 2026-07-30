import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Terms of Service - SoundSpire" };

// ponytail: placeholder Terms copy; real legal content comes later.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>Welcome to SoundSpire. By using our services you agree to comply with all applicable laws and to respect the rights of other creators and community members.</p>
      <p>You are responsible for the content you post. You agree not to upload or distribute content that is illegal, infringing, hateful, harassing, sexually explicit, or violent.</p>
      <p>You grant SoundSpire a worldwide, non-exclusive license to host and display the content you submit for the purpose of operating the service.</p>
      <p>We may remove content and suspend accounts that violate these terms or our <a href="/community-guidelines" className="text-[#FF4E27] hover:underline">Community Guidelines</a>.</p>
      <p>You can delete your account at any time. See <a href="/delete-account" className="text-[#FF4E27] hover:underline">Delete account</a>.</p>
      <p>These terms may change; continued use after an update means you accept the revised terms.</p>
    </LegalPage>
  );
}
