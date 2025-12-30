// src/mocks/mockApiData.js

export const FLOW_TREE = {
  title: "Opciones guiadas",
  type: "options",
  options: [
    { id: "academicas", label: "Consultas académicas" },
    { id: "administrativas", label: "Consultas administrativas" },
    { id: "general", label: "Información general" },
  ],
  children: {
    academicas: {
      title: "Consultas académicas",
      type: "options",
      options: [
        { id: "practicas", label: "Prácticas y vinculación" },
        { id: "titulacion", label: "Titulación" },
        { id: "becas", label: "Becas" },
      ],
      children: {
        practicas: {
          title: "Prácticas y vinculación",
          type: "options",
          options: [
            { id: "horas", label: "¿Cuántas horas de prácticas necesito?" },
            { id: "registro", label: "¿Cómo registro mis prácticas?" },
            { id: "formatos", label: "Formatos y documentos (PDF)" },
          ],
          children: {
            horas: {
              title: "Horas de prácticas",
              type: "answer",
              answer:
                "Necesitas:\n- 240h de prácticas preprofesionales\n- 96h de servicio comunitario",
              file_name: "PROCEDIMIENTO-PRACTICAS-PREPROFESIONALES-Y-SERVICIO-COMUNITARIO.pdf",
            },
            registro: {
              title: "Registro de prácticas",
              type: "answer",
              answer:
                "El proceso se detalla en el procedimiento institucional. En general:\n1) Revisa fechas oficiales.\n2) Completa el formulario correspondiente.\n3) Entrega según indicaciones y espera aprobación.",
              file_name: "F_AA_119_INFORME_DE_PRACTICAS_PROFESIONALES.pdf",
            },
            formatos: {
              title: "Documentos para prácticas",
              type: "answer",
              answer:
                "Documentos referenciales:\n- F_AA_119 INFORME DE PRÁCTICAS PROFESIONALES\n- PROCEDIMIENTO PRÁCTICAS PREPROFESIONALES Y SERVICIO COMUNITARIO\n- FCP_001A INFORME CONVALIDACIÓN/RECONOCIMIENTO",
              file_name: "PACK_PRACTICAS_FORMATOS.pdf",
            },
          },
        },

        titulacion: {
          title: "Titulación",
          type: "options",
          options: [
            { id: "requisitos", label: "¿Cuáles son los requisitos para graduarme?" },
            { id: "proceso", label: "Proceso de graduación" },
          ],
          children: {
            requisitos: {
              title: "Requisitos para titularte",
              type: "answer",
              answer:
                "Para titularte necesitas cumplir:\n- Haber aprobado todas las materias/créditos del plan.\n- Cumplir prácticas y vinculación.\n- Aprobar una modalidad de titulación: TIC o Examen complexivo (según normativa vigente).",
              file_name: "PROCESO_DE_GRADUACION.pdf",
            },
            proceso: {
              title: "Proceso de graduación",
              type: "answer",
              answer:
                "El proceso de graduación suele incluir:\n1) Revisión de requisitos académicos\n2) Registro de modalidad (TIC/complexivo)\n3) Entrega/validación de documentos\n4) Declaración de aptitud para defensa (si aplica)\n5) Defensa y cierre",
              file_name: "PROCESO_DE_GRADUACION.pdf",
            },
          },
        },

        becas: {
          title: "Becas",
          type: "options",
          options: [
            { id: "merito_cultural", label: "Al mérito cultural" },
            { id: "rendimiento", label: "Rendimiento / excelencia" },
          ],
          children: {
            merito_cultural: {
              title: "Beca al mérito cultural",
              type: "answer",
              answer:
                "Beca al mérito cultural: se otorga según criterios institucionales (méritos, documentación de respaldo, y cumplimiento de requisitos). Revisa convocatoria y normativa vigente.",
              file_name: "BECAS_MERITO_CULTURAL.pdf",
            },
            rendimiento: {
              title: "Beca por rendimiento",
              type: "answer",
              answer:
                "Beca por rendimiento: considera desempeño académico destacado y cumplimiento de deberes institucionales. Revisa convocatoria oficial y requisitos.",
              file_name: "BECAS_RENDIMIENTO.pdf",
            },
          },
        },
      },
    },

    administrativas: {
      title: "Consultas administrativas",
      type: "options",
      options: [
        { id: "matricula", label: "Matrícula" },
        { id: "gratuidad", label: "Pérdida de la gratuidad" },
        { id: "anillados", label: "Entrega de anillados" },
        { id: "expediente", label: "Expediente de grado" },
      ],
      children: {
        matricula: {
          title: "Matrícula",
          type: "options",
          options: [
            { id: "ordinaria", label: "Ordinaria" },
            { id: "extraordinaria", label: "Extraordinaria" },
            { id: "excepcional", label: "Excepcional" },
            { id: "especial", label: "Especial" },
          ],
          children: {
            ordinaria: {
              title: "Matrícula ordinaria",
              type: "answer",
              answer:
                "Durante las fechas de matrícula ordinaria debes inscribirte según el turno asignado.\nRevisa tu turno en el sistema institucional y matricúlate en el período oficial.",
              file_name: "MATRICULA_ORDINARIA.pdf",
            },
            extraordinaria: {
              title: "Matrícula extraordinaria",
              type: "answer",
              answer:
                "La matrícula extraordinaria es un período adicional para estudiantes que no lograron matricularse en la ordinaria por inconvenientes específicos.\nSe requiere cumplir condiciones y plazos definidos.",
              file_name: "MATRICULA_EXTRAORDINARIA.pdf",
            },
            excepcional: {
              title: "Matrícula excepcional",
              type: "answer",
              answer:
                "La matrícula excepcional es el último recurso. Se usa únicamente en casos excepcionales autorizados por autoridades académicas.\nRevisa requisitos y pasos según normativa.",
              file_name: "MATRICULA_EXCEPCIONAL.pdf",
            },
            especial: {
              title: "Matrícula especial",
              type: "answer",
              answer:
                "La matrícula especial depende de condiciones particulares definidas por la institución (fechas, requisitos y autorizaciones).\nConsulta la normativa y comunicación oficial del período.",
              file_name: "MATRICULA_ESPECIAL.pdf",
            },
          },
        },

        gratuidad: {
          title: "Pérdida de la gratuidad",
          type: "options",
          options: [
            { id: "cuando", label: "¿Cuándo pierdo la gratuidad?" },
            { id: "excepcion", label: "¿Cómo solicito excepción a la pérdida de gratuidad?" },
          ],
          children: {
            cuando: {
              title: "¿Cuándo pierdo la gratuidad?",
              type: "answer",
              answer:
                "La pérdida de la gratuidad depende de normativa y condiciones (por ejemplo, repetición, tiempos máximos, etc.).\nRevisa el reglamento vigente y tu situación académica.",
              file_name: "GRATUIDAD_NORMATIVA.pdf",
            },
            excepcion: {
              title: "Excepción a la pérdida de gratuidad",
              type: "answer",
              answer:
                "Para solicitar excepción:\n- Mantén matrícula vigente\n- Cumple requisitos (ej.: % de créditos aprobados o recategorización)\n- Presenta solicitud/documentación dentro de los plazos institucionales",
              file_name: "EXCEPCION_GRATUIDAD.pdf",
            },
          },
        },

        anillados: {
          title: "Entrega de anillados",
          type: "answer",
          answer:
            "La entrega de anillados se realiza según calendario y requisitos.\nVerifica responsable, formato y fecha límite del semestre.",
          file_name: "ENTREGA_ANILLADOS.pdf",
        },

        expediente: {
          title: "Expediente de grado",
          type: "answer",
          answer:
            "Contacto referencial:\nNancy Naranjo – nancy.naranjo@epn.edu.ec\n\nRevisa requisitos y procedimiento institucional para el expediente de grado.",
          file_name: "EXPEDIENTE_DE_GRADO.pdf",
        },
      },
    },

    general: {
      title: "Información general",
      type: "options",
      options: [
        { id: "mision", label: "Misión" },
        { id: "vision", label: "Visión" },
        { id: "historia", label: "Historia" },
        { id: "principios", label: "Nuestros principios" },
        { id: "carreras", label: "Carreras (Software / Computación)" },
      ],
      children: {
        mision: {
          title: "Misión",
          type: "answer",
          answer:
            "La misión describe el propósito de la facultad y su compromiso con formación, investigación y vinculación orientadas a resolver problemas relevantes para la sociedad.",
          file_name: "MISION_FIS.pdf",
        },
        vision: {
          title: "Visión",
          type: "answer",
          answer:
            "La visión proyecta a la facultad como referente, con presencia destacada y orientación a ciencia y tecnología para aportar al país.",
          file_name: "VISION_FIS.pdf",
        },
        historia: {
          title: "Historia",
          type: "answer",
          answer:
            "La historia recoge los hitos principales de la facultad: creación, evolución académica y contribuciones en el tiempo.",
          file_name: "HISTORIA_FIS.pdf",
        },
        principios: {
          title: "Nuestros principios",
          type: "answer",
          answer:
            "Principios referenciales:\n- Compromiso social\n- Ética\n- Adaptabilidad e innovación\n- Calidad y excelencia\n(Ver documento institucional para el detalle).",
          file_name: "PRINCIPIOS_FIS.pdf",
        },
        carreras: {
          title: "Carreras",
          type: "options",
          options: [
            { id: "software", label: "Carrera en Software" },
            { id: "computacion", label: "Carrera en Computación" },
          ],
          children: {
            software: {
              title: "Carrera en Software",
              type: "answer",
              answer:
                "La carrera en Software se enfoca en ingeniería de software, desarrollo, calidad, arquitectura y gestión de proyectos para construir soluciones robustas.",
              file_name: "CARRERA_SOFTWARE.pdf",
            },
            computacion: {
              title: "Carrera en Computación",
              type: "answer",
              answer:
                "La carrera en Computación se enfoca en fundamentos de computación, algoritmos, sistemas, datos e investigación aplicada.",
              file_name: "CARRERA_COMPUTACION.pdf",
            },
          },
        },
      },
    },
  },
};

// Utilidad para resolver un nodo por path
export function resolveNodeByPath(path = []) {
  let node = FLOW_TREE;

  for (const id of path) {
    if (!node?.children?.[id]) {
      return {
        title: "No encontrado",
        type: "answer",
        answer: "No existe esa ruta en el flujo (mock).",
      };
    }
    node = node.children[id];
  }

  // Normalizamos respuesta como lo haría tu backend
  return {
    title: node.title || "Opciones guiadas",
    type: node.type || "options",
    options: node.options || [],
    answer: node.answer || null,
    file_name: node.file_name || null,
  };
}
