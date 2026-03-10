import { useCallback, useState } from "react";
import CarouselBase from "./CarouselBase";
import { getFontClass } from "@/utils/getFontClass";

type ExploreItem = {
    title: string;
    description: string;
    price: string;
    image?: string;
};
interface ExploreCarouselProps {
    items: ExploreItem[];
}
const ExploreCarousel = ({ items }: ExploreCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const montserrat = getFontClass("montserrat");
    const onNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);
    const onPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);
    return (
        <section className="mb-12">
            <CarouselBase
                dotCount={items.length}
                auto
                autoIntervalSeconds={3}
                onDotClick={setCurrentIndex}
                onNext={onNext}
                onPrevious={onPrevious}
                currentIndex={currentIndex}
                pausable
            >
                <div
                    className="w-full p-6 grid grid-cols-2 items-center rounded-[20px] border border-[#3A3A3A] overflow-hidden max-h-[550px]"
                    style={{
                        aspectRatio: "1/1",
                        background: "radial-gradient(ellipse 71% 71% at 50% 50%, #6B3E59 0%, black 100%)",
                    }}
                >
                    <div className="flex flex-col gap-5">
                        <h2 className={`${montserrat} text-[#FFC8BC] text-[36px] font-bold leading-[43px]`}>
                            {items[currentIndex].title}
                        </h2>
                        <p className={`${montserrat} text-[#F7F7F7] text-[16px] font-medium leading-[19px] max-w-[200px]`}>
                            {items[currentIndex].description}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-5">
                        <span className={`${montserrat} text-[#FFC8BC] text-[36px] font-bold leading-[43px]`}>
                            {items[currentIndex].price}
                        </span>
                        <img
                            src={items[currentIndex].image}
                            alt="Featured Album"
                            className="w-64 h-40 object-cover shadow-xl"
                        />
                    </div>
                </div>
            </CarouselBase>
        </section>
    );
};
export default ExploreCarousel;
