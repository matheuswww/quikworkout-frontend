'use client';

import { useEffect, useRef, useState } from 'react';
import SpinLoading from '../spinLoading/spinLoading';
import { useRouter } from 'next/navigation';
import GetUser, { getUserResponse } from '@/api/user/getUser';
import { deleteCookie } from '@/action/deleteCookie';
import styles from './myAccount.module.css';
import Link from 'next/link';
import handleModalClick from '@/funcs/handleModalClick';
import PopupError from '../popupError/popupError';
import ArrowUp from 'next/image';
import ArrowDown from 'next/image';
import GetAddress, { getAddressData } from '@/api/user/getAddress';
import Menu from '../menu/menu';
import Edit from 'next/image';
import ChangePasswordForm from './changePassword';
import DeleteAddressForm from './deleteAddress';
import UpdateProfileForm from './updateProfile';

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export default function MyAccount({ cookieName, cookieVal }: props) {
 const router = useRouter();
 const [addressData, setAddressData] = useState<getAddressData[] | null>(null);
 const [data, setData] = useState<getUserResponse | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [allLoad, setAllLoad] = useState<number>(0);
 const [popupError, setPopupError] = useState<boolean>(false);

 const [changed, setChanged] = useState<boolean>(false);
 const [open, setOpen] = useState<boolean>(false);
 const [deleteAddress, setDeleteAddress] = useState<getAddressData | null>(
  null,
 );

 const [type, setType] = useState<'contact' | 'name' | null>(null);

 const [activeRecaptcha, setActiveRecatpcha] = useState<
  'updateProfile' | 'changePassword' | null
 >(null);

 const [activeModal, setActiveModal] = useState<boolean>(false);

 const modalRefChangePassword = useRef<HTMLFormElement | null>(null);
 const buttonToOpenModalRefChangePassword = useRef<HTMLButtonElement | null>(
  null,
 );
 const closeRefChangePassword = useRef<HTMLButtonElement | null>(null);

 const modalRefDeleteAddress = useRef<HTMLFormElement | null>(null);
 const buttonToOpenModalRefDeleteAddress = useRef<HTMLButtonElement | null>(
  null,
 );
 const closeRefDeleteAddress = useRef<HTMLButtonElement | null>(null);

 const modalRefUpdateProfile = useRef<HTMLFormElement | null>(null);
 const buttonToOpenModalRefUpdateProfile = useRef<HTMLButtonElement | null>(
  null,
 );
 const closeRefUpdateProfile = useRef<HTMLButtonElement | null>(null);

 useEffect(() => {
  (async function () {
   if (cookieName == undefined || cookieVal == undefined) {
    router.push('/auth/entrar');
    return;
   }
   const cookie = cookieName + '=' + cookieVal;
   const res = await GetUser(cookie);
   if (res.status == 404 || res.status == 401) {
    await deleteCookie(cookieName);
    router.push('/auth/entrar');
    return;
   }
   setData(res);
   setAllLoad((c) => c + 1);
  })();
 }, []);

 useEffect(() => {
  (async function () {
   if (cookieName == undefined || cookieVal == undefined) {
    router.push('/auth/entrar');
    return;
   }
   const cookie = cookieName + '=' + cookieVal;
   const res = await GetAddress(cookie);
   if (typeof res.status == 'number' && res.status == 401) {
    await deleteCookie(cookieName);
    router.push('/auth/entrar');
    return;
   }
   setAddressData(res.data);
   if (allLoad == null) {
    setAllLoad((c) => c + 1);
   }
  })();
 }, []);

 useEffect(() => {
  if (allLoad >= 2) {
   setLoad(false);
  }
 }, [allLoad]);

 function changeDeleteAddress(address: getAddressData) {
  setDeleteAddress({
   bairro: address.bairro,
   cep: address.cep,
   cidade: address.cidade,
   codigoRegiao: address.codigoRegiao,
   complemento: address.complemento,
   numeroResidencia: address.numeroResidencia,
   rua: address.rua,
   regiao: address.regiao,
  });
 }

 return (
  <>
   <header>
    <Menu cookieName={cookieName} cookieVal={cookieVal} />
   </header>
   {
    <ChangePasswordForm
     activeRecaptcha={activeRecaptcha}
     closeRef={closeRefChangePassword}
     modalRef={modalRefChangePassword}
     changed={changed}
     setChanged={setChanged}
     setLoad={setLoad}
     setPopupError={setPopupError}
     cookieName={cookieName}
     cookieVal={cookieVal}
     load={load}
    />
   }
   {
    <DeleteAddressForm
     load={load}
     closeRef={closeRefDeleteAddress}
     deleteAddress={deleteAddress}
     modalRef={modalRefDeleteAddress}
     setLoad={setLoad}
     cookieName={cookieName}
     cookieVal={cookieVal}
    />
   }
   {
    <UpdateProfileForm
     load={load}
     setData={setData}
     cookieName={cookieName}
     cookieVal={cookieVal}
     activeRecaptcha={activeRecaptcha}
     closeRef={closeRefUpdateProfile}
     modalRef={modalRefUpdateProfile}
     setLoad={setLoad}
     setPopupError={setPopupError}
     type={type}
    />
   }
   {load && <SpinLoading />}
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   <main className={`${load && styles.lowOpacity} ${styles.main}`}>
    {
     <section
      className={`${styles.section} ${(data?.status == 500 || data?.status == 404) && styles.center}`}
     >
      {data?.status == 200 && data.data ? (
       <>
        <h1 className={styles.title}>Minha conta</h1>
        <div className={styles.vals}>
         <p>Nome: </p>
         <p>{data.data.nome}</p>
         <button
          className={`${styles.edit}`}
          disabled={activeModal}
          onClick={() => {
           setActiveRecatpcha('updateProfile');
           setType('name');
           setTimeout(() =>
            handleModalClick(
             modalRefUpdateProfile,
             buttonToOpenModalRefUpdateProfile,
             closeRefUpdateProfile,
             styles.active,
             'grid',
             () => setActiveModal(true),
             () => setActiveModal(false),
            ),
           );
          }}
          ref={type == 'name' ? buttonToOpenModalRefUpdateProfile : null}
         >
          <Edit alt="alterar nome" src="/img/edit.png" width={16} height={16} />
         </button>
        </div>
        {
         <div
          className={`${styles.vals} ${styles.email}`}
          style={{ marginTop: '0px' }}
         >
          <p>Email: </p>
          <p>{data.data.email}</p>
          <button
           className={`${styles.edit}`}
           disabled={activeModal}
           onClick={() => {
            setActiveRecatpcha('updateProfile');
            setType('contact');
            setTimeout(() =>
             handleModalClick(
              modalRefUpdateProfile,
              buttonToOpenModalRefUpdateProfile,
              closeRefUpdateProfile,
              styles.active,
              'grid',
              () => setActiveModal(true),
              () => setActiveModal(false),
             ),
            );
           }}
           ref={type == 'contact' ? buttonToOpenModalRefUpdateProfile : null}
          >
           <Edit
            alt="alterar contato"
            src="/img/edit.png"
            width={16}
            height={16}
            onClick={() => setType('contact')}
           />
          </button>
         </div>
        }
        {data.data.twoAuthEmail != '' ? (
         data.data.twoAuthEmail != '' && (
          <>
           <div className={styles.vals}>
            <p>Email de dois fatores: </p>
            <p>{data.data.twoAuthEmail}</p>
           </div>
           <Link href="/auth/remover-dois-fatores" className={styles.link}>
            Remover autenticação de dois fatores
           </Link>
          </>
         )
        ) : data.data.verificado && (
         <Link href="/auth/criar-dois-fatores" className={styles.link}>
          Adicionar autenticação de dois fatores
         </Link>
        )}
        {!data.data.verificado && (
         <Link href="/auth/validar-contato" className={styles.link}>
          Validar email
         </Link>
        )}
        {addressData && (
         <>
          <div className={styles.address}>
           {!open ? (
            <button
             className={styles.arrow}
             id="arrowAddress"
             onClick={() => setOpen((a) => !a)}
             aria-label="expandir sessão de endereços de entrega salvos"
            >
             <ArrowUp
              src="/img/arrowUp.png"
              alt="seta para cima"
              width={24}
              height={24}
             />
            </button>
           ) : (
            <button
             className={styles.arrow}
             id="arrowAddress"
             onClick={() => setOpen((a) => !a)}
             aria-label="diminuir sessão de endereços de entrega salvos"
            >
             <ArrowDown
              src="/img/arrowDown.png"
              alt="seta para baixo"
              width={24}
              height={24}
             />
            </button>
           )}
           <label htmlFor="arrowAddress" className={styles.arrowLabel}>
            Endereços de entrega
           </label>
          </div>
          {!open &&
           addressData.map((infos, i) => {
            return (
             <div className={styles.addressItem} key={i} id={`address_${i}`}>
              <div className={styles.vals}>
               <p>Rua: </p>
               <p>{infos.rua}</p>
              </div>
              <div className={styles.vals}>
               <p>Número de residênia: </p>
               <p>{infos.numeroResidencia}</p>
              </div>
              <div className={styles.vals}>
               <p>Complemento: </p>
               <p>{infos.complemento}</p>
              </div>
              <div className={styles.vals}>
               <p>Bairro: </p>
               <p>{infos.bairro}</p>
              </div>
              <div className={styles.vals}>
               <p>Cidade: </p>
               <p>{infos.cidade}</p>
              </div>
              <div className={styles.vals}>
               <p>Código de região: </p>
               <p>{infos.codigoRegiao}</p>
              </div>
              <div className={styles.vals}>
               <p>Cep: </p>
               <p>{infos.cep}</p>
              </div>
              <button
               aria-label="fechar"
               type="button"
               disabled={activeModal}
               className={styles.close}
               ref={buttonToOpenModalRefDeleteAddress}
               onClick={() => {
                handleModalClick(
                 modalRefDeleteAddress,
                 buttonToOpenModalRefDeleteAddress,
                 closeRefDeleteAddress,
                 styles.active,
                 'block',
                 () => setActiveModal(true),
                 () => setActiveModal(false),
                );
                changeDeleteAddress({ ...infos });
               }}
              >
               <span aria-hidden="true">x</span>
              </button>
             </div>
            );
           })}
         </>
        )}
        {!changed ? (
         <button
          className={`${styles.button} ${styles.changePassword}`}
          ref={buttonToOpenModalRefChangePassword}
          disabled={activeModal}
          onClick={() => {
           setActiveRecatpcha('changePassword');
           handleModalClick(
            modalRefChangePassword,
            buttonToOpenModalRefChangePassword,
            closeRefChangePassword,
            styles.active,
            'grid',
            () => setActiveModal(true),
            () => setActiveModal(false),
           );
          }}
         >
          Alterar senha
         </button>
        ) : (
         <p className={styles.changed}>Senha alterada com sucesso</p>
        )}
       </>
      ) : load ? (
       <>
        <h1 className={styles.title}>Minha conta</h1>
        <p className={styles.loading}>carregando...</p>
       </>
      ) : (
       <p className={styles.serverError}>
        Parece que houve um erro! Tente recarregar a página
       </p>
      )}
     </section>
    }
   </main>
  </>
 );
}
