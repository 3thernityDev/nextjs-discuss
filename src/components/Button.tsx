const Button = ({
    onClick,
    children,
    color,
    type,
    disabled,
}: {
    onClick?: () => void;
    children: React.ReactNode;
    color: string;
    type: "button" | "submit" | "reset";
    disabled?: boolean;
}) => {
    const colorClass =
        color === "orange"
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-zinc-700 hover:bg-zinc-800";

    return (
        <button
            onClick={onClick}
            className={`${colorClass} cursor-pointer rounded px-4 py-2 text-white ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
