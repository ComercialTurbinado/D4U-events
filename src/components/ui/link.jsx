import { Link as RouterLink } from "react-router-dom";

export function Link({ to, children, className, ...props }) {
  return (
    <RouterLink
      to={to}
      className={`text-blue-600 hover:text-blue-800 hover:underline ${className || ''}`}
      {...props}
    >
      {children}
    </RouterLink>
  );
}

export { Link as default }; 