import { Metadata } from "next"
import styles from "./page.module.css"

export function generateMetadata(): Metadata { 
  return {
    title: "Politíca de privacidade de pagamentos",
  }
}

export default function Page() {
  return (
    <>
      <main className={styles.main}>
        <section>
          <p>
            <strong className={styles.strong}>Consentimento para Tratamento de Dados Pessoais</strong><br /><br />
            Ao prosseguir com a finalização da compra, você concorda com o tratamento dos seus dados pessoais conforme disposto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).<br /><br />

            <strong className={styles.strong}>Finalidade do Tratamento:</strong><br />
            <strong className={styles.strong}>Endereço:</strong> O endereço informado será utilizado exclusivamente para o envio dos produtos adquiridos e para facilitar futuras compras. Você tem a opção de deletar este endereço a qualquer momento através de sua conta. Informamos também que os dados de endereço e contato serão compartilhados com a Kangu, empresa responsável pela entrega do pacote.Para mais informações sobre o tratamento dos seus dados pela Kangu, consulte a política de privacidade da Kangu.<br />
            <strong className={styles.strong}>Dados de Pagamento:</strong> Para processar o pagamento, compartilhamos seus dados de pagamento com o PagBank, que é responsável pela transação. Informamos que não armazenamos os dados do seu cartão de crédito ou débito. Para mais informações sobre o tratamento dos seus dados pelo PagBank, consulte a política de privacidade do PagBank.<br /><br />

            <strong className={styles.strong}>Segurança e Confidencialidade:</strong><br />
            Garantimos que os seus dados serão mantidos em segurança e não serão compartilhados com terceiros, exceto com o PagBank, conforme descrito acima, para a realização do pagamento, e com a Kangu, para a entrega do pacote. Não utilizamos os seus dados para outras finalidades além das mencionadas.<br /><br />

            <strong className={styles.strong}>Ao continuar, você declara que leu e concorda com os termos acima, e consente com o tratamento dos seus dados pessoais conforme descrito para a finalidade de concluir esta compra.</strong>
          </p>
        </section>
      </main>
    </>
  )
}