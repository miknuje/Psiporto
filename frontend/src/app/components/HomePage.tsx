import { CheckCircle } from "lucide-react"

export default function HomePage() {
    return (
      <section id="sobre" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Sobre a MenteCare</h2>
            <p className="section-subtitle">
              Somos uma clínica especializada em saúde mental, comprometida em oferecer cuidados psicológicos de qualidade
              para promover o bem-estar emocional.
            </p>
          </div>
  
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Nossa Missão</h3>
              <p className="text-gray-600">
                Na MenteCare, acreditamos que a saúde mental é tão importante quanto a saúde física. Nossa missão é
                proporcionar um espaço seguro e acolhedor onde as pessoas possam receber o suporte necessário para superar
                desafios emocionais e psicológicos.
              </p>
  
              <h3 className="text-2xl font-bold text-gray-800 pt-4">Por que nos escolher?</h3>
              <ul className="space-y-3">
                
              </ul>
            </div>
          </div>
      </section>
    )
  }