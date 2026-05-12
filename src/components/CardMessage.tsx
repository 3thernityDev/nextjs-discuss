"use client";

import { useEffect, useMemo, useState } from "react";
import Message from "@/types/Message";
import { moderateMessage } from "@/lib/moderation";
import { toast } from "react-hot-toast";
import { FaCheck, FaEdit, FaRegCopy, FaTimes, FaTrash } from "react-icons/fa";

const EDIT_WINDOW_MS = 5 * 60 * 1000;

export default function CardMessage({
    m,
    userId,
}: {
    m: Message;
    userId: string | undefined;
}) {
    const isOwn = m.userId === userId;
    const sentAt = useMemo(() => new Date(m.createdAt), [m.createdAt]);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(m.content);
    const [saving, setSaving] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        function updateCanEdit() {
            setCanEdit(isOwn && Date.now() - sentAt.getTime() <= EDIT_WINDOW_MS);
        }

        const initial = window.setTimeout(updateCanEdit, 0);
        const interval = window.setInterval(updateCanEdit, 15_000);

        return () => {
            window.clearTimeout(initial);
            window.clearInterval(interval);
        };
    }, [isOwn, sentAt]);

    async function deleteMessage(_id: string) {
        const request = await fetch("/api/messages", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id }),
        });

        if (!request.ok) {
            const data = await request.json();
            toast.error(data.error ?? "Suppression impossible.");
        } else {
            window.dispatchEvent(
                new CustomEvent<string>("messages:deleted", { detail: _id }),
            );
            toast.success("Message supprime.");
        }
    }

    async function editMessage() {
        if (!editContent.trim() && !m.image) {
            toast.error("Le message ne peut pas etre vide.");
            return;
        }

        if (editContent.trim()) {
            const moderation = moderateMessage(editContent);
            if (!moderation.allowed) {
                toast.error(moderation.reason);
                return;
            }
        }

        setSaving(true);
        const request = await fetch("/api/messages", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: m._id, content: editContent }),
        });

        if (request.ok) {
            const updated = (await request.json()) as Message;
            window.dispatchEvent(
                new CustomEvent<Message>("messages:updated", { detail: updated }),
            );
            setIsEditing(false);
            toast.success("Message modifie.");
        } else {
            const data = await request.json();
            toast.error(data.error ?? "Modification impossible.");
        }

        setSaving(false);
    }

    async function copyMessage() {
        try {
            await navigator.clipboard.writeText(m.content || m.image?.name || "");
            toast.success("Message copie.");
        } catch {
            toast.error("Copie impossible.");
        }
    }

    function startEditing() {
        setEditContent(m.content);
        setIsEditing(true);
    }

    return (
        <article
            className={`flex w-full px-2 ${isOwn ? "justify-end" : "justify-start"}`}
        >
            <div className="group flex max-w-[88%] flex-col gap-1 sm:max-w-[72%]">
                {!isOwn && (
                    <span className="ml-3 text-xs font-semibold text-zinc-500">
                        {m.userName}
                    </span>
                )}

                <div className="flex items-end gap-2">
                    {isOwn && !isEditing && (
                        <MessageActions
                            onCopy={copyMessage}
                            onDelete={() => void deleteMessage(m._id)}
                            onEdit={canEdit ? startEditing : undefined}
                            canDelete
                        />
                    )}

                    <div
                        className={`relative overflow-hidden rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md ${
                            isOwn
                                ? "rounded-br-md bg-orange-500 text-white"
                                : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        }`}
                    >
                        {m.image && (
                            <a
                                href={m.image.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mb-2 block overflow-hidden rounded-xl"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={m.image.dataUrl}
                                    alt={m.image.name}
                                    className="max-h-80 w-full min-w-52 object-cover"
                                />
                            </a>
                        )}

                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    className="min-w-60 resize-none rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30"
                                        aria-label="Annuler"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void editMessage()}
                                        disabled={saving}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                                        aria-label="Enregistrer"
                                    >
                                        <FaCheck size={12} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            m.content && (
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {m.content}
                                </p>
                            )
                        )}
                    </div>

                    {!isOwn && (
                        <MessageActions onCopy={copyMessage} canDelete={false} />
                    )}
                </div>

                <span
                    title={sentAt.toLocaleString("fr-FR")}
                    className={`px-2 text-[11px] text-zinc-400 ${
                        isOwn ? "text-right" : "text-left"
                    }`}
                >
                    {sentAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {m.editedAt ? " · modifie" : ""}
                    {canEdit && !isEditing ? " · editable" : ""}
                </span>
            </div>
        </article>
    );
}

function MessageActions({
    onCopy,
    onDelete,
    onEdit,
    canDelete,
}: {
    onCopy: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    canDelete: boolean;
}) {
    return (
        <div className="flex translate-y-1 gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <button
                type="button"
                onClick={onCopy}
                aria-label="Copier le message"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
                <FaRegCopy size={12} />
            </button>

            {onEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    aria-label="Modifier le message"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                    <FaEdit size={12} />
                </button>
            )}

            {canDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    aria-label="Supprimer le message"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-red-500 shadow-sm hover:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                    <FaTrash size={11} />
                </button>
            )}
        </div>
    );
}
