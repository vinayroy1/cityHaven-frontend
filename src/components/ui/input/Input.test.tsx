import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(<Input helperText="This is a helper text" />);
    expect(screen.getByText(/this is a helper text/i)).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    render(<Input helperText="Helper text" error="Error message" />);
    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });

  it('applies full width when fullWidth is true', () => {
    render(<Input fullWidth />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass('w-full');
  });

  it('renders left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">📧</span>;
    render(<Input leftIcon={<LeftIcon />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">👁️</span>;
    render(<Input rightIcon={<RightIcon />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300', 'text-red-900');
  });
});