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
        import_errors?: string[];
    };
    translations?: Record<string, any>;
};

export interface ClassCommentUser {
    id: number;
    name: string;
    username?: string;
    role?: 'admin' | 'teacher' | 'student';
    avatar?: string;
}

export interface ClassCommentItem {
    id: number;
    class_id: number;
    user_id: number;
    parent_id: number | null;
    reply_to_user_id: number | null;
    content: string;
    created_at: string;
    updated_at: string;
    user: ClassCommentUser;
    reply_to_user?: ClassCommentUser | null;
    replies?: ClassCommentItem[];
}

