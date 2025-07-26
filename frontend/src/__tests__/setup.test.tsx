import { render, screen } from '@testing-library/react';

describe('Testing Setup Verification', () => {
  it('should render a simple component', () => {
    render(<div>Test Setup Working</div>);
    expect(screen.getByText('Test Setup Working')).toBeInTheDocument();
  });

  it('should have access to jest-dom matchers', () => {
    const { container } = render(
      <button disabled>Disabled Button</button>
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('should have mocked window.matchMedia', () => {
    expect(window.matchMedia).toBeDefined();
    expect(window.matchMedia('(prefers-color-scheme: dark)')).toMatchObject({
      matches: false,
      media: '(prefers-color-scheme: dark)',
    });
  });
});