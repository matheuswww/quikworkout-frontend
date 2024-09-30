import { apiImg } from '@/api/path';
import Clothing from '@/components/clothing/clothing';
import Footer from '@/components/footer/footer';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

interface clothingProps {
 params: {
  id: string;
  name: string;
  description: string;
 };
 searchParams: {
  img: string;
 };
}

export function generateMetadata({ ...props }: clothingProps): Metadata {
 let image: string | undefined;
 try {
  const decodedImage = atob(props.searchParams.img);
  image = decodedImage.startsWith(apiImg) ? decodedImage : undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
 } catch (_) {
  image = undefined;
 }
 return {
  title: 'Roupa ' + props.params.name,
  description: decodeURIComponent(props.params.description),
  keywords:
   'roupa crossfit, roupa academia, crossfit, academia, ' + props.params.name,
  openGraph: {
   title: 'Roupa ' + props.params.name,
   description: decodeURIComponent(props.params.description),
   images: image,
  },
 };
}

export default function Product({ ...props }: clothingProps) {
 const cookieInfos = cookies().get('userProfile');
 return (
  <>
   <Clothing
    id={props.params.id}
    cookieName={cookieInfos?.name}
    cookieVal={cookieInfos?.value}
   />
   <Footer />
  </>
 );
}
