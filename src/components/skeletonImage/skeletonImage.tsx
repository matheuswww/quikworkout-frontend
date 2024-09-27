'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './skeletonImage.module.css';
import {
 ImageLoader,
 OnLoadingComplete,
 PlaceholderValue,
 StaticImport,
} from 'next/dist/shared/lib/get-img-props';

interface skeletonImageProps
 extends Omit<
  React.DetailedHTMLProps<
   React.ImgHTMLAttributes<HTMLImageElement>,
   HTMLImageElement
  >,
  'height' | 'width' | 'loading' | 'ref' | 'alt' | 'src' | 'srcSet'
 > {
 src: string | StaticImport;
 alt: string;
 width?: number | `${number}` | undefined;
 height?: number | `${number}` | undefined;
 fill?: boolean | undefined;
 loader?: ImageLoader | undefined;
 quality?: number | `${number}` | undefined;
 priority?: boolean | undefined;
 loading?: 'eager' | 'lazy' | undefined;
 placeholder?: PlaceholderValue | undefined;
 blurDataURL?: string | undefined;
 unoptimized?: boolean | undefined;
 onLoadingComplete?: OnLoadingComplete | undefined;
 layout?: string | undefined;
 objectFit?: string | undefined;
 objectPosition?: string | undefined;
 lazyBoundary?: string | undefined;
 lazyRoot?: string | undefined;
}

const SkeletonImage = React.forwardRef<
 HTMLImageElement | null,
 skeletonImageProps
>((props, ref) => {
 const [load, setLoad] = useState<boolean>(true);

 function handleLoad(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = 'revert-layer';
  setTimeout(() => {
    setLoad(false)
  }, 1500);
 }

 return (
  <>
   <Image style={{opacity: "0"}} {...props} ref={ref} onLoad={handleLoad} />
   {load && <span tabIndex={0} aria-label="carregando imagem" className={`${styles.skeleton}`}></span>}
  </>
 );
});

export default SkeletonImage;
