import { memo } from "react";

export const IconRenderer: React.FC<{ name: string; className?: string }> = memo(({ 
  name, 
  className 
}) => (
  <span className={className}>
    {name}
  </span>
));

IconRenderer.displayName = 'IconRenderer';