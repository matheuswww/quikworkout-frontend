import {
 Dispatch,
 SetStateAction,
 SyntheticEvent,
 useEffect,
 useRef,
 useState,
} from 'react';
import Counter from '../counter/counter';
import styles from './editClothingCart.module.css';
import GetClothing, {
 getClothingByIdResponse,
} from '@/api/clothing/getClothing';
import Sizes from '../sizes/sizes';
import { ChangeColor, ModalColor } from '../modalColor/modalColor';
import { clothingCart } from './getClothingCartForm';
import EditClothingCart from '@/api/clothing/editClothingCart';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';
import { getClothingCartResponse } from '@/api/clothing/getClothingCart';

interface props {
 setClothingData: Dispatch<SetStateAction<getClothingCartResponse | null>>;
 clothing: clothingCart | null;
 setPopupError: Dispatch<SetStateAction<boolean>>;
 setLoad: Dispatch<SetStateAction<boolean>>;
 load: boolean;
 open: boolean;
 setOpen: Dispatch<SetStateAction<boolean>>;
 cookieName: string | undefined;
 cookieVal: string | undefined;
 setRefresh: Dispatch<SetStateAction<boolean>>;
}

export default function EditClothingCartForm({
 clothing,
 setPopupError,
 setLoad,
 open,
 setOpen,
 cookieName,
 cookieVal,
 setRefresh,
 load,
}: props) {
 const router = useRouter();
 const [data, setData] = useState<getClothingByIdResponse | null>(null);
 const [size, setSize] = useState<'p' | 'm' | 'g' | 'gg' | ''>('p');
 const [color, setColor] = useState<string | null>(null);
 const [mainColor, setMainColor] = useState<string | null>(null);
 const [count, setCount] = useState<number>(1);
 const buttonRef = useRef<HTMLButtonElement | null>(null);
 const modalRef = useRef<HTMLDivElement | null>(null);
 const form = useRef<HTMLFormElement | null>(null);
 const closeRef = useRef<HTMLButtonElement | null>(null);

 function handleCount(event: SyntheticEvent) {
  if (event.currentTarget.id == 'more') {
   data?.clothing?.inventario.map((inventory) => {
    if (inventory.cor == color) {
     if (size == '') {
      return;
     }
     if (inventory[size] <= count) {
      setCount(inventory[size] - 1);
     }
     setCount((count) => (count = count + 1));
    }
   });
  } else if (count - 1 > 0) {
   setCount((count) => (count = count - 1));
  }
 }

 async function handleSubmit(event: SyntheticEvent) {
  event.preventDefault();
  if (cookieName == undefined || cookieVal == undefined) {
   await deleteCookie('userProfile');
   router.push('/auth/entrar');
   return;
  }
  if (
   clothing &&
   size === clothing.size &&
   color === clothing.color &&
   count === clothing.quantidade
  ) {
   closeRef.current instanceof HTMLElement && closeRef.current.click();
   return;
  }
  if (clothing) {
   const cookie = cookieName + '=' + cookieVal;
   setLoad(true);
   let c: number;
   if (count < clothing.quantidade) {
    c = clothing.quantidade - count;
    c = -c;
   } else {
    c = count - clothing.quantidade;
   }
   const data = await EditClothingCart(cookie, {
    roupa_id: clothing.clothing_id,
    cor: clothing.color,
    tamanho: clothing.size,
    novaCor: color != null && color != clothing.color ? color : '',
    novaQuantidade: count != clothing.quantidade ? c : 0,
    novoTamanho: size != clothing.size ? size : '',
   });
   if (data === 401) {
    await deleteCookie('userProfile');
    router.push('/auth/entrar');
    return;
   }
   if (form.current instanceof HTMLFormElement) {
    form.current.classList.remove(styles.active);
   }
   if (data === 500) {
    setPopupError(true);
    setOpen(false);
    setLoad(false);
    return;
   }
   if (data === 'quantidade excede o stoque') {
    setRefresh(true);
    setLoad(false);
    setPopupError(true);
    setOpen(false);
    return;
   }
   window.location.reload();
   closeRef.current instanceof HTMLButtonElement && closeRef.current.click();
   setOpen(false);
  }
 }

 function handleEnterModalColor() {
  form.current instanceof HTMLFormElement &&
   form.current.classList.add(styles.opacity);
 }

 function handleOutModalColor() {
  form.current instanceof HTMLFormElement &&
   form.current.classList.remove(styles.opacity);
 }

 function close(event: MouseEvent) {
  if (
   event.target instanceof HTMLElement &&
   ((form.current && !form.current.contains(event.target)) ||
    closeRef.current?.contains(event.target)) &&
   (event.target.contains(modalRef.current) ||
    event.target.contains(closeRef.current) ||
    event.target.contains(
     closeRef.current?.firstChild instanceof HTMLElement
      ? closeRef.current?.firstChild
      : null,
    ))
  ) {
   window.removeEventListener('click', close);
   if (form.current instanceof HTMLFormElement) {
    form.current.classList.remove(styles.active);
    setTimeout(() => {
     form.current instanceof HTMLElement &&
      (form.current.style.display = 'none');
     setOpen(false);
    }, 500);
   }
  }
 }

 useEffect(() => {
  if (open && clothing) {
   if (clothing.clothing_id) {
    (async function () {
     setLoad(true);
     const res = await GetClothing(clothing.clothing_id);
     res.clothing?.inventario.map(({ cor, corPrincipal }) => {
      if (clothing.color == cor) {
       setColor(cor);
      }
      if (corPrincipal) {
       setMainColor(cor);
      }
     });
     if (res.status == 401) {
      await deleteCookie('userProfile');
      router.push('/auth/entrar');
      return;
     }
     if (res.status == 500) {
      setPopupError(true);
      setLoad(false);
      setOpen(false);
      return;
     }
     if (res.status == 404) {
      window.location.reload();
      return;
     }
     setData(res);
     if(clothing.quantidade > clothing.avaibleQuantity) {
      setCount(clothing.avaibleQuantity)
     } else {
      setCount(clothing.quantidade)
     }
     setSize(clothing.size);
     setLoad(false);
    })();
   }
  }
 }, [open]);

 useEffect(() => {
  if (data) {
   if (open) {
    if (form.current instanceof HTMLElement) {
     form.current.focus();
     form.current.style.display = 'grid';
    }
    setTimeout(() => {
     window.addEventListener('click', close);
    }, 500);
    setTimeout(() => {
     if (form.current instanceof HTMLFormElement) {
      form.current.classList.add(styles.active);
     }
    }, 100);
   }
  }
 }, [data]);

 useEffect(() => {
  data?.clothing?.inventario.map((inventory) => {
   if (inventory.cor == color) {
    if (size == '') {
     return;
    }
    if (inventory[size] <= count) {
     setCount(inventory[size]);
    }
   }
  });
 }, [size, color]);

 return (
  <>
   <ModalColor
    color="rgb(8 8 8)"
    inventario={data?.clothing?.inventario}
    mainColor={mainColor}
    modalRef={modalRef}
    setColor={setColor}
   />
   <form
    className={`${styles.container}`}
    id={`${load && styles.formOpacity}`}
    ref={form}
    onSubmit={handleSubmit}
   >
    <p className={styles.p}>Edição de carrinho</p>
    <div>
     {color != null &&
      data?.clothing?.inventario.map(({ p, m, g, gg, cor }) => {
       if (cor === color) {
        if (p === 0 && m === 0 && g === 0 && gg === 0) {
         return (
          <p className={styles.noSizes} key={'p'}>
           Todos os tamanhos foram esgotados
          </p>
         );
        }
        return (
         <Sizes
          key={'sizes'}
          color={color}
          inventory={data?.clothing?.inventario}
          setSize={setSize}
          size={size}
         />
        );
       }
      })}
    </div>
    <ChangeColor
     buttonToOpenModalRef={buttonRef}
     color={color}
     modalRef={modalRef}
     callbackOnEnter={handleEnterModalColor}
     callbackOnOut={handleOutModalColor}
    />
    <div>
     <Counter count={count} handleCount={handleCount} />
    </div>
    <button className={styles.editCart}>Editar carrinho</button>
    <button
     aria-label="fechar"
     type="button"
     className={styles.close}
     ref={closeRef}
    >
     <span aria-hidden="true">x</span>
    </button>
   </form>
  </>
 );
}
