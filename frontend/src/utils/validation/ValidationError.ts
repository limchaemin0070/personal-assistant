// 프론트엔드 검증 에러 클래스

export class ValidationError extends Error {
    field?: string;

    constructor(message: string, field?: string) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}
