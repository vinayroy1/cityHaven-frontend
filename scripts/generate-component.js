#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component generator script
const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Please provide a component name');
  console.log('Usage: npm run generate:component <ComponentName>');
  process.exit(1);
}

const componentDir = path.join(__dirname, '../src/components/ui', componentName);
const componentFile = path.join(componentDir, `${componentName}.tsx`);
const testFile = path.join(componentDir, `${componentName}.test.tsx`);
const indexFile = path.join(componentDir, 'index.ts');

// Create component directory
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Component template
const componentTemplate = `import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn('${componentName.toLowerCase()}', className)}
      {...props}
    >
      {children}
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;

// Test template
const testTemplate = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByRole('div')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${componentName} className="custom-class" />);
    expect(screen.getByRole('div')).toHaveClass('custom-class');
  });
});
`;

// Index template
const indexTemplate = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}';
`;

// Write files
fs.writeFileSync(componentFile, componentTemplate);
fs.writeFileSync(testFile, testTemplate);
fs.writeFileSync(indexFile, indexTemplate);

console.log(\`✅ Component \${componentName} created successfully!\`);
console.log(\`📁 Location: \${componentDir}\`);