interface GenreCardProps {
  name: string;
  imageUrl: string;
}

const GenreCard = ({ name, imageUrl }: GenreCardProps) => {
  return (
    <div className="relative h-32 rounded-lg overflow-hidden cursor-pointer group bg-purple-500 hover:bg-gray-800 transition-colors duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent" />
      <img
        src={imageUrl}
        alt={name}
        className="absolute right-0 bottom-0 h-24 w-24 object-cover transform rotate-12 translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300"
      />
      <div className="relative p-4">
        <h3 className="text-white text-lg font-bold">{name}</h3>
      </div>
    </div>
  );
};

export default GenreCard; 