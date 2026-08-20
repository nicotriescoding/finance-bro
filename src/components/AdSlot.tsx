"use client";

type AdSlotProps = {
    title?: string;
    imgUrl?: string;
    linkUrl?: string;
};

export default function AdSlot({ title, imgUrl, linkUrl }: AdSlotProps) {
    return (
        <div className="bg-gray-100 rounded-lg shadow p-4 flex flex-col items-center justify-center text-center h-[250px]">
            {imgUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                    <img
                        src={imgUrl}
                        alt={title || "Advertisement"}
                        className="max-h-[200px] object-contain mx-auto"
                    />
                </a>
            ) : (
                <>
                    <p className="text-gray-500">🚀 Advertisement</p>
                    <p className="text-sm text-gray-400">Your ad could be here</p>
                </>
            )}
        </div>
    );
}

