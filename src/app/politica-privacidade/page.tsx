import { Metadata } from "next"
import styles from "./page.module.css"

export function generateMetadata(): Metadata { 
  return {
    title: "Politíca de privacidade",
  }
}

export default function Page() {
  return (
    <>
      <main className={styles.main}>
        <section>
            <p>
              <br />
              <strong className={styles.strong}>Consentimento para Tratamento de Dados Pessoais</strong><br /><br/>
              Ao prosseguir com o cadastro ou login, você concorda com o tratamento dos seus dados pessoais (nome, e-mail ou telefone, e senha) conforme disposto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).<br/><br/>

              <strong className={styles.strong}>Finalidade do Tratamento:</strong><br/>
              Utilizamos as informações fornecidas (nome, e-mail ou telefone, e senha) exclusivamente para a autenticação e acesso seguro à sua conta.<br/>
              Essas informações serão armazenadas em um cookie para facilitar futuras autenticações e melhorar a experiência do usuário em nosso site.<br/><br/>

              <strong className={styles.strong}>Segurança e Confidencialidade:</strong><br/>
              Garantimos que os seus dados serão mantidos em segurança e não serão compartilhados com terceiros, exceto quando necessário para cumprir obrigações legais.<br/>
              Não realizamos rastreamento de sua navegação ou utilizamos seus dados para outras finalidades além das mencionadas.<br/><br/>

              <strong className={styles.strong}>Direitos do Titular dos Dados:</strong><br/>
              Você tem o direito de acessar e corrigir os seus dados a qualquer momento.<br/>
              Caso deseje desativar sua conta, seus dados serão preservados de forma segura, mas o acesso será restrito. A exclusão completa dos dados pessoais pode não ser possível devido a obrigações legais relacionadas a pedidos de compras ou outras transações.<br/>
              Em caso de dúvidas ou solicitações relacionadas aos seus dados pessoais, entre em contato conosco pelo [seu e-mail de contato].<br/><br/>

              <strong className={styles.strong}>Ao continuar, você declara que leu e concorda com os termos acima, e consente com o tratamento dos seus dados pessoais conforme descrito.</strong>
          </p>
        </section>
      </main>
    </>
  )
}