import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo({
    className = 'h-9 w-auto object-contain',
    alt = 'Viên Không Ni – Buddhist Courses',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-vien-khong.png"
            alt={alt}
            className={className}
            {...props}
        />
    );
}

