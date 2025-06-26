interface ArtistCardProps {
  name: string;
  imageUrl: string;
  genre?: string;
}

const ArtistCard = ({ name, imageUrl, genre }: ArtistCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative w-32 h-32 rounded-full overflow-hidden group-hover:ring-2 ring-primary">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="mt-2 text-center">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{name}</h3>
        {genre && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{genre}</p>
        )}
      </div>
    </div>
  );
};

export default ArtistCard; 