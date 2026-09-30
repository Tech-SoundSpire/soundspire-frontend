import Link from "next/link";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

// Shown to artists after email verification (and on any login attempt) while the
// SoundSpire team completes the manual background check. No session is issued.
export default function UnderReviewPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-white text-center">
            <BaseHeading fontWeight={600} className="mb-4" headingLevel="h1" fontSize="sub heading">
                Thank you for verifying your email
            </BaseHeading>
            <BaseText textColor="#d1d5db">
                The SoundSpire team will be in touch shortly.
            </BaseText>
            <BaseText textColor="#9ca3af" fontSize="small" className="mt-2">
                We review every artist profile before it goes live. You can log in once your profile is approved.
            </BaseText>
            <Link href="/" className="mt-8 px-5 py-2 rounded-lg bg-[#FA6400] text-white font-medium">
                Back to SoundSpire
            </Link>
        </div>
    );
}
