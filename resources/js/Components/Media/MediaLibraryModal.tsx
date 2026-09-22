import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { MediaFileItem, MediaPaginatedResponse } from '@/types/media';

export interface SelectedMediaPayload {
    url: string;
    alt_text?: string;
    original_name: string;
    media_type: 'image' | 'document';
    file_size?: number;
}

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: SelectedMediaPayload) => void;
    allowedType?: 'all' | 'image' | 'document';
}

function formatBytes(bytes: number, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function MediaLibraryModal({
    isOpen,
    onClose,
    onSelect,
    allowedType = 'all',
}: MediaLibraryModalProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
    const [items, setItems] = useState<MediaFileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaFileItem | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>(allowedType);
    
    // Details editing state
    const [altText, setAltText] = useState('');
    const [savingMeta, setSavingMeta] = useState(false);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Embed URL state
    const [externalUrl, setExternalUrl] = useState('');
    const [externalAlt, setExternalAlt] = useState('');
    const [externalType, setExternalType] = useState<'image' | 'document'>('image');

    // Fetch media list
    const fetchMedia = useCallback(async (targetPage = 1, search = searchQuery, type = typeFilter) => {
        setLoading(true);
        try {
            const res = await axios.get<MediaPaginatedResponse>('/admin/media', {
                params: {
                    page: targetPage,
                    search: search.trim() || undefined,
                    type: type !== 'all' ? type : undefined,
                    per_page: 24,
                },
            });
            setItems(res.data.data);
            setPage(res.data.current_page);
            setTotalPages(res.data.last_page);
            setTotalCount(res.data.total);
            
            // If current selected item is no longer in list, keep it or clear
            if (selectedItem && !res.data.data.some(i => i.id === selectedItem.id)) {
                // keep selected
            }
        } catch (err) {
            console.error('Failed to load media', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, typeFilter, selectedItem]);

    // Initial load and filter change
    useEffect(() => {
        if (isOpen) {
            fetchMedia(1, searchQuery, typeFilter);
        }
    }, [isOpen, typeFilter]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            fetchMedia(1, searchQuery, typeFilter);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Update Alt Text handler
    useEffect(() => {
        if (selectedItem) {
            setAltText(selectedItem.alt_text || '');
        } else {
            setAltText('');
        }
    }, [selectedItem]);

    const handleSaveAltText = async () => {
        if (!selectedItem || altText === (selectedItem.alt_text || '')) return;
        setSavingMeta(true);
        try {
            await axios.patch(`/admin/media/${selectedItem.id}`, {
                alt_text: altText,
            });
            setSelectedItem(prev => prev ? { ...prev, alt_text: altText } : null);
            setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, alt_text: altText } : item));
        } catch (err) {
            console.error('Failed to update alt text', err);
        } finally {
            setSavingMeta(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this media file permanently?')) return;
        try {
            await axios.delete(`/admin/media/${id}`);
            if (selectedItem?.id === id) {
                setSelectedItem(null);
            }
            fetchMedia(page, searchQuery, typeFilter);
        } catch (err) {
            alert('Failed to delete media file');
        }
    };

    const handleUploadFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files[]', file);
        });

        try {
            const res = await axios.post('/admin/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                },
            });

            // If single file uploaded, select it
            const uploadedData = res.data.data;
            const firstUploaded: MediaFileItem = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData;

            await fetchMedia(1, '', typeFilter);
            setActiveTab('library');
            if (firstUploaded) {
                setSelectedItem(firstUploaded);
            }
        } catch (err: any) {
            console.error('Upload failed', err);
            setUploadError(err.response?.data?.message || 'Upload failed. Please check file type and size limit.');
        } finally {
            setUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleInsert = () => {
        if (activeTab === 'url') {
            if (!externalUrl.trim()) return;
            onSelect({
                url: externalUrl.trim(),
                alt_text: externalAlt.trim(),
                original_name: externalUrl.split('/').pop() || 'embedded-file',
                media_type: externalType,
            });
            onClose();
            return;
        }

        if (selectedItem) {
            onSelect({
                url: selectedItem.url,
                alt_text: altText || selectedItem.alt_text || selectedItem.original_name,
                original_name: selectedItem.original_name,
                media_type: selectedItem.media_type,
                file_size: selectedItem.file_size,
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">Media Library</h3>
                            <p className="text-xs text-stone-500">Insert reusable optimized images or document attachments</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-stone-200/70 p-1 rounded-xl text-xs font-semibold text-stone-600">
                        <button
                            type="button"
                            onClick={() => setActiveTab('library')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                activeTab === 'library'
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'hover:text-stone-900'
                            }`}
                        >
                            Media Library ({totalCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                activeTab === 'upload'
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'hover:text-stone-900'
                            }`}
                        >
                            Upload Files
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('url')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                activeTab === 'url'
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'hover:text-stone-900'
                            }`}
                        >
                            Embed from URL
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Tab 1: Library */}
                    {activeTab === 'library' && (
                        <>
                            {/* Left Area: Filter & Grid */}
                            <div className="flex-1 flex flex-col overflow-hidden border-r border-stone-200 bg-stone-50/30">
                                {/* Search & Filter Bar */}
                                <div className="p-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5 bg-white">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search by file name or alt text..."
                                            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                                        />
                                        <svg className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    <div className="flex items-center space-x-1.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setTypeFilter('all')}
                                            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                                                typeFilter === 'all'
                                                    ? 'bg-amber-100 text-amber-900 font-semibold'
                                                    : 'text-stone-600 hover:bg-stone-100'
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTypeFilter('image')}
                                            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                                                typeFilter === 'image'
                                                    ? 'bg-amber-100 text-amber-900 font-semibold'
                                                    : 'text-stone-600 hover:bg-stone-100'
                                            }`}
                                        >
                                            Images
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTypeFilter('document')}
                                            className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                                                typeFilter === 'document'
                                                    ? 'bg-amber-100 text-amber-900 font-semibold'
                                                    : 'text-stone-600 hover:bg-stone-100'
                                            }`}
                                        >
                                            Documents
                                        </button>
                                    </div>
                                </div>

                                {/* Items Grid */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Loading media files...</span>
                                            </div>
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                                            <svg className="w-12 h-12 mb-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm font-medium text-stone-600">No media found</p>
                                            <p className="text-xs text-stone-400 mt-1">Upload new media or refine your search query</p>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('upload')}
                                                className="mt-4 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                                            >
                                                Upload Media Now
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {items.map(item => {
                                                const isSelected = selectedItem?.id === item.id;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => setSelectedItem(item)}
                                                        className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-white transition aspect-square flex flex-col ${
                                                            isSelected
                                                                ? 'border-amber-600 ring-2 ring-amber-500 shadow-md'
                                                                : 'border-stone-200 hover:border-amber-300 hover:shadow-xs'
                                                        }`}
                                                    >
                                                        {item.media_type === 'image' ? (
                                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center overflow-hidden">
                                                                <img
                                                                    src={item.url}
                                                                    alt={item.alt_text || item.original_name}
                                                                    className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-stone-50 p-2.5 flex flex-col items-center justify-center text-center">
                                                                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-[10px] font-semibold text-stone-700 line-clamp-2 break-all">
                                                                    {item.original_name}
                                                                </span>
                                                                <span className="text-[9px] uppercase font-bold text-amber-700 mt-1">
                                                                    {item.mime_type.split('/').pop()?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Selected Badge */}
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white rounded-full p-0.5 shadow">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Footer */}
                                {totalPages > 1 && (
                                    <div className="p-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-600">
                                        <span>Page {page} of {totalPages} ({totalCount} total)</span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                disabled={page <= 1}
                                                onClick={() => fetchMedia(page - 1)}
                                                className="px-2.5 py-1 rounded border border-stone-300 disabled:opacity-40 hover:bg-stone-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                type="button"
                                                disabled={page >= totalPages}
                                                onClick={() => fetchMedia(page + 1)}
                                                className="px-2.5 py-1 rounded border border-stone-300 disabled:opacity-40 hover:bg-stone-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Inspector Panel */}
                            <div className="w-full md:w-80 bg-white p-4 overflow-y-auto flex flex-col justify-between border-t md:border-t-0">
                                {selectedItem ? (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                                            Attachment Details
                                        </h4>

                                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 overflow-hidden flex items-center justify-center max-h-48">
                                            {selectedItem.media_type === 'image' ? (
                                                <img
                                                    src={selectedItem.url}
                                                    alt={selectedItem.alt_text || selectedItem.original_name}
                                                    className="max-h-44 object-contain rounded-lg shadow-2xs"
                                                />
                                            ) : (
                                                <div className="py-6 flex flex-col items-center">
                                                    <svg className="w-12 h-12 text-amber-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-xs font-semibold text-stone-700 text-center line-clamp-2 px-2">
                                                        {selectedItem.original_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 text-xs text-stone-600">
                                            <p className="font-semibold text-stone-900 truncate" title={selectedItem.original_name}>
                                                {selectedItem.original_name}
                                            </p>
                                            <p className="text-[11px] text-stone-500">
                                                Size: {formatBytes(selectedItem.file_size)}
                                                {selectedItem.width && selectedItem.height && (
                                                    <span> • {selectedItem.width} × {selectedItem.height} px</span>
                                                )}
                                            </p>
                                            <p className="text-[11px] text-stone-500">
                                                Type: <span className="uppercase">{selectedItem.mime_type.split('/').pop()}</span>
                                            </p>
                                            {selectedItem.user && (
                                                <p className="text-[11px] text-stone-500">
                                                    Uploaded by: <span className="font-medium text-stone-700">{selectedItem.user.name}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Alt Text Input */}
                                        <div className="pt-2">
                                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                                Alt Text / Label
                                            </label>
                                            <div className="flex gap-1.5">
                                                <input
                                                    type="text"
                                                    value={altText}
                                                    onChange={e => setAltText(e.target.value)}
                                                    onBlur={handleSaveAltText}
                                                    placeholder="Descriptive alt text for accessibility..."
                                                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                                                />
                                            </div>
                                            <p className="text-[10px] text-stone-400 mt-1">
                                                Used for screen readers and search engines
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                                            <a
                                                href={selectedItem.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 font-medium"
                                            >
                                                <span>View Full Size</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(selectedItem.id)}
                                                className="text-[11px] text-red-600 hover:text-red-700 font-medium hover:underline"
                                            >
                                                Delete file
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 text-xs">
                                        <svg className="w-10 h-10 mb-2 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        <span>Click any item in the gallery to view details or select it for insertion.</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Tab 2: Upload */}
                    {activeTab === 'upload' && (
                        <div className="flex-1 p-8 flex flex-col items-center justify-center bg-stone-50/50">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
                                }}
                                className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition ${
                                    dragActive
                                        ? 'border-amber-600 bg-amber-50/50 scale-[1.01]'
                                        : 'border-stone-300 bg-white hover:border-stone-400'
                                }`}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>

                                <h4 className="text-base font-bold text-stone-800 mb-1">
                                    Drag & drop media files here
                                </h4>
                                <p className="text-xs text-stone-500 max-w-sm mb-5">
                                    Supports <strong>JPG, PNG, WebP, GIF, PDF, Word, Excel</strong>. Raster images will be auto-optimized to WebP (max 1920×1080 px).
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                    onChange={e => e.target.files && handleUploadFiles(e.target.files)}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Browse Files on Device'}
                                </button>

                                {uploadProgress !== null && (
                                    <div className="w-full max-w-xs mt-6">
                                        <div className="flex justify-between text-xs text-stone-600 mb-1 font-medium">
                                            <span>Uploading & processing...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-amber-600 h-2 transition-all duration-200"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium max-w-md">
                                        {uploadError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Embed URL */}
                    {activeTab === 'url' && (
                        <div className="flex-1 p-8 flex flex-col items-center justify-center bg-stone-50/50">
                            <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-stone-800">
                                    Insert Media via External URL
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Embed an image or link directly from an external CDN or website URL.
                                </p>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                                        Direct Media URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={externalUrl}
                                        onChange={e => setExternalUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                                        Alt Text / Title (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={externalAlt}
                                        onChange={e => setExternalAlt(e.target.value)}
                                        placeholder="Description of the media..."
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                                        Type
                                    </label>
                                    <div className="flex gap-4 text-xs text-stone-700">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="externalType"
                                                checked={externalType === 'image'}
                                                onChange={() => setExternalType('image')}
                                                className="text-amber-600 focus:ring-amber-500"
                                            />
                                            Image (renders `&lt;img&gt;`)
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="externalType"
                                                checked={externalType === 'document'}
                                                onChange={() => setExternalType('document')}
                                                className="text-amber-600 focus:ring-amber-500"
                                            />
                                            Document Link / Attachment
                                        </label>
                                    </div>
                                </div>

                                {externalUrl && externalType === 'image' && (
                                    <div className="mt-4 p-2 border border-stone-200 rounded-xl bg-stone-50 flex items-center justify-center max-h-40 overflow-hidden">
                                        <img
                                            src={externalUrl}
                                            alt={externalAlt || 'Preview'}
                                            className="max-h-36 object-contain rounded"
                                            onError={() => {}}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
                    <div className="text-xs text-stone-500">
                        {selectedItem ? (
                            <span>Selected: <strong>{selectedItem.original_name}</strong></span>
                        ) : activeTab === 'url' && externalUrl ? (
                            <span className="truncate max-w-sm block">URL: {externalUrl}</span>
                        ) : (
                            <span>No item selected</span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={activeTab === 'url' ? !externalUrl.trim() : !selectedItem}
                            onClick={handleInsert}
                            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Insert Media
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
