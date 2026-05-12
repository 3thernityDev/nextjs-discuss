const Button = ({
    onClick,
    children,
    color,
}: {
    onClick: () => void;
    children: React.ReactNode;
    color: string;
}) => {
    return (
        <button
            onClick={onClick}
            className={`bg-${color}-500 text-white py-2 px-4 rounded hover:bg-${color}-600 cursor-pointer`}
        >
            {children}
        </button>
    );
};

export default Button;
