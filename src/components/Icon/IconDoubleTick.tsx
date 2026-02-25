import { FC } from 'react';

interface IconDoubleTickProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconDoubleTick: FC<IconDoubleTickProps> = ({ className, fill = false, duotone = true }) => {
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
                    {/* First Tick */}
                    <path
                        d="M3 13L7 17L13 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Second Tick */}
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M9 13L13 17L21 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                    {/* First Tick */}
                    <path
                        d="M3 13L7 17L13 9"
                        fill="currentColor"
                    />

                    {/* Second Tick */}
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M9 13L13 17L21 7"
                        fill="currentColor"
                    />
                </svg>
            )}
        </>
    );
};

export default IconDoubleTick;