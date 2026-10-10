import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ClassCommentItem, User } from '@/types';
import { useTranslation } from '@/utils/useTranslation';
import RichTextEditor from '@/Components/RichTextEditor';

interface ClassCommentsSectionProps {
    classId: number;
    comments: ClassCommentItem[];
    currentUser?: User | null;
    isLocked?: boolean;
}

export default function ClassCommentsSection({
    classId,
    comments = [],
    currentUser,
    isLocked = false,
}: ClassCommentsSectionProps) {
    const t = useTranslation();

    // Root comment form
    const rootForm = useForm({
        content: '',
        parent_id: null as number | null,
    });

    // Active reply state: which root comment thread is being replied to, and who is targeted
    const [activeReplyThreadId, setActiveReplyThreadId] = useState<number | null>(null);
    const [replyTargetComment, setReplyTargetComment] = useState<{ id: number; name: string } | null>(null);

    const replyForm = useForm({
        content: '',
        parent_id: null as number | null,
    });

    // Active edit state: which comment ID is being edited
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const editForm = useForm({
        content: '',
    });

    // Delete modal confirmation
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate total comment count (roots + replies)
    const totalCommentsCount = comments.reduce((acc, curr) => {
        return acc + 1 + (curr.replies?.length || 0);
    }, 0);

    // Helpers
    const isTeacherOrAdmin = (role?: string) => role === 'teacher' || role === 'admin';

    const getRoleBadge = (role?: string) => {
        if (role === 'admin') {
            return (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {t('comments.role_admin')}
                </span>
            );
        }
        if (role === 'teacher') {
            return (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {t('comments.role_teacher')}
                </span>
            );
        }
        return (
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                {t('comments.role_student')}
            </span>
        );
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return dateString;
        }
    };

    // Submit root comment
    const handleSubmitRoot = (e: React.FormEvent) => {
        e.preventDefault();
        if (rootForm.data.content.trim() === '') return;

        rootForm.post(route('classes.comments.store', classId), {
            preserveScroll: true,
            onSuccess: () => {
                rootForm.reset('content');
            },
        });
    };

    // Open reply form
    const handleOpenReply = (rootCommentId: number, targetCommentId: number, targetUserName: string) => {
        setActiveReplyThreadId(rootCommentId);
        setReplyTargetComment({ id: targetCommentId, name: targetUserName });
        replyForm.setData({
            content: '',
            parent_id: targetCommentId,
        });
    };

    const handleCancelReply = () => {
        setActiveReplyThreadId(null);
        setReplyTargetComment(null);
        replyForm.reset();
    };

    // Submit reply
    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyForm.data.content.trim() === '') return;

        replyForm.post(route('classes.comments.store', classId), {
            preserveScroll: true,
            onSuccess: () => {
                handleCancelReply();
            },
        });
    };

    // Open edit form
    const handleOpenEdit = (comment: ClassCommentItem) => {
        setEditingCommentId(comment.id);
        editForm.setData({
            content: comment.content,
        });
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        editForm.reset();
    };

    // Submit edit
    const handleSubmitEdit = (e: React.FormEvent, commentId: number) => {
        e.preventDefault();
        if (editForm.data.content.trim() === '') return;

        editForm.put(route('classes.comments.update', [classId, commentId]), {
            preserveScroll: true,
            onSuccess: () => {
                handleCancelEdit();
            },
        });
    };

    // Delete comment
    const handleConfirmDelete = () => {
        if (!commentToDelete) return;
        setIsDeleting(true);

        router.delete(route('classes.comments.destroy', [classId, commentToDelete]), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setCommentToDelete(null);
            },
        });
    };

    return (
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 text-lg shadow-2xs">
                        💬
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                                {t('comments.title')}
                            </h2>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                {totalCommentsCount}
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                            {t('comments.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="text-xs text-stone-400 hidden sm:block">
                    {t('comments.discussion_rules_hint')}
                </div>
            </div>

            {/* Root Comment Form */}
            <div className="bg-stone-50/70 rounded-2xl border border-stone-200/80 p-4 sm:p-5">
                <form onSubmit={handleSubmitRoot} className="space-y-3.5">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                            {currentUser ? getInitials(currentUser.name) : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-stone-800">
                            {currentUser?.name}
                        </span>
                        {currentUser?.role && getRoleBadge(currentUser.role)}
                    </div>

                    <RichTextEditor
                        value={rootForm.data.content}
                        onChange={(html) => rootForm.setData('content', html)}
                        placeholder={t('comments.write_comment_placeholder')}
                        variant="comment"
                        minHeight="80px"
                        error={rootForm.errors.content}
                    />

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400">
                            {t('comments.discussion_rules_hint')}
                        </span>

                        <button
                            type="submit"
                            disabled={rootForm.processing || rootForm.data.content.trim() === ''}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>{rootForm.processing ? '...' : t('comments.post_comment')}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Discussion Threads List */}
            {comments.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/40">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto mb-3 shadow-2xs">
                        🌱
                    </div>
                    <h3 className="font-serif font-bold text-stone-800 text-sm">
                        {t('comments.empty_state_title')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        {t('comments.empty_state_desc')}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => {
                        const isAuthor = currentUser?.id === comment.user_id;
                        const canDelete = isAuthor || isTeacherOrAdmin(currentUser?.role);
                        const isEditingThis = editingCommentId === comment.id;
                        const isReplyingThisThread = activeReplyThreadId === comment.id;

                        return (
                            <div
                                key={comment.id}
                                className="rounded-2xl border border-stone-200/90 bg-white shadow-2xs p-4 sm:p-5 space-y-4 hover:border-stone-300 transition"
                            >
                                {/* Root Comment Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 ${
                                            isTeacherOrAdmin(comment.user?.role)
                                                ? 'bg-amber-700 text-white'
                                                : 'bg-stone-200 text-stone-700'
                                        }`}>
                                            {getInitials(comment.user?.name || 'User')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-xs text-stone-900">
                                                    {comment.user?.name}
                                                </span>
                                                {comment.user?.role && getRoleBadge(comment.user.role)}
                                                {comment.created_at !== comment.updated_at && (
                                                    <span className="text-[10px] text-stone-400 italic">
                                                        {t('comments.edited')}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-stone-400 block mt-0.5">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenReply(comment.id, comment.id, comment.user?.name || '')}
                                            className="px-2.5 py-1 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-amber-50 font-medium transition flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            <span>{t('comments.reply')}</span>
                                        </button>

                                        {isAuthor && !isEditingThis && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(comment)}
                                                className="px-2.5 py-1 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium transition"
                                            >
                                                {t('comments.edit')}
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => setCommentToDelete(comment.id)}
                                                className="px-2.5 py-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition"
                                            >
                                                {t('comments.delete')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Root Comment Body or Inline Editor */}
                                {isEditingThis ? (
                                    <form onSubmit={(e) => handleSubmitEdit(e, comment.id)} className="space-y-3 pt-1">
                                        <RichTextEditor
                                            value={editForm.data.content}
                                            onChange={(html) => editForm.setData('content', html)}
                                            variant="comment"
                                            minHeight="80px"
                                            error={editForm.errors.content}
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-100 transition"
                                            >
                                                {t('comments.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={editForm.processing || editForm.data.content.trim() === ''}
                                                className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition shadow-xs"
                                            >
                                                {editForm.processing ? '...' : t('comments.save_changes')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div
                                        className="prose prose-stone prose-sm max-w-none text-stone-800 leading-relaxed pl-1 break-words"
                                        dangerouslySetInnerHTML={{ __html: comment.content }}
                                    />
                                )}

                                {/* Level 2: Nested Replies Container */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 pl-3 sm:pl-6 border-l-2 border-stone-200/80">
                                        {comment.replies.map((reply) => {
                                            const isReplyAuthor = currentUser?.id === reply.user_id;
                                            const canDeleteReply = isReplyAuthor || isTeacherOrAdmin(currentUser?.role);
                                            const isEditingReply = editingCommentId === reply.id;

                                            return (
                                                <div
                                                    key={reply.id}
                                                    className="bg-stone-50/75 rounded-xl border border-stone-200/70 p-3 sm:p-4 space-y-2 hover:border-stone-300 transition"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-7 h-7 rounded-full font-bold text-[10px] flex items-center justify-center shadow-2xs shrink-0 ${
                                                                isTeacherOrAdmin(reply.user?.role)
                                                                    ? 'bg-amber-700 text-white'
                                                                    : 'bg-stone-300 text-stone-800'
                                                            }`}>
                                                                {getInitials(reply.user?.name || 'User')}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="font-semibold text-xs text-stone-900">
                                                                        {reply.user?.name}
                                                                    </span>
                                                                    {reply.user?.role && getRoleBadge(reply.user.role)}
                                                                    {reply.reply_to_user && (
                                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2 py-0.2 rounded-md">
                                                                            @{reply.reply_to_user.name}
                                                                        </span>
                                                                    )}
                                                                    {reply.created_at !== reply.updated_at && (
                                                                        <span className="text-[10px] text-stone-400 italic">
                                                                            {t('comments.edited')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-stone-400 block mt-0.5">
                                                                    {formatDate(reply.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Reply Actions */}
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReply(comment.id, reply.id, reply.user?.name || '')}
                                                                className="px-2 py-0.5 rounded text-stone-500 hover:text-amber-800 hover:bg-amber-50 font-medium transition flex items-center gap-1 text-[11px]"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                                <span>{t('comments.reply')}</span>
                                                            </button>

                                                            {isReplyAuthor && !isEditingReply && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenEdit(reply)}
                                                                    className="px-2 py-0.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 font-medium transition text-[11px]"
                                                                >
                                                                    {t('comments.edit')}
                                                                </button>
                                                            )}

                                                            {canDeleteReply && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCommentToDelete(reply.id)}
                                                                    className="px-2 py-0.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 font-medium transition text-[11px]"
                                                                >
                                                                    {t('comments.delete')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reply Content or Inline Editor */}
                                                    {isEditingReply ? (
                                                        <form onSubmit={(e) => handleSubmitEdit(e, reply.id)} className="space-y-2.5 pt-1">
                                                            <RichTextEditor
                                                                value={editForm.data.content}
                                                                onChange={(html) => editForm.setData('content', html)}
                                                                variant="comment"
                                                                minHeight="70px"
                                                                error={editForm.errors.content}
                                                            />
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCancelEdit}
                                                                    className="px-2.5 py-1 rounded border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-100 transition"
                                                                >
                                                                    {t('comments.cancel')}
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={editForm.processing || editForm.data.content.trim() === ''}
                                                                    className="px-3 py-1 rounded bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition shadow-xs"
                                                                >
                                                                    {editForm.processing ? '...' : t('comments.save_changes')}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div
                                                            className="prose prose-stone prose-xs sm:prose-sm max-w-none text-stone-800 leading-relaxed pl-1 break-words"
                                                            dangerouslySetInnerHTML={{ __html: reply.content }}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Inline Reply Input (Attached strictly under this root thread) */}
                                {isReplyingThisThread && (
                                    <div className="mt-4 pt-3 border-t border-stone-200/80 bg-stone-50/90 rounded-xl p-3 sm:p-4 space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                {t('comments.replying_to', { name: `@${replyTargetComment?.name || ''}` })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleCancelReply}
                                                className="text-stone-400 hover:text-stone-700 text-[11px] underline"
                                            >
                                                {t('comments.cancel_reply')}
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitReply} className="space-y-3">
                                            <RichTextEditor
                                                value={replyForm.data.content}
                                                onChange={(html) => replyForm.setData('content', html)}
                                                placeholder={t('comments.write_reply_placeholder')}
                                                variant="comment"
                                                minHeight="70px"
                                                error={replyForm.errors.content}
                                            />

                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCancelReply}
                                                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-100 transition"
                                                >
                                                    {t('comments.cancel')}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={replyForm.processing || replyForm.data.content.trim() === ''}
                                                    className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition shadow-xs disabled:opacity-50"
                                                >
                                                    {replyForm.processing ? '...' : t('comments.post_reply')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            {commentToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg shrink-0">
                                🗑️
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-stone-900 text-base">
                                    {t('comments.delete_confirm_title')}
                                </h4>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {t('comments.delete_confirm_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                            <button
                                type="button"
                                onClick={() => setCommentToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
                            >
                                {t('comments.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
                            >
                                {isDeleting ? '...' : t('comments.confirm_delete_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
