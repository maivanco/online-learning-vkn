import { User } from './index';

export interface MediaFileItem {
    id: number;
    user_id: number;
    filename: string;
    original_name: string;
    file_path: string;
    disk: string;
    mime_type: string;
    file_size: number;
    width?: number | null;
    height?: number | null;
    alt_text?: string | null;
    media_type: 'image' | 'document';
    url: string;
    created_at: string;
    updated_at: string;
    user?: Pick<User, 'id' | 'name' | 'username'>;
}

export interface MediaPaginatedResponse {
    data: MediaFileItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
