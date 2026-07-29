import { Link } from 'react-router-dom';

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
  children
}) {
  // Base classes mapping to .button and .button:focus
  const baseClasses = 'font-inherit px-6 py-2 border rounded-[4px] cursor-pointer mr-4 no-underline inline-block focus:outline-none transition-colors duration-200';

  // Dynamic sizing based on size (.button--small, .button--big, or default)
  let sizeClasses = 'text-base'; 
  if (size === 'small') sizeClasses = 'text-[0.8rem]';
  if (size === 'big') sizeClasses = 'text-[1.5rem]';

  // Theme variant styling (.button, .button--inverse, .button--danger) + disabled overrides
  let variantClasses;

  if (disabled) {
    // Disabled states
    variantClasses = 'bg-[#ccc] text-[#979797] border-[#ccc] cursor-not-allowed';
  } else if (danger) {
    // Danger state
    variantClasses = 'bg-[#830000] border-[#830000] text-white hover:bg-[#f34343] hover:border-[#f34343] active:bg-[#f34343] active:border-[#f34343]';
  } else if (inverse) {
    // Inverse state
    variantClasses = 'bg-transparent border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-white active:bg-[#ff0055] active:text-white';
  } else {
    // Default theme state
    variantClasses = 'bg-[#ff0055] border-[#ff0055] text-white hover:bg-[#ff4382] hover:border-[#ff4382] active:bg-[#ff4382] active:border-[#ff4382]';
  }

  // Combine all processed classes
  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses}`;

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
};

export default Button;


// import { Link } from 'react-router-dom';
// import './Button.css';

// function Button ({ href, to, exact, size, inverse, danger, type, onClick, disabled, children }) {
//   const classNames = `button button--${size || 'default'} ${inverse && 'button--inverse'} ${danger && 'button--danger'}`;

//   if (href) {
//     return (
//       <a className={classNames} href={href}>
//         {children}
//       </a>
//     );
//   }

//   if (to) {
//     return (
//       <Link to={to} exact={exact} className={classNames}>
//         {children}
//       </Link>
//     );
//   }

//   return (
//     <button
//       className={classNames}
//       type={type}
//       onClick={onClick}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// };

// export default Button;