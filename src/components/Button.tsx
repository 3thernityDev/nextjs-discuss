const Button = ({
    onClick,
    children,
    color,
    type,
    disabled,
}: {
    onClick: () => void;
    children: React.ReactNode;
    color: string;
    type: "button" | "submit" | "reset";
    disabled?: boolean;
}) => {
    return (
        <button
            onClick={onClick}
            className={`bg-${color}-500 text-white py-2 px-4 rounded hover:bg-${color}-600 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
