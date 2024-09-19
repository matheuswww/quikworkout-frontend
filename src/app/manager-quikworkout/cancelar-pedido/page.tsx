import CancelOrderForm from '@/components/manager/cancelOrder/cancelOrderForm';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Cancelar pedido',
};

export default function Page() {
 const cookieInfos = cookies().get('userProfile');

 return (
  <CancelOrderForm
   cookieName={cookieInfos?.name}
   cookieVal={cookieInfos?.value}
  />
 );
}
