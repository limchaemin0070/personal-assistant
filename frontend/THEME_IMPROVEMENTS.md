# Global.css 개선 사항 문서

## 개요

`globals.css` 파일을 Tailwind CSS v4 표준과 프로덕트 표준에 맞게 개선하고, 향후 색상 테마 변경 기능 확장을 위한 구조로 재구성했습니다.

## 주요 개선 사항

### 1. 의미적 색상 변수 시스템 도입

#### 변경 전
- 하드코딩된 색상값 (`rgb(17 24 39)`, `#2563eb` 등)이 전체에 산재
- 색상의 의미와 용도가 명확하지 않음

#### 변경 후
- 의미적으로 구조화된 CSS 변수 시스템 구축
- 모든 색상을 용도별로 분류 (`--color-primary`, `--color-background`, `--color-text-primary` 등)
- RGB 값만 저장하여 `rgb()` 함수와 함께 사용 (투명도 적용 용이)

```css
:root {
    /* 의미적 색상 시스템 */
    --color-primary: 37 99 235;  /* blue-600 */
    --color-background: 255 255 255;  /* white */
    --color-text-primary: 17 24 39;  /* gray-900 */
}
```

### 2. 다크 모드 지원 추가

#### 변경 전
- 라이트 모드만 지원

#### 변경 후
- `[data-theme='dark']` 또는 `.dark` 클래스로 다크 모드 지원
- 모든 색상 변수가 다크 모드에서 자동으로 변경됨

```css
[data-theme='dark'] {
    --color-background: 17 24 39;  /* gray-900 */
    --color-text-primary: 243 244 246;  /* gray-100 */
}
```

**사용 방법:**
```html
<!-- 방법 1: data-theme 속성 -->
<html data-theme="dark">

<!-- 방법 2: 클래스 -->
<html class="dark">
```

### 3. 하드코딩된 색상값 제거

#### 변경 전
```css
body {
    background-color: rgb(249 250 251);
    color: rgb(17 24 39);
}

.btn-primary-filled {
    background-color: #2563eb;
}
```

#### 변경 후
```css
body {
    background-color: rgb(var(--color-background-secondary));
    color: rgb(var(--color-text-primary));
}

.btn-primary-filled {
    background-color: rgb(var(--color-primary));
}
```

### 4. Tailwind v4 @theme 블록 최적화

- 기존의 색상 팔레트는 `@theme` 블록에 유지하여 Tailwind 유틸리티 클래스로 사용 가능
- 의미적 색상 변수는 `:root`에 정의하여 컴포넌트 스타일에서 사용

### 5. 색상 변수 체계화

#### 색상 카테고리
- **Primary/Secondary/Danger/Success/Warning/Info**: 액션 및 상태 색상
- **Background**: 배경 색상 (primary, secondary, tertiary)
- **Text**: 텍스트 색상 (primary, secondary, tertiary, disabled, inverse)
- **Border**: 테두리 색상 (default, light, hover)
- **Shadow**: 그림자 색상
- **Gradient**: 그라디언트 색상

## 색상 테마 변경 기능 구현 가이드

### 기본 사용법

모든 색상은 CSS 변수로 정의되어 있으므로, JavaScript를 통해 동적으로 변경할 수 있습니다:

```typescript
// 테마 변경 함수 예시
function setTheme(theme: 'light' | 'dark' | 'custom') {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        // 커스텀 테마 적용
        document.documentElement.style.setProperty('--color-primary', '139 92 246'); // purple-500
    }
}
```

### 커스텀 테마 생성

커스텀 테마를 추가하려면 CSS에 새로운 변수 세트를 정의하면 됩니다:

```css
[data-theme='purple'] {
    --color-primary: 139 92 246;  /* purple-500 */
    --color-primary-hover: 124 58 237;  /* purple-600 */
    --color-primary-light: 243 232 255;  /* purple-100 */
}
```

### 테마 확장 예시

```typescript
// 테마 설정 타입 정의
type ThemeName = 'light' | 'dark' | 'purple' | 'green' | 'orange';

// 테마 관리 훅
function useTheme() {
    const [theme, setTheme] = useState<ThemeName>('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        // 로컬 스토리지에 저장
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme] as const;
}
```

## 마이그레이션 가이드

### 기존 컴포넌트 업데이트

기존에 하드코딩된 색상을 사용하던 컴포넌트는 CSS 변수로 변경해야 합니다:

**변경 전:**
```tsx
<div style={{ backgroundColor: '#2563eb', color: 'white' }}>
```

**변경 후:**
```tsx
<div style={{ backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-text-inverse))' }}>
```

또는 Tailwind 유틸리티 클래스 사용:
```tsx
<div className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-inverse))]">
```

## 장점

1. **유지보수성 향상**: 색상 변경 시 CSS 변수만 수정하면 전체 앱에 반영
2. **테마 확장 용이**: 새로운 테마 추가가 간단함
3. **일관성 보장**: 의미적 변수명으로 일관된 디자인 시스템 구축
4. **다크 모드 지원**: 별도 스타일링 없이 자동 지원
5. **Tailwind v4 호환**: 최신 Tailwind 표준 준수

## 참고 사항

- RGB 값 형식 사용: 투명도 적용 시 `rgb(var(--color-primary) / 0.5)` 형태로 사용 가능
- 모든 컴포넌트 스타일에서 CSS 변수 사용 권장
- 새로운 색상 추가 시 의미적 변수명으로 정의
- 다크 모드 색상은 가독성을 고려하여 충분한 대비 확보

