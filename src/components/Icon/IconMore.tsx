import { FC } from 'react';

interface IconMoreProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconMore: FC<IconMoreProps> = ({ className, fill = false, duotone = true }) => {
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
                    <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle
                        cx="12"
                        cy="12"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity={duotone ? '0.5' : '1'}
                    />
                    <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
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
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle
                        cx="12"
                        cy="12"
                        r="2"
                        fill="currentColor"
                        opacity={duotone ? '0.5' : '1'}
                    />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                </svg>
            )}
        </>
    );
};

export default IconMore;