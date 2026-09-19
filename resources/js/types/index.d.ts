export interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
    role?: 'admin' | 'teacher' | 'student';
    phone?: string;
    status?: string;
    avatar?: string;
    email_verified_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    translations?: Record<string, any>;
};
