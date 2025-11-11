import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectOption } from '../Select';

describe('Select Component', () => {
  const options: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders select with options', () => {
    render(<Select options={options} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    options.forEach(option => {
      expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument();
    });
  });

  it('renders with label', () => {
    render(<Select options={options} label="Select Label" />);
    expect(screen.getByLabelText(/select label/i)).toBeInTheDocument();
  });

  it('handles selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'option2');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Select options={options} error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(<Select options={options} helperText="This is a helper text" />);
    expect(screen.getByText(/this is a helper text/i)).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select options={options} placeholder="Choose an option" />);
    expect(screen.getByRole('option', { name: /choose an option/i })).toBeInTheDocument();
  });

  it('applies full width when fullWidth is true', () => {
    render(<Select options={options} fullWidth />);
    expect(screen.getByRole('combobox').parentElement).toHaveClass('w-full');
  });

  it('applies error styling when error is present', () => {
    render(<Select options={options} error="Error" />);
    expect(screen.getByRole('combobox')).toHaveClass('border-red-300');
  });

  it('renders disabled select', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});