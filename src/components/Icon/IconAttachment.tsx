import { FC } from 'react';

interface IconAttachmentProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconAttachment: FC<IconAttachmentProps> = ({ className, fill = false, duotone = true }) => {
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
                    <path
                        d="M21 12.5L12.5 21C10.567 22.933 7.433 22.933 5.5 21C3.567 19.067 3.567 15.933 5.5 14L14 5.5C15.38 4.12 17.62 4.12 19 5.5C20.38 6.88 20.38 9.12 19 10.5L10.5 19C9.67 19.83 8.33 19.83 7.5 19C6.67 18.17 6.67 16.83 7.5 16L15 8.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                    <path
                        d="M21 12.5L12.5 21C10.567 22.933 7.433 22.933 5.5 21C3.567 19.067 3.567 15.933 5.5 14L14 5.5C15.38 4.12 17.62 4.12 19 5.5C20.38 6.88 20.38 9.12 19 10.5L10.5 19C9.67 19.83 8.33 19.83 7.5 19C6.67 18.17 6.67 16.83 7.5 16L15 8.5"
                        fill="currentColor"
                        opacity={duotone ? '0.8' : '1'}
                    />
                </svg>
            )}
        </>
    );
};

export default IconAttachment;