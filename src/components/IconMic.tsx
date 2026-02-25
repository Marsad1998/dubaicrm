import { FC } from 'react';

interface IconMicProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconMic: FC<IconMicProps> = ({ className, fill = false, duotone = true }) => {
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
                    {/* Mic Head */}
                    <rect
                        x="9"
                        y="3"
                        width="6"
                        height="11"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                    {/* Mic Stand */}
                    <path
                        d="M5 11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity={duotone ? '0.7' : '1'}
                    />

                    {/* Base */}
                    <path
                        d="M12 18V21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
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
                    {/* Mic Head */}
                    <rect
                        x="9"
                        y="3"
                        width="6"
                        height="11"
                        rx="3"
                        fill="currentColor"
                    />

                    {/* Mic Stand */}
                    <path
                        d="M5 11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11"
                        fill="currentColor"
                        opacity={duotone ? '0.5' : '1'}
                    />

                    {/* Base */}
                    <rect
                        x="11"
                        y="18"
                        width="2"
                        height="3"
                        fill="currentColor"
                    />
                </svg>
            )}
        </>
    );
};

export default IconMic;