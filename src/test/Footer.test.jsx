import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Footer from '../components/Footer';

describe('Footer social links', () => {
  it('renders links to the restaurant social networks', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);

    for (const network of ['Facebook El Cacique', 'Instagram El Cacique', 'WhatsApp El Cacique', 'TikTok El Cacique']) {
      expect(screen.getByRole('link', { name: network })).toHaveAttribute('target', '_blank');
    }
  });
});
