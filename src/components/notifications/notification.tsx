import Image from "next/image";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '@/utils/userProfileImageUtils';

export default function NotificationContent(){


    return(
         <div className="flex items-center w-full mt-10">
            <Image
                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover mr-5"
                width={100}
                height={100}
            />
            <p className="text-lg">Aditya Rikhari posted a new photo.</p>
            <p className="ml-2 text-gray-400 text-lg">3d</p>
            <Image
                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="thumbnail"
                className="w-12 h-12 rounded-md object-cover ml-auto"
                width={100}
                height={100}
            />
         </div>
    )
}