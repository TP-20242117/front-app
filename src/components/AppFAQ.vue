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
  padding: 40px;
  margin: 0 auto;
  max-width: 800px;
  background-color: #f5f7fa;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
}

h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #34495e;
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.faq-question {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.faq-question:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

h3::before {
  content: "❓";
  margin-right: 10px;
  font-size: 1.2rem;
  color: #e67e22;
}

p {
  font-size: 1rem;
  line-height: 1.6;
  color: #7f8c8d;
  margin-bottom: 0;
  font-family: 'Roboto', sans-serif;
  transition: max-height 0.3s ease-out;
}

.dark-theme .faq-container {
  background-color: #2c2c2c;
}

.dark-theme h2 {
  color: #ddd;
  border-color: #3498db;
}

.dark-theme .faq-question {
  background-color: #3c3c3c;
  color: #ddd;
  border: 1px solid #444;
}

.dark-theme h3 {
  color: #ddd;
}

.dark-theme p {
  color: #ccc;
}

@media (max-width: 768px) {
  .faq-container {
    padding: 20px;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  p {
    font-size: 0.9rem;
  }
}
</style>
