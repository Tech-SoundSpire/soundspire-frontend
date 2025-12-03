import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "../BaseText/BaseText";

export default function NotificationContent() {
    return (
        <div className="flex items-center w-full mt-10">
            <img
                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover mr-5"
                width={100}
                height={100}
            />
            <BaseText fontSize="normal">
                Aditya Rikhari posted a new photo.
            </BaseText>
            <BaseText textColor="#9ca3af" className="ml-2" fontSize="normal">
                3d
            </BaseText>
            <img
                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="thumbnail"
                className="w-12 h-12 rounded-md object-cover ml-auto"
                width={100}
                height={100}
            />
        </div>
    );
}
