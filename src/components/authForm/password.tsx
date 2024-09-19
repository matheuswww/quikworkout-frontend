'use client';
import styles from './password.module.css';
import VisibilityOn from 'next/image';
import VisibilityOff from 'next/image';
import React, {
 DetailedHTMLProps,
 InputHTMLAttributes,
 forwardRef,
 useState,
} from 'react';

const Password = forwardRef<
 HTMLInputElement,
 DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>((props, ref) => {
 const [visible, setVisible] = useState<boolean>(false);

 return (
  <>
   <input
    type={visible ? 'text' : 'password'}
    min={8}
    max={72}
    {...props}
    ref={ref}
   />
   <span className={styles.span}>
    <button
     type="button"
     className={`${styles.visibility} ${!visible && styles.visibilityOff}`}
     onClick={() => setVisible(!visible)}
    >
     {visible ? (
      <VisibilityOn
       src={'/img/visibilityOn.png'}
       alt="olho aberto indicando que a senha é visível"
       width={22}
       height={15}
      />
     ) : (
      <VisibilityOff
       src={'/img/visibilityOff.png'}
       alt="olho fechado indicando que a senha não é visível"
       width={22}
       height={19.8}
      />
     )}
    </button>
   </span>
  </>
 );
});

export default Password;
