import Clothings from '@/components/manager/clothing/clothings';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Roupas',
};

export default function Page() {
 const cookieInfos = cookies().get('adminProfile');
 return (
  <Clothings cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
 );
}
