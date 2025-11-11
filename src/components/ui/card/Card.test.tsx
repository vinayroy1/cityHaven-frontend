import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders card with content', () => {
    render(
      <Card>
        <h1>Card Title</h1>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByRole('heading', { name: /card title/i })).toBeInTheDocument();
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText(/content/i)).toHaveClass('custom-class');
  });

  it('applies different padding sizes', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>);
    expect(screen.getByText(/small padding/i)).toHaveClass('p-4');

    rerender(<Card padding="md">Medium padding</Card>);
    expect(screen.getByText(/medium padding/i)).toHaveClass('p-6');

    rerender(<Card padding="lg">Large padding</Card>);
    expect(screen.getByText(/large padding/i)).toHaveClass('p-8');
  });

  it('applies shadow when shadow prop is true', () => {
    render(<Card shadow>Shadow card</Card>);
    expect(screen.getByText(/shadow card/i)).toHaveClass('shadow-lg');
  });

  it('applies border when border prop is true', () => {
    render(<Card border>Border card</Card>);
    expect(screen.getByText(/border card/i)).toHaveClass('border');
  });

  it('applies hover effect when hover prop is true', () => {
    render(<Card hover>Hover card</Card>);
    expect(screen.getByText(/hover card/i)).toHaveClass('hover:shadow-lg');
  });

  it('applies full width when fullWidth prop is true', () => {
    render(<Card fullWidth>Full width card</Card>);
    expect(screen.getByText(/full width card/i)).toHaveClass('w-full');
  });
});