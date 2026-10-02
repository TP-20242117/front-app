<template>
  <div :class="['faq-container', theme]">
    <h2>PREGUNTAS FRECUENTES</h2>
    
    <div class="faq-question">
      <h3>¿Qué es el TDAH?</h3>
      <p>
        El Trastorno por Déficit de Atención e Hiperactividad (TDAH) es un trastorno
        neurodesarrollativo que afecta la capacidad de una persona para concentrarse, controlar
        impulsos y manejar comportamientos hiperactivos. Se suele diagnosticar en la infancia,
        aunque puede persistir en la adolescencia y la adultez.
      </p>
    </div>
    
    <div class="faq-question">
      <h3>¿El TDAH solo afecta a los niños?</h3>
      <p>
        No, aunque el TDAH se suele diagnosticar en la infancia, muchas personas continúan
        experimentando síntomas en la adolescencia y la edad adulta. En adultos, el TDAH puede
        manifestarse de manera diferente, como problemas de organización, manejo del tiempo y
        control emocional.
      </p>
    </div>

    <div class="faq-question">
      <h3>¿Cuáles son los síntomas principales del TDAH?</h3>
      <p>
        Los síntomas del TDAH incluyen dificultades para mantener la atención, comportamiento
        impulsivo y, en algunos casos, hiperactividad. Las personas con TDAH pueden tener
        dificultades para seguir instrucciones, terminar tareas o mantener la concentración en
        una actividad específica.
      </p>
    </div>

    <div class="faq-question">
      <h3>¿Cómo se diagnostica el TDAH?</h3>
      <p>
        El diagnóstico del TDAH generalmente se realiza a través de una evaluación clínica que
        incluye entrevistas con el paciente, familiares y maestros, así como cuestionarios para
        evaluar el comportamiento. Un profesional de la salud mental, como un psicólogo o
        psiquiatra, es quien realiza el diagnóstico.
      </p>
    </div>

    <div class="faq-question">
      <h3>¿Qué tratamientos existen para el TDAH?</h3>
      <p>
        El tratamiento del TDAH suele incluir una combinación de medicamentos y terapia
        conductual. Los medicamentos ayudan a mejorar la concentración y reducir la impulsividad,
        mientras que la terapia conductual enseña estrategias para manejar los síntomas en la
        vida diaria.
      </p>
    </div>

    <div class="faq-question">
      <h3>¿Se puede curar el TDAH?</h3>
      <p>
        No existe una cura para el TDAH, pero con el tratamiento adecuado, las personas con TDAH
        pueden aprender a manejar sus síntomas y llevar una vida productiva. Los síntomas pueden
        mejorar con el tiempo, especialmente con intervenciones tempranas.
      </p>
    </div>

    <div class="faq-question">
      <h3>¿Qué puedo hacer si creo que tengo TDAH?</h3>
      <p>
        Si sospechas que tienes TDAH, es importante hablar con un profesional de la salud mental.
        Un psicólogo o psiquiatra puede realizar una evaluación para determinar si tienes TDAH y
        sugerir el mejor tratamiento para ti.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    theme() {
      return localStorage.getItem('theme') || 'light';
    }
  }
};
</script>

<style scoped>
.faq-container {
  padding: 40px 32px;
  margin: 0 auto;
  max-width: 920px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  transition: background-color 0.3s ease, color 0.3s ease;
}

h2 {
  font-size: clamp(2.2rem, 2.6vw, 2.8rem);
  font-weight: 600;
  color: #1d4ed8;
  text-align: left;
  margin: 0 0 28px;
  padding-bottom: 14px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.25);
}

.faq-question {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 22px 24px;
  margin-bottom: 18px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
}

.faq-question:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.09);
  border-color: rgba(59, 130, 246, 0.25);
}

h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

h3::before {
  content: "❓";
  margin-right: 10px;
  font-size: 1.15rem;
  color: #2563eb;
}

p {
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 0;
  font-family: 'Roboto', sans-serif;
  transition: max-height 0.3s ease-out;
}

.dark-theme .faq-container {
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
}

.dark-theme h2 {
  color: #dbeafe;
  border-color: rgba(96, 165, 250, 0.35);
}

.dark-theme .faq-question {
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.24);
}

.dark-theme h3 {
  color: #f8fafc;
}

.dark-theme p {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .faq-container {
    padding: 20px 18px;
    border-radius: 20px;
  }

  h2 {
    font-size: 1.6rem;
  }

  h3 {
    font-size: 1.03rem;
  }

  p {
    font-size: 0.94rem;
  }
}
</style>
