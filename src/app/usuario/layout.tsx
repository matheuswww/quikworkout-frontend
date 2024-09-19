import Footer from '@/components/footer/footer';
import '../globals.css';

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <>
   {children}
   <Footer />
  </>
 );
}
