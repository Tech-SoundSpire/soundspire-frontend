import { FaSearch } from 'react-icons/fa';
import Post from '@/components/Post';

export default function Page(){

    return(
        <>   
            <div className='flex'>
                <main className="ml-16 px-8 py-6 w-[70%]">
                    <div className="flex justify-between items-center mt-6 mb-8 w-full">
                        <h1 className="text-white text-4xl font-bold mx-auto">Posts</h1>
                        <div className="relative w-full max-w-2xl items-center mx-auto">
                            
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-[80%] px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                        </div>   
                    </div>                
                <div className='flex flex-col items-center justify-center'> 
                   <Post/>
                   <Post/>
                   <Post/>
                   <Post/>
                </div>
                </main>
                 <div className='fixed right-0 bg-slate-950 p-2 w-[23%] h-full'>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-white font-bold text-2xl mt-5 mb-8'>My Subscriptions</h1>
                    </div>
                    
                    <div className='flex items-center p-2 text-white'>
                            <img
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <img
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <img
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <img
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <img
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                </div>
            </div>
        </>
    )
}