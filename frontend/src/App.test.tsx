import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders email generator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Email Template Generator/i);
  expect(titleElement).toBeInTheDocument();
});
