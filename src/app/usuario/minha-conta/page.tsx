import MyAccount from '@/components/myAccount/myAccount';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Minha conta',
 description: 'informações sobre minha conta',
 keywords: 'conta, minha conta quikworkout, quikworkout',
 openGraph: {
  title: 'Minha conta',
  description: 'informações sobre minha conta',
 },
};

export default function Page() {
 const cookieInfos = cookies().get('userProfile');

 return (
  <MyAccount cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
 );
}
