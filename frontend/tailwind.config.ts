import type { Config } from 'tailwindcss';
import 'tailwindcss-animated';

const config: Config = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            screens: {
                xs: '475px', // 작은 모바일
                sm: '640px', // 모바일세로
                md: '768px', // 태블릿 가로
                lg: '1024px', // 데스크톱
                xl: '1280px', // 데스크톱
                '2xl': '1536px', // 데스크톱
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '1.5rem',
                    lg: '2rem',
                    xl: '2.5rem',
                    '2xl': '3rem',
                },
            },
            flex: {
                '1': '1 1 0%',
                auto: '1 1 auto',
                initial: '0 1 auto',
                none: 'none',
            },
            fontSize: {
                display: ['28px', { lineHeight: '1.3' }], // 큰 제목용
                title1: ['24px', { lineHeight: '1.4' }], // 주요 제목
                title2: ['20px', { lineHeight: '1.45' }], // 중간 제목
                title3: ['18px', { lineHeight: '1.5' }], // 작은 제목
                body1: ['16px', { lineHeight: '1.6' }], // 본문 텍스트
                body2: ['15px', { lineHeight: '1.6' }], // 보조 본문
                caption: ['13px', { lineHeight: '1.4' }], // 캡션, 부가설명
                small: ['12px', { lineHeight: '1.4' }], // 매우 작은 텍스트
            },
            fontWeight: {
                thin: '100', // font-thin
                light: '300', // font-light
                normal: '400', // font-normal
                medium: '500', // font-medium
                semibold: '600', // font-semibold
                bold: '700', // font-bold
                extrabold: '800', // font-extrabold
            },
        },
    },
    plugins: [],
};

export default config;
