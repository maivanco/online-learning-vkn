import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: string;
    error?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Enter content...',
    minHeight = '140px',
    error,
    id,
    disabled = false,
    className = '',
}: RichTextEditorProps) {
    const editor = useEditor({
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3, 4],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-amber-700 underline font-medium hover:text-amber-800',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: `prose prose-stone prose-sm max-w-none focus:outline-none p-3.5 text-stone-800 leading-relaxed`,
                style: `min-height: ${minHeight};`,
                ...(id ? { id } : {}),
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.isEmpty ? '' : editor.getHTML();
            onChange(html);
        },
    });

    useEffect(() => {
        if (!editor) return;
        const currentHTML = editor.getHTML();
        const safeValue = value || '';
        if (safeValue !== currentHTML && !(editor.isEmpty && safeValue === '')) {
            editor.commands.setContent(safeValue, { emitUpdate: false });
        }
    }, [value, editor]);

    useEffect(() => {
        if (editor && editor.isEditable !== !disabled) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href || '';
        const url = window.prompt('Enter link URL (e.g. https://example.com):', previousUrl);

        if (url === null) return;
        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    const buttonClass = (isActive: boolean) =>
        `px-2 py-1 text-xs font-medium rounded transition flex items-center justify-center min-w-[26px] h-[26px] ${
            isActive
                ? 'bg-amber-100 text-amber-900 font-semibold shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
        }`;

    return (
        <div
            className={`rounded-lg border bg-white transition shadow-2xs overflow-hidden ${
                error
                    ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200'
                    : 'border-stone-300 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20'
            } ${disabled ? 'opacity-60 pointer-events-none' : ''} ${className}`}
        >
            {/* Toolbar */}
            <div className="bg-stone-50 border-b border-stone-200 px-2.5 py-1.5 flex flex-wrap items-center gap-1 text-stone-700 select-none">
                {/* Text Formats */}
                <button
                    type="button"
                    title="Bold (Ctrl+B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={buttonClass(editor.isActive('bold'))}
                >
                    <span className="font-bold">B</span>
                </button>
                <button
                    type="button"
                    title="Italic (Ctrl+I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={buttonClass(editor.isActive('italic'))}
                >
                    <span className="italic font-serif font-bold">I</span>
                </button>
                <button
                    type="button"
                    title="Underline (Ctrl+U)"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={buttonClass(editor.isActive('underline'))}
                >
                    <span className="underline font-semibold">U</span>
                </button>
                <button
                    type="button"
                    title="Strikethrough"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={buttonClass(editor.isActive('strike'))}
                >
                    <span className="line-through font-semibold text-[11px]">S</span>
                </button>

                <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                {/* Headings */}
                <button
                    type="button"
                    title="Paragraph / Normal Text"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={buttonClass(editor.isActive('paragraph') && !editor.isActive('heading'))}
                >
                    <span className="text-[11px] font-medium">P</span>
                </button>
                <button
                    type="button"
                    title="Heading 2"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={buttonClass(editor.isActive('heading', { level: 2 }))}
                >
                    <span className="text-[11px] font-bold">H2</span>
                </button>
                <button
                    type="button"
                    title="Heading 3"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={buttonClass(editor.isActive('heading', { level: 3 }))}
                >
                    <span className="text-[11px] font-bold">H3</span>
                </button>

                <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                {/* Lists */}
                <button
                    type="button"
                    title="Bullet List"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={buttonClass(editor.isActive('bulletList'))}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Numbered List"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={buttonClass(editor.isActive('orderedList'))}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Quote Block"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={buttonClass(editor.isActive('blockquote'))}
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Code Block"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={buttonClass(editor.isActive('codeBlock'))}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </button>

                <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                {/* Link */}
                <button
                    type="button"
                    title="Insert Link"
                    onClick={setLink}
                    className={buttonClass(editor.isActive('link'))}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </button>

                <div className="w-[1px] h-4 bg-stone-300 mx-1" />

                {/* Undo / Redo */}
                <button
                    type="button"
                    title="Undo (Ctrl+Z)"
                    disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                    className={`px-1.5 py-1 text-xs rounded transition flex items-center justify-center h-[26px] ${
                        editor.can().undo() ? 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900' : 'text-stone-300 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Redo (Ctrl+Y)"
                    disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                    className={`px-1.5 py-1 text-xs rounded transition flex items-center justify-center h-[26px] ${
                        editor.can().redo() ? 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900' : 'text-stone-300 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
                    </svg>
                </button>
            </div>

            {/* Editor Area */}
            <div className="bg-white">
                <EditorContent editor={editor} />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50/80 px-3 py-1 border-t border-red-200 text-red-600 text-[11px]">
                    {error}
                </div>
            )}
        </div>
    );
}
