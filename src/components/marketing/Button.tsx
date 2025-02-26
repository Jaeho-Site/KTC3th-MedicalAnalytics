interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset' 
  className?: string
  disabled?: boolean
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick,
  type,
  className,
  disabled
}: ButtonProps) => {
  const baseStyles = "font-semibold rounded-lg transition-colors duration-200"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100"
  }
  
  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
