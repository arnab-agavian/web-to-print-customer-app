import './globals.css';
import './forms.css';
import './journey.css';
import StoreProvider from '@/components/StoreProvider';

export const metadata = {
  title: 'Digital Heroes — Print without the guesswork',
  description: 'Configure, design and order production-ready print online.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}

