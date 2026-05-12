export type MessageImage = {
    dataUrl: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    name: string;
    size: number;
};

export default interface Message {
    _id: string;
    content: string;
    image?: MessageImage;
    userId: string;
    userName: string;
    createdAt: string;
    editedAt?: string;
    status?: "visible";
}
