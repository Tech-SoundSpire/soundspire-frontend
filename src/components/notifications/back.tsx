'use client'
import { FaArrowLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function Back(){

    const router = useRouter()

    return(
        <div className="ml-[3.5rem] flex items-center cursor-pointer" 
            onClick={()=>{
                router.back()
            }}>
                <FaArrowLeft className="size-5"/><p className="ml-4 text-3xl font-bold">Notifications</p>
        </div>
    )
}