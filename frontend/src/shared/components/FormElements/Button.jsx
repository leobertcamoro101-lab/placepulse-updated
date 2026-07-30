import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn'; // adjust path to match your folder structure

function Button ({
  href,
  to,
  exact,
  size,
  inverse,
  danger,
  disabled,
  type,
  onClick,
  className,
  children
}) {
  const baseClasses = 'font-inherit px-6 py-2 border rounded-[4px] cursor-pointer mr-4 no-underline inline-block focus:outline-none transition-colors duration-200';

  let sizeClasses = 'text-base';
  if (size === 'small') sizeClasses = 'text-[0.8rem]';
  if (size === 'big') sizeClasses = 'text-[1.5rem]';

  let variantClasses;
  if (danger) {
    variantClasses = 'bg-[#830000] border-[#830000] text-white hover:bg-[#f34343] hover:border-[#f34343] active:bg-[#f34343] active:border-[#f34343]';
  } else if (inverse) {
    variantClasses = 'bg-transparent border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-white active:bg-[#ff0055] active:text-white';
  } else {
    variantClasses = 'bg-[#ff0055] border-[#ff0055] text-white hover:bg-[#ff4382] hover:border-[#ff4382] active:bg-[#ff4382] active:border-[#ff4382]';
  }

  // disabled always wins, regardless of what className passes in
  const disabledClasses = 'disabled:bg-[#ccc] disabled:text-[#979797] disabled:border-[#ccc] disabled:cursor-not-allowed disabled:hover:bg-[#ccc] disabled:hover:border-[#ccc]';

  const combinedClasses = cn(
    baseClasses,
    sizeClasses,
    variantClasses,
    disabledClasses,
    className
  );

  if (href) {
    return (
      <a className={combinedClasses} href={href}>
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} exact={exact} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;