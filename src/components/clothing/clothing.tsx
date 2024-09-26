'use client';
import GetClothing, {
 getClothingByIdResponse,
 inventario,
} from '@/api/clothing/getClothing';
import SkeletonImage from '@/components/skeletonImage/skeletonImage';
import styles from './clothing.module.css';
import stylesLoad from './clothingLoad.module.css';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { slideWithControll } from '@/funcs/slideWithControll';
import Skeleton from '../skeleton/skeleton';
import AddClothingToCart from '@/api/clothing/addClothingToCart';
import SpinLoading from '../spinLoading/spinLoading';
import PopupError from '../popupError/popupError';
import Counter from '../counter/counter';
import Sizes from '../sizes/sizes';
import { ChangeColor, ModalColor } from '../modalColor/modalColor';
import Shop from 'next/image';
import formatPrice from '@/funcs/formatPrice';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CalcFreight, { calcFreightData } from '@/api/clothing/calcFreight';
import handleModalClick from '@/funcs/handleModalClick';
import Menu from '../menu/menu';
import Success from '../successs/success';
import ClothingSlide from '../clothingSlide/clothingSlide';
import { apiImg } from '@/api/path';

interface props {
 id: string;
 cookieName: string | undefined;
 cookieVal: string | undefined;
}

const schema = z
 .object({
  cep: z.string().min(8, 'cep inválido').max(9, 'cep inválido'),
 })
 .refine(
  (fields) => {
   let cepNumber = fields.cep;
   if (fields.cep.includes('-')) {
    cepNumber = fields.cep.replace('-', '');
   }
   if (isNaN(Number(cepNumber))) {
    return false;
   }
   return true;
  },
  {
   path: ['cep'],
   message: 'cep inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function Clothing({ ...props }: props) {
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });
 const searchParams = useSearchParams()
 const router = useRouter();
 const [data, setData] = useState<getClothingByIdResponse | null>(null);
 const [load, setLoad] = useState<boolean>(false);
 const [popUpError, setPopUpError] = useState<boolean>(false);
 const [popupErrorMsg, setPopupErrorMsg] = useState<string | undefined>(
  undefined,
 );
 const [count, setCount] = useState<number>(1);
 const [size, setSize] = useState<'p' | 'm' | 'g' | 'gg' | ''>('');
 const [color, setColor] = useState<string | null>(null);
 const [mainColor, setMainColor] = useState<string | null>(null);
 const [windowWidth, setWindowWidth] = useState<boolean>(false);
 const slide = useRef<HTMLUListElement | null>(null);
 const images = useRef<HTMLDivElement | null>(null);
 const indexImages = useRef<HTMLUListElement | null>(null);
 const buttonToOpenModalRef = useRef<HTMLButtonElement | null>(null);
 const modalRef = useRef<HTMLDivElement | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [delivery, setDelivery] = useState<'E' | 'X' | 'R'>('E');
 const [freightData, setFreightData] = useState<calcFreightData | null>(null);
 const [success, setSuccess] = useState<boolean>(false);
 const [activeModal, setActiveModal] = useState<boolean>(false);
 const calcFreightRef = useRef<HTMLFormElement | null>(null);
 const buttonToOpenModalFreight = useRef<HTMLButtonElement | null>(null);
 const closeRef = useRef<HTMLButtonElement | null>(null);

 async function handleSubmitAddToCart(
  event: SyntheticEvent,
  callback?: Function,
 ) {
  event.preventDefault();
  setPopupErrorMsg(undefined);
  setPopUpError(false);
  setLoad(true);
  if (props.cookieName == undefined || props.cookieVal == undefined) {
   router.push('/auth/entrar');
   return;
  }
  if (color == null) {
   return;
  }
  const cookie = props.cookieName + '=' + props.cookieVal;
  const res = await AddClothingToCart(cookie, {
   cor: color,
   quantidade: count,
   roupa_id: props.id,
   tamanho: size,
  });

  if (res == 401) {
   router.push('/auth/entrar');
   return;
  }
  if (res == 500) {
   setPopUpError(true);
   setLoad(false);
   return;
  }
  if (res == 'quantidade adicionada ao carrinho excede o stock') {
   setPopUpError(true);
   setPopupErrorMsg(
    'quantidade adicionada indisponível para produto já possuido em sua bolsa,tente outro tamanho ou cor',
   );
   setLoad(false);
   return;
  }
  if (
   res == 'roupa ou inventário não encontrado' ||
   res == 'quantidade excede o stock'
  ) {
   setData(null);
   setSize('p');
   setColor(null);
   setMainColor(null);
   setCount(1);
   setPopUpError(true);
   setPopupErrorMsg('');
   setLoad(false);
   if (res == 'quantidade excede o stock') {
    setPopupErrorMsg(
     'estoque indisponível,tente novamente pois o estoque foi atualizado',
    );
   }
   return;
  }
  if (callback) {
   callback();
   return;
  }
  setSuccess(true);
  setLoad(false);
 }

 async function handleSubmitCalcFreight(formData: FormProps) {
  if (data?.clothing?.id && count) {
   setPopUpError(false);
   setError(null);
   setLoad(true);
   if (formData.cep.includes('-')) {
    formData.cep = formData.cep.replace('-', '');
   }
   const res = await CalcFreight({
    cep: formData.cep,
    quantidadeProduto: [count],
    roupa: [data?.clothing?.id],
    servico: delivery,
   });
   if (res.status == 500) {
    setPopUpError(true);
    setLoad(false);
    setFreightData(null);
    return;
   }
   if (res.data == 'cep de destino inválido') {
    setError(res.data);
    setLoad(false);
    setFreightData(null);
    return;
   }
   if (res.data == 'frete não disponível') {
    setError('frete não disponível para este endereço e tipo de entrega');
    setLoad(false);
    setFreightData(null);
    return;
   }
   if (res.data == 'peso maxímo atingido') {
    setError(
     'tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega',
    );
    setLoad(false);
    setFreightData(null);
    return;
   }
   if(res.data == 'cubagem excedida') {
    setError("cubagem excedida, tente diminuir a quantidade de roupas");
    setLoad(false);
    setFreightData(null);
    return;
   }
   if (res.data == 'roupa não encontrada') {
    setError(
     'parece que uma das suas roupas está indisponível, verifique sua bolsa e remova a roupa',
    );
  
    setLoad(false);
    setFreightData(null);
    return;
   }
   if (res.data?.vlrFrete) {
    setFreightData(res.data);
   }
   setLoad(false);
  }
 }

 function handleCount(event: SyntheticEvent) {
  if (size == '') {
   return;
  }
  if (event.currentTarget.id == 'more') {
   data?.clothing?.inventario.map((inventory) => {
    if (inventory.cor == color) {
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

 function handleBuy(event: SyntheticEvent) {
  handleSubmitAddToCart(event, () => {
   router.push(
    '/finalizar-compra?clothing_id=' +
     data?.clothing?.id +
     '&color=' +
     color +
     '&size=' +
     size,
   );
  });
 }

 function selectSize(inventory: inventario) {
  if (inventory.p != 0) {
   setSize('p');
  } else if (inventory.m != 0) {
   setSize('m');
  } else if (inventory.g != 0) {
   setSize('g');
  } else if (inventory.gg != 0) {
   setSize('gg');
  }
 }

 useEffect(() => {
  let image: string | undefined = undefined
  try {
    const imgParam = searchParams.get("img")
    if(imgParam) {
      const decodedImage = atob(imgParam)
      image = decodedImage.startsWith(apiImg) ? decodedImage : undefined
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    image = undefined
  }
  if(!image) {
    notFound()
  }
},[])

 useEffect(() => {
  if (data == null) {
   (async function () {
    const res = await GetClothing(props.id);
    res.clothing?.inventario.map(({ ...inventory }) => {
     if (inventory.corPrincipal && color == null) {
      setColor(inventory.cor);
      setMainColor(inventory.cor);
      selectSize(inventory);
     }
    });
    setData(res);
    if (res.status === 500) {
     setPopUpError(true);
    }
    window.innerWidth >= 800 && setWindowWidth(true);
    window.addEventListener('resize', () => {
     if (window.innerWidth >= 800 && indexImages.current?.firstChild == null) {
      setWindowWidth(true);
     } else if (
      window.innerWidth < 800 &&
      indexImages.current?.firstChild != null
     ) {
      setWindowWidth(false);
     }
    });
   })();
  }
 }, [data]);

 useEffect(() => {
  if (
   slide.current instanceof HTMLUListElement &&
   images.current instanceof HTMLDivElement &&
   color != null &&
   size != ''
  ) {
   if (images.current.lastChild instanceof HTMLDivElement) {
    images.current.removeChild(images.current.lastChild);
   }
   data?.clothing?.inventario.map((inventory) => {
    if (inventory.cor == color) {
     if (inventory[size] <= count) {
      selectSize(inventory);
     }
    }
   });
   slideWithControll(
    slide.current,
    images.current,
    indexImages.current?.childNodes,
    styles.index,
    styles.active,
    styles.activeThumb,
   );
  }
 }, [color]);

 useEffect(() => {
  if (size == '') {
   return;
  }

  data?.clothing?.inventario.map((inventory) => {
   if (inventory.cor == color) {
    if (inventory[size] <= count) {
     setCount(inventory[size]);
    }
   }
  });
 }, [size]);

 return (
  <>
   <header className={styles.header}>
    <Menu cookieName={props.cookieName} cookieVal={props.cookieVal} />
   </header>
   {load && <SpinLoading />}
   {popUpError && (
    <PopupError msg={popupErrorMsg} handleOut={() => setPopUpError(false)} />
   )}
   <main className={`${styles.main} ${load && styles.opacity}`}>
    <Success
     msg="Adicionado com sucesso"
     setSuccess={setSuccess}
     success={success}
    />
    <ModalColor
     inventario={data?.clothing?.inventario}
     mainColor={mainColor}
     modalRef={modalRef}
     setColor={setColor}
    />
    <form
     className={styles.calcFreightForm}
     onSubmit={handleSubmit(handleSubmitCalcFreight)}
     ref={calcFreightRef}
    >
     <label htmlFor="cep">Digite seu cep</label>
     <input
      {...register('cep')}
      type="text"
      id="cep"
      className={styles.cep}
      placeholder="digite seu cep aqui"
     />
     {error ? (
      <p className={styles.error}>{error}</p>
     ) : (
      errors.cep && <p className={styles.error}>{errors.cep.message}</p>
     )}
     <div style={{ marginTop: '5px' }}>
      <label htmlFor="E">entrega normal</label>
      <input
       className={styles.checkbox}
       type="checkbox"
       id="E"
       value="E"
       onChange={() => setDelivery('E')}
       checked={delivery === 'E'}
      />
     </div>
     <div>
      <label htmlFor="X">entrega expressa</label>
      <input
       className={styles.checkbox}
       type="checkbox"
       id="X"
       value="X"
       onChange={() => setDelivery('X')}
       checked={delivery === 'X'}
      />
     </div>
     <div>
      <label htmlFor="R">retirar{'(correios)'}</label>
      <input
       className={styles.checkbox}
       type="checkbox"
       id="R"
       value="R"
       onChange={() => setDelivery('R')}
       checked={delivery === 'R'}
      />
     </div>
     {freightData?.vlrFrete && data?.clothing && (
      <p
       className={styles.freightPrice}
      >{`Frete: R$${formatPrice(freightData.vlrFrete)}`}</p>
     )}
     {freightData?.prazoEnt && (
      <p className={styles.freightPrice}>
       Prazo de entrega: {freightData.prazoEnt} dias úteis
      </p>
     )}
     <button type="submit" disabled={load} className={styles.calcFreightButton}>
      Calcular frete
     </button>
     <button
      aria-label="fechar"
      ref={closeRef}
      type="button"
      className={styles.close}
     >
      <span aria-hidden="true">x</span>
     </button>
    </form>
    <section>
      <div className={styles.content}>
      {data?.status == 404 && notFound()}
      <ul
        className={`${styles.indexImages} ${data?.clothing && styles.load}`}
        ref={indexImages}
        aria-hidden="true"
      >
        {data?.clothing ? (
        data.clothing.inventario.map(({ images, imgDesc, cor }) => {
          return (
          color == cor &&
          windowWidth &&
          images?.map((src, index) => {
            return (
            <li key={src}>
              {
              <button
                className={index == 0 ? styles.activeThumb : ''}
                aria-hidden="true"
                id={index.toString()}
                tabIndex={-1}
              >
                <SkeletonImage 
                  src={src}
                  aria-hidden="true"
                  loading="lazy"
                  alt={imgDesc}
                  width={290}
                  height={460}
                  key={data.clothing?.id}
                  draggable={false}
                />
              </button>
              }
            </li>
            );
          })
          );
        })
        ) : (
        <div
          className={stylesLoad.indexImages}
          aria-label="carregando conteúdo"
          tabIndex={0}
        >
          <Skeleton className={stylesLoad.imageSkeleton} />
        </div>
        )}
      </ul>
      <div
        className={styles.images}
        ref={images}
        style={{ display: data?.clothing ? 'initial' : 'none' }}
      >
        <ul
        className={styles.slide}
        ref={slide}
        aria-label="slide que mostra a imagem de cada roupa"
        tabIndex={0}
        >
        {data?.clothing &&
          data.clothing.inventario[0].images == null &&
          notFound()}
        {data?.clothing?.inventario.map(({ images, imgDesc, cor }) => {
          return (
          color == cor &&
          images?.map((src, index) => {
            return (
            <li className={styles.product} key={src}>
              {
              <SkeletonImage
                src={src}
                alt={imgDesc}
                loading="lazy"
                width={290}
                height={460}
                className={styles.clothing}
                key={data.clothing?.id}
                id={index.toString()}
                draggable={false}
                tabIndex={0}
              />
              }
            </li>
            );
          })
          );
        })}
        </ul>
      </div>
      {!data?.clothing && (
        <div
        className={stylesLoad.images}
        aria-label="carregando conteúdo"
        tabIndex={0}
        >
        <Skeleton className={stylesLoad.imageSkeleton} />
        </div>
      )}
      {data?.clothing ? (
        <form
        className={styles.infos}
        onSubmit={(event) => handleSubmitAddToCart(event)}
        >
        <p className={styles.name} aria-label="nome da roupa">
          {data.clothing.nome}
        </p>
        <p className={styles.price} aria-label="preço da roupa">
          R${formatPrice(data.clothing.preco)}
        </p>
        <p className={styles.description} aria-label="descrição da roupa">
          {data.clothing.descricao}
        </p>
        <div className={styles.gender}>
          <p>genêro</p>
          <p>
          {data.clothing.sexo == 'M'
            ? 'masculino'
            : data.clothing.sexo == 'F'
              ? 'feminino'
              : 'unissex'}
          </p>
        </div>
        <div className={styles.sizes}>
          <p>tamanhos</p>
          <Sizes
          color={color}
          inventory={data.clothing.inventario}
          setSize={setSize}
          size={size}
          />
        </div>
        <div className={styles.category}>
          <p>categoria</p>
          <p>{data.clothing.categoria}</p>
        </div>
        <div className={styles.counter}>
          <p>quantidades</p>
          <Counter count={count} handleCount={handleCount} />
        </div>
        <div className={styles.material} aria-label="material da roupa">
          <p>material</p>
          <p>{data.clothing.material}</p>
        </div>
        <div className={styles.colors} aria-label="cores da roupa">
          <p>cores</p>
          <ChangeColor
          activeModal={activeModal}
          callbackOnEnter={() => setActiveModal(true)}
          callbackOnOut={() => setActiveModal(false)}
          buttonToOpenModalRef={buttonToOpenModalRef}
          color={color}
          modalRef={modalRef}
          />
        </div>
        <div className={styles.freight}>
          {data?.clothing &&
          Math.round((data.clothing.preco * count * 100) / 100) < 200 ? (
          <button
            className={styles.calcFreight}
            ref={buttonToOpenModalFreight}
            type="button"
            onClick={() =>
            handleModalClick(
              calcFreightRef,
              buttonToOpenModalFreight,
              closeRef,
              styles.active,
              'flex',
              () => setActiveModal(true),
              () => setActiveModal(false),
            )
            }
            disabled={activeModal}
          >
            Calcular frete
          </button>
          ) : (
          <p className={styles.noFreight}>Frete grátis</p>
          )}
          {freightData && data && (
          <>
            <div className={styles.freightPrice}>
            <p className={styles.freightPrice}>
              Frete: R${formatPrice(freightData.vlrFrete)}
            </p>
            <p>Prazo de entrega: {freightData.prazoEnt} dias utéis</p>
            </div>
          </>
          )}
        </div>
        <button
          className={`${styles.button} ${styles.buy} ${success && styles.buttonOpacity}`}
          disabled={load || success}
          type="button"
          onClick={handleBuy}
        >
          <p>Comprar</p>
        </button>
        <button
          className={`${styles.button} ${success && styles.buttonOpacity}`}
          disabled={load || success}
        >
          <Shop
          src={'/img/shop.png'}
          alt="imagem de uma bolsa"
          width={25}
          height={25}
          aria-label={`adicionar roupa com cor ${color}, tamanho ${size}, quantidade ${count} para meu carrinho`}
          className={styles.shop}
          />
          <p aria-hidden="true">Adicionar a bolsa</p>
        </button>
        </form>
      ) : (
        <div
        className={stylesLoad.infos}
        aria-label="carregando conteúdo"
        tabIndex={0}
        >
        <Skeleton className={stylesLoad.name} />
        <Skeleton className={stylesLoad.price} />
        <Skeleton className={stylesLoad.content} />
        </div>
      )}
      </div>
      <ClothingSlide clothing={data} />
    </section>
   </main>
  </>
 );
}
