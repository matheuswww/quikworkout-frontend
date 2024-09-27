'use client';
import { useEffect, useState } from 'react';
import Edit from 'next/image';
import Delete from 'next/image';
import styles from './getClothingCartForm.module.css';
import Link from 'next/link';
import SkeletonImage from '../skeletonImage/skeletonImage';
import GetClothingCart, {
 getClothingCartResponse,
} from '@/api/clothing/getClothingCart';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';
import SpinLoading from '../spinLoading/spinLoading';
import DeleteClothingCart from './deleteClothingCartForm';
import PopupError from '../popupError/popupError';
import EditClothingCartForm from './editClothingCartForm';
import formatPrice from '@/funcs/formatPrice';
import Menu from '../menu/menu';

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export interface clothingCart {
 clothing_id: string;
 color: string;
 size: 'p' | 'm' | 'g' | 'gg';
 avaibleQuantity: number;
 quantidade: number;
 index: number;
}

export default function GetClothingCartForm({ ...props }: props) {
 const router = useRouter();
 const [data, setData] = useState<getClothingCartResponse | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [newPageLoad, setNewPageLoad] = useState<boolean>(false);
 const [newPage, setNewPage] = useState<boolean>(false);
 const [end, setEnd] = useState<boolean>(false);
 const [totalPrice, setTotalPrice] = useState<number>(0);
 const [openDeleteClothingCart, setDeleteClothingCart] =
  useState<boolean>(false);
 const [openEditClothingCart, setEditClothingCart] = useState<boolean>(false);
 const [clothing, setClothing] = useState<clothingCart | null>(null);
 const [popupError, setPopupError] = useState<boolean>(false);
 const [refresh, setRefresh] = useState<boolean>(false);

 useEffect(() => {
  if (!end && !newPageLoad) {
   (async function () {
    if (props.cookieName == undefined || props.cookieVal == undefined) {
     router.push('/auth/entrar');
     return;
    }
    const cookie = props.cookieName + '=' + props.cookieVal;
    let cursor: string | undefined;
    if (data?.clothing) {
     setNewPageLoad(true);
     const lastIndex = data.clothing.length;
     if (lastIndex && lastIndex - 1 >= 0 && data.clothing) {
      cursor = data.clothing[lastIndex - 1].criado_em;
     }
    }
    const res = await GetClothingCart(cookie, cursor);

    if (data?.clothing && res.status == 404) {
     setEnd(true);
     setLoad(false);
     setNewPageLoad(false);
     return;
    }
    if (res.status === 401) {
     await deleteCookie(props.cookieName);
     router.push('/auth/entrar');
     return;
    }
    let totalPrice = 0;
    res.clothing?.map(({ preco, quantidade }) => {
     totalPrice += preco * quantidade;
    });
    setTotalPrice((t) => totalPrice + t);
    if (data?.clothing && res.clothing) {
     data.clothing.push(...res.clothing);
     setData({
      clothing: data.clothing,
      status: 200,
     });
    } else {
     setData(res);
    }
    setNewPage(false);
    setTimeout(() => {
     setNewPageLoad(false);
    }, 50);
    setLoad(false);
   })();
  }
 }, [newPage]);

 useEffect(() => {
  if (refresh) {
   setNewPage(false);
   setEnd(false);
   setTotalPrice(0);
   setDeleteClothingCart(false);
   setEditClothingCart(false);
   setClothing(null);
   setRefresh(false);
   (async function () {
    if (props.cookieName == undefined || props.cookieVal == undefined) {
     router.push('/auth/entrar');
     return;
    }
    const cookie = props.cookieName + '=' + props.cookieVal;
    let cursor: string | undefined;
    if (data?.clothing) {
     const lastIndex = data.clothing.length;
     if (lastIndex && lastIndex - 1 >= 0 && data.clothing) {
      cursor = data.clothing[lastIndex - 1].criado_em;
     }
    }
    const res = await GetClothingCart(cookie, cursor);

    if (data?.clothing && res.status == 404) {
     setEnd(true);
     setLoad(false);
     return;
    }

    if (res.status === 401) {
     await deleteCookie(props.cookieName);
     router.push('/auth/entrar');
     return;
    }
    setData(res);
    setLoad(false);
   })();
  }
 }, [refresh]);

 useEffect(() => {
  let totalPrice = 0;
  data?.clothing?.map(({ preco, quantidade }) => {
   totalPrice += preco * quantidade;
  });
  setTotalPrice(totalPrice);
  if (data?.clothing?.length == 0) {
   setData({
    clothing: null,
    status: 404,
   });
  }
 }, [data]);

 useEffect(() => {
  const final = document.querySelector('#final');
  if (final instanceof HTMLSpanElement) {
   const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
     if (final.classList.contains(styles.show)) {
      setNewPage(true);
     }
    }
   });
   observer.observe(final);
   return () => observer.disconnect();
  }
 }, []);

 function handleSetClothing(
  roupa_id: string,
  cor: string,
  size: string,
  avaibleQuantity: number,
  quantity: number,
  index: number,
 ) {
  if (size === 'p' || size === 'm' || size === 'g' || size === 'gg') {
   setClothing({
    clothing_id: roupa_id,
    color: cor,
    size: size,
    avaibleQuantity: avaibleQuantity,
    quantidade: quantity,
    index: index,
   });
  }
 }

 function handleDeleteClothingCart(
  roupa_id: string,
  cor: string,
  size: string,
  avaibleQuantity: number,
  quantity: number,
  index: number,
 ) {
  setDeleteClothingCart(true);
  handleSetClothing(roupa_id, cor, size, avaibleQuantity, quantity, index);
 }

 function handleEditClothingCart(
  roupa_id: string,
  cor: string,
  size: string,
  avaibleQuantity: number,
  quantity: number,
  index: number,
 ) {
  setEditClothingCart(true);
  handleSetClothing(roupa_id, cor, size, avaibleQuantity, quantity, index);
 }

 return (
  <>
   <header>
    <Menu cookieName={props.cookieName} cookieVal={props.cookieVal} />
   </header>
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   {load && <SpinLoading />}
   {
    <EditClothingCartForm
     load={load}
     setClothingData={setData}
     setRefresh={setRefresh}
     cookieName={props.cookieName}
     cookieVal={props.cookieVal}
     setLoad={setLoad}
     setPopupError={setPopupError}
     clothing={clothing}
     open={openEditClothingCart}
     setOpen={setEditClothingCart}
    />
   }
   {
    <DeleteClothingCart
     load={load}
     setLoad={setLoad}
     setData={setData}
     setPopupError={setPopupError}
     cookieName={props.cookieName}
     cookieVal={props.cookieVal}
     clothing={clothing}
     open={openDeleteClothingCart}
     setOpen={setDeleteClothingCart}
    />
   }
   <main
    className={`${styles.main} ${data?.status == 404 && styles.mainNotFound} ${(load || openDeleteClothingCart || openEditClothingCart) && styles.opacity} ${data?.status == 404 || (data?.status == 500 && styles.centralize)}`}
   >
    <section className={styles.section}>
     {data?.status != 500 && data?.status != 404 && (
      <>
       <div>
        <h1 className={styles.title}>Minha bolsa</h1>
        {totalPrice && data?.clothing && (
         <>
          {totalPrice != 0 && (
           <p className={styles.totalPrice}>
            Preço: R$
            {formatPrice(Math.round(totalPrice * 100) / 100)}
           </p>
          )}
          <Link
           href={`/finalizar-compra?page=${Math.ceil(data?.clothing.length / 10) - 1}`}
           className={styles.finishOrder}
          >
           Finalizar todas as compras
          </Link>
         </>
        )}
       </div>
      </>
     )}
     {load && !data?.clothing && (
      <p className={styles.loading}>Carregando...</p>
     )}
     {data?.clothing?.map((data, index) => {
      return (
       <div
        className={styles.item}
        key={data.roupa_id + data.cor + data.tamanho}
       >
        <p
         className={`${styles.name} ${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
        >
         {data.nome}
        </p>
        <div className={styles.img}>
        <SkeletonImage
         src={data.imagem}
         alt={data.alt}
         className={`${styles.image} ${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         width={75}
         height={85}
         quality={100}
        />
        </div>
        <div className={styles.infos}>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Preço:&nbsp;</p>
          <p className={styles.interRegular}>R${formatPrice(data.preco)}</p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Categoria:&nbsp;</p>
          <p className={styles.interRegular}>{data.categoria}</p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Quantidade:&nbsp;</p>
          <p className={styles.interRegular}>{data.quantidade}</p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Genêro:&nbsp;</p>
          <p className={styles.interRegular}>
           {data.sexo == 'M'
            ? 'masculino'
            : data.sexo == 'F'
              ? 'feminino'
              : 'unissex'}
          </p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Cor:&nbsp;</p>
          <p className={styles.interRegular}>{data.cor}</p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Material:&nbsp;</p>
          <p className={styles.interRegular}>{data.material}</p>
         </div>
         <div
          className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.inkfree}>Tamanho:&nbsp;</p>
          <p className={styles.interRegular}>{data.tamanho.toUpperCase()}</p>
         </div>
        </div>
        <p
         className={`${styles.description} ${styles.interRegular} ${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
        >
         {data.descricao}
        </p>
        <Link
         href={`/finalizar-compra?clothing_id=${data.roupa_id}&color=${data.cor}&size=${data.tamanho}`}
         className={`${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity} ${(data.excedeEstoque || !data.disponivel) && styles.linkDisabled}`}
        >
         Finalizar compra
        </Link>
        {(data.excedeEstoque || !data.disponivel) && (
         <p className={styles.alert}>
          {!data.disponivel
           ? `roupa indisponível`
           : `quantidade pedida indisponível,quantidade disponível: ${data.quantidadeDisponivel}`}
         </p>
        )}
        <button
         className={`${styles.delete} ${styles.buttonOpen}`}
         onClick={() =>
          handleDeleteClothingCart(
           data.roupa_id,
           data.cor,
           data.tamanho,
           data.quantidadeDisponivel,
           data.quantidade,
           index,
          )
         }
         aria-label="remover produto de minha bolsa"
         disabled={load}
        >
         <Delete
          src="/img/close.png"
          width={18}
          height={18}
          alt="deletar produto do carrinho"
         />
        </button>
        <button
         className={`${styles.edit} ${styles.buttonOpen} ${(data.excedeEstoque || !data.disponivel) && styles.lowOpacity}`}
         onClick={() =>
          handleEditClothingCart(
           data.roupa_id,
           data.cor,
           data.tamanho,
           data.quantidadeDisponivel,
           data.quantidade,
           index,
          )
         }
         aria-label="editar produto do carrinho"
         disabled={
          data.excedeEstoque ||
          !data.disponivel ||
          openDeleteClothingCart ||
          openEditClothingCart ||
          load
         }
        >
         <Edit
          src="/img/edit.png"
          width={12}
          height={12}
          alt="editar produto"
          className={`${(data.excedeEstoque || !data.disponivel) && styles.linkDisabled}`}
         />
        </button>
       </div>
      );
     })}
     <span
      aria-hidden={true}
      id="final"
      className={`${data && styles.show}`}
     ></span>
     {data?.status == 404 && (
      <>
       <p className={styles.p} style={{ marginTop: '25px' }}>
        Nenhum produto foi encontrado
       </p>
       <Link
        style={{ marginLeft: '10px' }}
        href="/"
        className={styles.seeClothing}
       >
        Ver roupas
       </Link>
      </>
     )}
     {data?.status == 500 && (
      <p className={styles.p}>
       Parece que houve um erro! Tente recarregar a página
      </p>
     )}
     {newPageLoad && (
      <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
      </div>
     )}
    </section>
   </main>
  </>
 );
}
