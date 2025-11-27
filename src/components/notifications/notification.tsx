import Image from "next/image";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "../BaseText/BaseText";

export default function NotificationContent() {
    return (
        <div className="flex items-center w-full mt-10">
            <div className="relative w-12 h-12 rounded-full object-cover mr-5">
                <Image
                    src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                    alt="Avatar"
                    fill
                    objectFit="cover"
                />
            </div>
            <BaseText fontSize="normal">
                Aditya Rikhari posted a new photo.
            </BaseText>
            <BaseText textColor="#9ca3af" className="ml-2" fontSize="normal">
                3d
            </BaseText>
            <Image
                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="thumbnail"
                className="w-12 h-12 rounded-md object-cover ml-auto"
                width={100}
                height={100}
            />
        </div>
    );
}
