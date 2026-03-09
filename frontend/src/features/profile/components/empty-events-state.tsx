"use client";

export function EmptyEventsState() {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            {/* Illustration with decorative elements */}
            <div className="relative w-[332px] h-[200px] mb-6">
                {/* Stopwatch - top right */}
                <img
                    src="/images/decor-stopwatch.svg"
                    alt=""
                    width={27}
                    height={33}
                    className="absolute top-0 right-[60px]"
                />

                {/* Star decorations */}
                <img
                    src="/images/decor-cross1.svg"
                    alt=""
                    width={17}
                    height={16}
                    className="absolute top-[50px] left-[70px]"
                />
                <img
                    src="/images/decor-cross2.svg"
                    alt=""
                    width={12}
                    height={11}
                    className="absolute bottom-[20px] left-[50px]"
                />
                <img
                    src="/images/decor-star2.svg"
                    alt=""
                    width={9}
                    height={9}
                    className="absolute top-[35px] left-[40px]"
                />
                <img
                    src="/images/decor-star1.svg"
                    alt=""
                    width={16}
                    height={20}
                    className="absolute top-[80px] right-[10px]"
                />

                {/* Main illustration */}
                <img
                    src="/images/empty-events.png"
                    alt="People doing sports"
                    width={332}
                    height={221}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain"
                />
            </div>

            <h2 className="text-[18px] font-medium text-text-primary mb-2 max-w-[300px]">
                Your future events will appear here
            </h2>
            <p className="text-[14px] text-text-tertiary max-w-[320px]">
                Choose from thousands of events or create your own to enjoy your favorite activities together
            </p>
        </div>
    );
}
