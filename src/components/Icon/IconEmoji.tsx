import { FC } from 'react';

interface IconEmojiProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconEmoji: FC<IconEmojiProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                >
                    {/* Face */}
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                    {/* Left Eye */}
                    <circle
                        cx="9"
                        cy="10"
                        r="1"
                        fill="currentColor"
                        opacity={duotone ? '0.8' : '1'}
                    />

                    {/* Right Eye */}
                    <circle
                        cx="15"
                        cy="10"
                        r="1"
                        fill="currentColor"
                        opacity={duotone ? '0.8' : '1'}
                    />

                    {/* Smile */}
                    <path
                        d="M8 14C9 16 15 16 16 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity={duotone ? '0.8' : '1'}
                    />
                </svg>
            ) : (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                >
                    {/* Face */}
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="currentColor"
                        opacity={duotone ? '0.15' : '1'}
                    />

                    {/* Eyes */}
                    <circle cx="9" cy="10" r="1.2" fill="currentColor" />
                    <circle cx="15" cy="10" r="1.2" fill="currentColor" />

                    {/* Smile */}
                    <path
                        d="M8 14C9 16 15 16 16 14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconEmoji;