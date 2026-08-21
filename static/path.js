// ---------- learning path (english-path: B2 -> C1, 6 meses / 26 semanas) ----------
const PATH_MONTH_NAMES = {
  1: "month-01 — cimientos",
  2: "month-02 — gramática c1",
  3: "month-03 — presentaciones",
  4: "month-04 — negociación",
  5: "month-05 — fluidez",
  6: "month-06 — consolidación",
};

const PATH_WEEKS = [
  { id: 1, month: 1, title: "Estructura de equipo y empresa", focus: "Roles, stakeholders y organización de un equipo tech",
    vocab: [["stakeholder", "interesado / parte interesada", "We need sign-off from all key stakeholders before the release."],
    ["deliverable", "entregable", "The first deliverable is due by Friday."],
    ["cross-functional team", "equipo multidisciplinario", "It's a cross-functional team with devs, design, and product."],
    ["headcount", "número de personal", "We're increasing headcount in the backend team next quarter."],
    ["reporting line", "línea de reporte", "Her reporting line changed after the reorg."],
    ["scope", "alcance", "The scope of the project grew after the client's request."]],
    quiz: [{ q: "¿Qué palabra significa 'las personas afectadas o interesadas en un proyecto'?", opts: ["stakeholder", "headcount", "deliverable", "scope"], c: 0 },
    { q: "'The ___ of this sprint includes only the login feature.'", opts: ["headcount", "scope", "reporting line", "cross-functional team"], c: 1 },
    { q: "Elige la oración correcta.", opts: ["We has a cross-functional team.", "We have a cross-functional team.", "We having a cross-functional team.", "We has cross-functional team."], c: 1 },
    { q: "'Deliverable' significa principalmente:", opts: ["una reunión", "un resultado/entregable completado", "un puesto de trabajo", "un error de software"], c: 1 }],
    prompt: "Escribe 3-4 frases describiendo la estructura de tu equipo de trabajo (roles, reporting lines, stakeholders) usando al menos 3 palabras del vocabulario." },

  { id: 2, month: 1, title: "Reuniones: standups y sprint planning", focus: "Vocabulario para reuniones diarias de equipos de desarrollo",
    vocab: [["stand-up", "reunión diaria breve", "We do a 10-minute stand-up every morning."],
    ["blocker", "impedimento/obstáculo", "I have a blocker — I'm waiting on the API credentials."],
    ["action item", "tarea a realizar", "Let's list the action items before we wrap up."],
    ["to circle back", "retomar el tema más tarde", "Let's circle back to this after lunch."],
    ["to chime in", "intervenir/opinar", "Feel free to chime in if you disagree."],
    ["agenda", "orden del día", "Can you share the agenda before the meeting?"]],
    quiz: [{ q: "'I have a ___' significa que algo está frenando tu progreso.", opts: ["agenda", "blocker", "action item", "stand-up"], c: 1 },
    { q: "Elige el phrasal verb correcto: 'Let's ___ to this topic next week.'", opts: ["chime in", "circle back", "chime back", "circle in"], c: 1 },
    { q: "¿Cuál es más apropiado para abrir una reunión?", opts: ["Let's chime in.", "Here's today's agenda.", "That's a blocker.", "Circle back please."], c: 1 },
    { q: "'Action item' se refiere a:", opts: ["una reunión programada", "una tarea que alguien debe completar", "un bug de software", "un puesto"], c: 1 }],
    prompt: "Redacta un breve resumen (5-6 líneas) de una reunión de standup imaginaria: qué se discutió, qué blockers hay, y 2 action items." },

  { id: 3, month: 1, title: "Correos electrónicos formales", focus: "Estructuras de cortesía y tono profesional en emails",
    vocab: [["I am writing to...", "le escribo para...", "I am writing to follow up on our conversation."],
    ["please find attached", "adjunto encontrará", "Please find attached the report you requested."],
    ["at your earliest convenience", "a la brevedad posible", "Please reply at your earliest convenience."],
    ["I would appreciate it if...", "le agradecería si...", "I would appreciate it if you could confirm by Friday."],
    ["kind regards", "saludos cordiales", "Kind regards, Ana"],
    ["to follow up on", "dar seguimiento a", "I'm following up on my previous email."]],
    quiz: [{ q: "¿Cuál es el cierre más formal?", opts: ["See ya!", "Kind regards,", "Bye", "Talk soon"], c: 1 },
    { q: "'Please find ___ the invoice.'", opts: ["attach", "attached", "attaching", "attachment"], c: 1 },
    { q: "Forma más educada de pedir una respuesta rápida:", opts: ["Reply now.", "At your earliest convenience.", "Answer fast please.", "Reply ASAP!!"], c: 1 },
    { q: "Completa: 'I ___ appreciate it if you could send the file.'", opts: ["would", "will", "am", "was"], c: 0 }],
    prompt: "Escribe un correo formal breve (4-5 líneas) pidiendo una extensión de fecha límite para un entregable." },

  { id: 4, month: 1, title: "Números y métricas", focus: "Describir tendencias, datos y KPIs",
    vocab: [["a slight increase", "un ligero aumento", "There was a slight increase in server uptime."],
    ["a sharp decline", "una caída pronunciada", "We saw a sharp decline in response time after the fix."],
    ["to plateau", "estabilizarse/estancarse", "User growth has plateaued this quarter."],
    ["on average", "en promedio", "On average, we close 20 tickets a week."],
    ["a significant improvement", "una mejora significativa", "There's been a significant improvement in load speed."],
    ["to fluctuate", "fluctuar", "CPU usage fluctuates throughout the day."]],
    quiz: [{ q: "¿Qué frase describe números bajando rápidamente?", opts: ["a slight increase", "a sharp decline", "to plateau", "on average"], c: 1 },
    { q: "'Our uptime has ___ at 99.9% for months.'", opts: ["fluctuated", "plateaued", "declined", "appreciated"], c: 1 },
    { q: "Elige la oración correcta.", opts: ["The bugs was reduced significant.", "The bugs were reduced significantly.", "The bug reduce significantly.", "Bugs reducing significant."], c: 1 },
    { q: "'On average' significa:", opts: ["en el punto más alto", "típicamente/usualmente", "nunca", "repentinamente"], c: 1 }],
    prompt: "Describe en 3-4 frases una métrica de tu trabajo (bugs, deploys, tráfico) usando al menos 2 expresiones de tendencia." },

  { id: 5, month: 2, title: "Condicionales mixtos", focus: "Hablar de decisiones técnicas pasadas y su efecto actual",
    vocab: [["tech debt", "deuda técnica", "We wouldn't have this tech debt if we had refactored earlier."],
    ["to have refactored", "haber refactorizado", "If we had refactored this module, it would be easier to maintain now."],
    ["legacy system", "sistema heredado", "We're still dealing with a legacy system from 2015."],
    ["to migrate", "migrar", "If we migrated to the new stack, we'd save costs."],
    ["trade-off", "compromiso/disyuntiva", "Every architecture decision involves a trade-off."],
    ["workaround", "solución alternativa", "We used a workaround until the real fix was deployed."]],
    quiz: [{ q: "'If we ___ earlier, we would be in better shape now.' (condicional mixto)", opts: ["migrate", "had migrated", "migrated", "migrating"], c: 1 },
    { q: "¿Cuál es un condicional mixto correcto?", opts: ["If we had tested more, we are safer now.", "If we had tested more, we would be safer now.", "If we test more, we would been safer.", "If we tested more, we have been safer."], c: 1 },
    { q: "'Trade-off' significa:", opts: ["un bug", "un balance entre dos cosas en competencia", "una fecha límite", "una reunión"], c: 1 },
    { q: "'Legacy system' se refiere a:", opts: ["una herramienta nueva", "un sistema antiguo aún en uso", "un empleado despedido", "una revisión de código"], c: 1 }],
    prompt: "Escribe 2 oraciones con condicional mixto sobre una decisión técnica pasada que afecta tu situación actual." },

  { id: 6, month: 2, title: "Inversión y énfasis", focus: "Estructuras enfáticas para describir logros e incidentes",
    vocab: [["not only... but also", "no solo... sino también", "Not only did we fix the bug, but we also improved performance."],
    ["rarely", "rara vez", "Rarely have we shipped a release this smooth."],
    ["under no circumstances", "bajo ninguna circunstancia", "Under no circumstances should we deploy on a Friday."],
    ["little did we know", "poco sabíamos que", "Little did we know the outage would last six hours."],
    ["seldom", "raramente", "Seldom do incidents get resolved this fast."],
    ["no sooner...than", "apenas... cuando", "No sooner had we deployed than the servers crashed."]],
    quiz: [{ q: "'___ have we seen such fast growth.'", opts: ["Rare", "Rarely", "Rarity", "Rarest"], c: 1 },
    { q: "'___ should you push directly to main.'", opts: ["Under no circumstances", "Under any circumstances", "In no circumstances not", "Never not"], c: 0 },
    { q: "'No sooner had we launched ___ the bug reports started.'", opts: ["that", "then", "than", "when"], c: 2 },
    { q: "'Not only did the team fix the issue, ___ they documented it.'", opts: ["but also", "but", "also", "and also"], c: 0 }],
    prompt: "Escribe 2 oraciones usando inversión (Rarely.../Under no circumstances.../No sooner...) describiendo un incidente técnico." },

  { id: 7, month: 2, title: "Estilo indirecto (reported speech)", focus: "Reportar lo que dijeron clientes o compañeros en llamadas",
    vocab: [["to point out", "señalar", "She pointed out that the deadline was unrealistic."],
    ["to claim", "afirmar", "The vendor claimed the issue was fixed."],
    ["to insist", "insistir", "He insisted that we test again before release."],
    ["to assure", "asegurar", "They assured us the data was backed up."],
    ["to bring up", "mencionar/sacar el tema", "He brought up the budget during the call."],
    ["to reiterate", "reiterar", "She reiterated that security was the top priority."]],
    quiz: [{ q: "'The client said, \"The deadline is too tight.\"' → The client ___ the deadline was too tight.", opts: ["said", "told", "pointed out", "tell"], c: 2 },
    { q: "'He said, \"I will fix it today.\"' → He said he ___ fix it that day.", opts: ["will", "would", "has", "is"], c: 1 },
    { q: "¿Qué verbo encaja? 'They ___ us the servers were secure.' (aseguraron con confianza)", opts: ["brought up", "assured", "claimed", "pointed out"], c: 1 },
    { q: "'To reiterate' significa:", opts: ["repetir para enfatizar", "estar en desacuerdo", "cancelar", "preguntar"], c: 0 }],
    prompt: "Reporta (en discurso indirecto) 3 cosas que un cliente o compañero te dijo en una llamada reciente." },

  { id: 8, month: 2, title: "Cláusulas relativas y conectores formales", focus: "Redacción de documentación técnica",
    vocab: [["whereby", "mediante el cual", "We introduced a process whereby every PR needs two reviewers."],
    ["whereas", "mientras que", "The old API was synchronous, whereas the new one is async."],
    ["given that", "dado que", "Given that the API is deprecated, we should migrate soon."],
    ["provided that", "siempre que", "You can merge, provided that all tests pass."],
    ["in that", "en el sentido de que", "This approach is better in that it scales more easily."],
    ["notwithstanding", "a pesar de", "Notwithstanding the delays, the project launched on time."]],
    quiz: [{ q: "'You can deploy, ___ the tests pass.'", opts: ["whereas", "provided that", "notwithstanding", "in that"], c: 1 },
    { q: "'The frontend uses React, ___ the backend uses Go.'", opts: ["whereas", "given that", "provided that", "whereby"], c: 0 },
    { q: "'___ the tight deadline, the team delivered on time.'", opts: ["Given that", "Notwithstanding", "Whereby", "In that"], c: 1 },
    { q: "'We built a system ___ users can reset passwords automatically.'", opts: ["whereby", "whereas", "provided that", "in that"], c: 0 }],
    prompt: "Escribe 2-3 frases usando conectores formales (whereas, given that, provided that) describiendo un proceso técnico de tu trabajo." },

  { id: 9, month: 3, title: "Estructura de presentaciones", focus: "Abrir, transicionar y cerrar un demo day",
    vocab: [["to walk (someone) through", "explicar paso a paso", "Let me walk you through the new dashboard."],
    ["to give an overview", "dar un resumen general", "I'll give a quick overview before the demo."],
    ["key takeaway", "idea principal/clave", "The key takeaway is that load times dropped by 40%."],
    ["moving on to...", "pasando a...", "Moving on to the next slide, here are the results."],
    ["to wrap up", "concluir/cerrar", "To wrap up, let's recap the three main points."],
    ["to recap", "recapitular", "Let me recap what we've covered so far."]],
    quiz: [{ q: "Mejor frase para iniciar una presentación:", opts: ["Moving on to...", "I'll give a quick overview...", "To wrap up...", "Let me recap..."], c: 1 },
    { q: "'___ the next slide, we'll look at performance.'", opts: ["Wrapping up", "Moving on to", "Recapping", "Overview"], c: 1 },
    { q: "'Key takeaway' significa:", opts: ["un detalle al azar", "el punto principal a recordar", "una pregunta", "un error"], c: 1 },
    { q: "Mejor frase para cerrar una presentación:", opts: ["Moving on to...", "To wrap up...", "Let me walk you through...", "Give an overview"], c: 1 }],
    prompt: "Escribe la apertura y el cierre (2-3 frases cada uno) de una presentación sobre un proyecto tuyo." },

  { id: 10, month: 3, title: "Lenguaje persuasivo", focus: "Presentar propuestas técnicas de forma convincente",
    vocab: [["the evidence suggests", "la evidencia sugiere", "The evidence suggests this approach reduces costs."],
    ["it's worth noting that", "vale la pena señalar que", "It's worth noting that this solution scales well."],
    ["compelling case", "caso convincente", "There's a compelling case for migrating to microservices."],
    ["to make the case for", "argumentar a favor de", "I'd like to make the case for automating this process."],
    ["clear-cut", "claro/evidente", "The benefits here are clear-cut."],
    ["to outweigh", "superar en importancia a", "The benefits outweigh the risks."]],
    quiz: [{ q: "'The benefits ___ the risks.' (son mayores que)", opts: ["outweigh", "make the case", "suggest", "note"], c: 0 },
    { q: "Apertura más persuasiva:", opts: ["Maybe we could...", "There's a compelling case for...", "I guess...", "It's just an idea..."], c: 1 },
    { q: "'It's ___ noting that this saves us time.'", opts: ["worth", "worthy", "worthful", "value"], c: 0 },
    { q: "'Clear-cut' significa:", opts: ["confuso", "obvio/evidente", "arriesgado", "costoso"], c: 1 }],
    prompt: "Escribe un párrafo corto (3-4 frases) argumentando a favor de una herramienta o proceso que te gustaría implementar en tu trabajo." },

  { id: 11, month: 3, title: "Preguntas difíciles en vivo", focus: "Manejar Q&A, objeciones y momentos de incertidumbre",
    vocab: [["that's a fair question", "es una pregunta válida", "That's a fair question — let me think about it."],
    ["off the top of my head", "de memoria/sin pensarlo mucho", "Off the top of my head, I'd say around 200ms."],
    ["let me get back to you on that", "te responderé eso después", "I don't have the number — let me get back to you on that."],
    ["to push back", "objetar/cuestionar", "I'd push back slightly on that assumption."],
    ["good point", "buen punto", "Good point — we hadn't considered that edge case."],
    ["to clarify", "aclarar", "Could you clarify what you mean by 'scalable'?"]],
    quiz: [{ q: "Mejor forma de admitir que no sabes algo:", opts: ["I have no idea.", "Let me get back to you on that.", "That's not my problem.", "No comment."], c: 1 },
    { q: "'___, I'd estimate 3 weeks.' (estimación rápida)", opts: ["Off the top of my head", "Let me get back to you", "That's a fair question", "Good point"], c: 0 },
    { q: "Forma educada de estar en desacuerdo:", opts: ["You're wrong.", "I'd push back slightly on that.", "That's false.", "No way."], c: 1 },
    { q: "'Could you ___ what you mean by that?'", opts: ["push back", "clarify", "get back", "note"], c: 1 }],
    prompt: "Escribe 2 respuestas posibles a una pregunta difícil sobre tu proyecto: una donde sabes la respuesta y otra donde no." },

  { id: 12, month: 3, title: "Práctica integral de presentación", focus: "Combina todo lo del mes en una presentación real grabada",
    vocab: [["stakeholder buy-in", "respaldo de los interesados", "We need stakeholder buy-in before rolling this out."],
    ["roadmap", "hoja de ruta", "Here's our roadmap for the next two quarters."],
    ["milestone", "hito", "We hit our first milestone ahead of schedule."],
    ["to align on", "ponerse de acuerdo en", "Let's align on priorities before we start."],
    ["next steps", "próximos pasos", "Here are the next steps after this meeting."],
    ["to circle the room", "dar la palabra a todos", "Let's circle the room for any final thoughts."]],
    quiz: [{ q: "'Roadmap' se refiere a:", opts: ["una lista de bugs", "un plan con pasos/tiempos futuros", "una sala de juntas", "un correo"], c: 1 },
    { q: "'We need ___ before rolling this out.' (aprobación de gente clave)", opts: ["stakeholder buy-in", "a milestone", "next steps", "a roadmap"], c: 0 },
    { q: "'Let's ___ on priorities.' (ponerse de acuerdo)", opts: ["align", "circle", "wrap", "note"], c: 0 },
    { q: "Mejor línea de cierre con próximos pasos:", opts: ["That's all, bye.", "Here are the next steps going forward.", "No more questions.", "The end."], c: 1 }],
    prompt: "Prepara y practica en voz alta (grábate) una presentación de 2-3 minutos sobre un proyecto real tuyo: apertura, 2 puntos clave, cierre con next steps." },

  { id: 13, month: 4, title: "Negociar fechas y alcance", focus: "Ceder, condicionar y sostener posiciones con clientes o jefes",
    vocab: [["to be willing to", "estar dispuesto a", "We'd be willing to extend the deadline by a week."],
    ["on the condition that", "con la condición de que", "We can do this, on the condition that scope doesn't change."],
    ["to meet halfway", "llegar a un punto medio", "Let's try to meet halfway on the timeline."],
    ["non-negotiable", "innegociable", "Security review is non-negotiable."],
    ["to compromise", "ceder/llegar a un acuerdo", "We compromised on a smaller feature set."],
    ["bottom line", "punto final/límite", "Our bottom line is we can't ship without testing."]],
    quiz: [{ q: "'We'd be ___ to help, provided the scope stays the same.'", opts: ["willing", "compromise", "bottom line", "non-negotiable"], c: 0 },
    { q: "'Security review is ___.' (no se puede cambiar)", opts: ["negotiable", "non-negotiable", "willing", "a compromise"], c: 1 },
    { q: "'Let's try to ___ on the deadline.' (punto medio)", opts: ["meet halfway", "be willing", "compromise on", "bottom line"], c: 0 },
    { q: "'Bottom line' significa:", opts: ["el primer punto", "el punto más importante/final", "un chiste", "un saludo"], c: 1 }],
    prompt: "Escribe un breve diálogo (4 líneas) negociando una fecha de entrega con un cliente o jefe." },

  { id: 14, month: 4, title: "Desacuerdo diplomático", focus: "Dar feedback en code reviews sin sonar brusco",
    vocab: [["I see your point, but...", "entiendo tu punto, pero...", "I see your point, but I think there's a simpler approach."],
    ["have you considered...?", "¿has considerado...?", "Have you considered using a queue here instead?"],
    ["I'm not entirely convinced that...", "no estoy del todo convencido de que...", "I'm not entirely convinced that this scales well."],
    ["to nitpick", "criticar detalles menores", "Sorry to nitpick, but this variable name is unclear."],
    ["constructive feedback", "retroalimentación constructiva", "I want to give some constructive feedback on this PR."],
    ["to play devil's advocate", "hacer de abogado del diablo", "Just to play devil's advocate, what if traffic spikes?"]],
    quiz: [{ q: "Forma más diplomática de estar en desacuerdo:", opts: ["That's wrong.", "I see your point, but I'd suggest...", "No, do it my way.", "Bad idea."], c: 1 },
    { q: "'Sorry to ___, but this naming could be clearer.'", opts: ["nitpick", "compromise", "align", "push back"], c: 0 },
    { q: "'___ using caching here?' (sugerencia educada)", opts: ["Have you considered", "I'm not convinced", "Bottom line", "Nitpick"], c: 0 },
    { q: "'To play devil's advocate' significa:", opts: ["estar completamente de acuerdo", "argumentar lo opuesto para probar una idea", "terminar una conversación", "disculparse"], c: 1 }],
    prompt: "Escribe un comentario de code review (2-3 frases) dando retroalimentación constructiva de forma diplomática." },

  { id: 15, month: 4, title: "Phrasal verbs de dev y negocios", focus: "Vocabulario cotidiano de equipos técnicos",
    vocab: [["to roll out", "lanzar/implementar", "We're rolling out the update next Monday."],
    ["to roll back", "revertir", "We had to roll back the deployment."],
    ["to spin up", "poner en marcha/crear", "Let's spin up a new environment for testing."],
    ["to iron out", "resolver detalles/pulir", "We need to iron out a few bugs before launch."],
    ["to follow up", "dar seguimiento", "I'll follow up with the client tomorrow."],
    ["to scale back", "reducir", "We scaled back the scope to meet the deadline."]],
    quiz: [{ q: "'We had to ___ the release after it broke prod.'", opts: ["roll out", "roll back", "spin up", "scale back"], c: 1 },
    { q: "'Let's ___ a test server.' (crear rápidamente)", opts: ["spin up", "iron out", "follow up", "roll back"], c: 0 },
    { q: "'We need to ___ a few details before launch.'", opts: ["iron out", "roll out", "scale back", "spin up"], c: 0 },
    { q: "'To scale back' significa:", opts: ["aumentar", "reducir", "lanzar", "probar"], c: 1 }],
    prompt: "Escribe 3 frases usando phrasal verbs diferentes (roll out, spin up, iron out, follow up, scale back, roll back) sobre tu trabajo." },

  { id: 16, month: 4, title: "Idioms y collocations de negocios", focus: "Expresiones comunes en ambientes corporativos y tech",
    vocab: [["low-hanging fruit", "lo más fácil de lograr primero", "Let's tackle the low-hanging fruit first — quick wins."],
    ["move the needle", "generar un impacto real", "This feature won't really move the needle."],
    ["think outside the box", "pensar de forma creativa", "We need to think outside the box for this problem."],
    ["on the same page", "de acuerdo/alineados", "Let's make sure we're on the same page before starting."],
    ["a game changer", "algo que cambia todo", "This new tool has been a game changer for our workflow."],
    ["to hit the ground running", "empezar con fuerza sin demora", "The new hire hit the ground running."]],
    quiz: [{ q: "'Low-hanging fruit' se refiere a:", opts: ["tareas difíciles a largo plazo", "tareas fáciles con resultados rápidos", "un snack", "un error"], c: 1 },
    { q: "'This won't really ___.' (tener un impacto significativo)", opts: ["move the needle", "hit the ground running", "think outside the box", "be on the same page"], c: 0 },
    { q: "'Let's make sure we're ___ before starting.'", opts: ["a game changer", "on the same page", "low-hanging fruit", "the needle"], c: 1 },
    { q: "'To hit the ground running' significa:", opts: ["fallar de inmediato", "empezar fuerte sin demora", "renunciar", "frenar"], c: 1 }],
    prompt: "Escribe 2 frases usando idioms de negocios (move the needle, game changer, on the same page, etc.) en contexto de tu trabajo." },

  { id: 17, month: 5, title: "Listening con acentos variados", focus: "Comprender inglés de negocios hablado por no nativos y distintos acentos",
    vocab: [["could you say that again?", "¿podrías repetirlo?", "Sorry, could you say that again?"],
    ["I didn't quite catch that", "no logré entender bien eso", "I didn't quite catch that — could you repeat it?"],
    ["to speak more slowly", "hablar más despacio", "Would you mind speaking a bit more slowly?"],
    ["accent", "acento", "She has a strong Scottish accent."],
    ["to mumble", "hablar poco claro", "He was mumbling, so I missed the details."],
    ["native speaker", "hablante nativo", "Not all native speakers speak the same way."]],
    quiz: [{ q: "Forma educada de pedir que repitan algo:", opts: ["What?", "Could you say that again?", "I don't understand you.", "Huh?"], c: 1 },
    { q: "'I didn't ___ catch that.'", opts: ["quite", "very", "too", "so"], c: 0 },
    { q: "'Would you mind ___ more slowly?'", opts: ["speak", "to speak", "speaking", "spoke"], c: 2 },
    { q: "'To mumble' significa:", opts: ["hablar claro", "hablar poco claro/en voz baja", "gritar", "susurrar a propósito"], c: 1 }],
    prompt: "Escucha un podcast o video de negocios/tech en inglés durante 10 minutos y escribe 3 frases clave que entendiste (en tus propias palabras)." },

  { id: 18, month: 5, title: "Small talk y networking", focus: "Iniciar y cerrar conversaciones informales en eventos profesionales",
    vocab: [["what do you do?", "¿a qué te dedicas?", "So, what do you do?"],
    ["how's it going?", "¿cómo va todo?", "Hey, how's it going?"],
    ["small world!", "¡qué pequeño es el mundo!", "Wait, you know her too? Small world!"],
    ["to catch up", "ponerse al día", "We should catch up over coffee sometime."],
    ["it was great meeting you", "fue un placer conocerte", "It was great meeting you, let's stay in touch."],
    ["let's keep in touch", "mantengámonos en contacto", "Let's keep in touch — here's my card."]],
    quiz: [{ q: "Apertura común en un evento de networking:", opts: ["So, what do you do?", "Give me your money.", "Goodbye.", "I disagree."], c: 0 },
    { q: "'We should ___ over coffee.'", opts: ["catch up", "keep in touch", "small world", "hit the ground"], c: 0 },
    { q: "Mejor línea de cierre tras una buena conversación:", opts: ["Bye.", "It was great meeting you, let's keep in touch.", "OK, done.", "No more talking."], c: 1 },
    { q: "'Small world!' se usa cuando:", opts: ["te sorprende una coincidencia", "estás enojado", "estás confundido", "te vas"], c: 0 }],
    prompt: "Escribe un mini-diálogo de small talk (4-5 líneas) como si conocieras a alguien nuevo en una conferencia tech." },

  { id: 19, month: 5, title: "Feedback y evaluaciones de desempeño", focus: "Dar y recibir retroalimentación con tacto",
    vocab: [["to excel at", "destacar en", "She excels at debugging complex issues."],
    ["room for improvement", "margen de mejora", "There's room for improvement in your documentation."],
    ["to fall short of", "no alcanzar/quedarse corto", "The project fell short of expectations."],
    ["strength", "fortaleza", "Communication is one of your strengths."],
    ["to build on", "aprovechar/desarrollar a partir de", "Let's build on what you did well this quarter."],
    ["actionable feedback", "retroalimentación aplicable", "I want to give you actionable feedback, not just criticism."]],
    quiz: [{ q: "'There's ___ in how you document code.' (podría mejorar)", opts: ["a strength", "room for improvement", "an excel", "a build on"], c: 1 },
    { q: "'The project ___ expectations.' (no las cumplió)", opts: ["fell short of", "excelled at", "built on", "kept in touch"], c: 0 },
    { q: "'She ___ at solving hard problems.'", opts: ["excels", "falls short", "builds", "circles"], c: 0 },
    { q: "'Actionable feedback' es una retroalimentación que:", opts: ["es vaga", "se puede aplicar/es específica", "solo es negativa", "solo es positiva"], c: 1 }],
    prompt: "Escribe retroalimentación breve y constructiva para un compañero de equipo, usando al menos 2 palabras del vocabulario." },

  { id: 20, month: 5, title: "Reportes ejecutivos y postmortems", focus: "Escribir informes de incidentes y resúmenes ejecutivos",
    vocab: [["root cause", "causa raíz", "The root cause was a misconfigured server."],
    ["to mitigate", "mitigar", "We added monitoring to mitigate future risks."],
    ["lessons learned", "lecciones aprendidas", "Here are the lessons learned from this incident."],
    ["executive summary", "resumen ejecutivo", "The executive summary highlights the key impact and next steps."],
    ["impact", "impacto", "The outage had a significant impact on revenue."],
    ["preventive measure", "medida preventiva", "We're implementing preventive measures to avoid recurrence."]],
    quiz: [{ q: "'Root cause' significa:", opts: ["el resultado final", "la fuente original de un problema", "un efecto secundario", "una solución temporal"], c: 1 },
    { q: "'We added alerts to ___ future incidents.'", opts: ["mitigate", "impact", "excel at", "circle back"], c: 0 },
    { q: "El resumen corto al inicio de un reporte se llama:", opts: ["root cause", "executive summary", "lessons learned", "impact"], c: 1 },
    { q: "'Preventive measure' se refiere a:", opts: ["una acción para evitar problemas futuros", "un castigo", "un reporte de bug", "una reunión"], c: 0 }],
    prompt: "Escribe un mini resumen ejecutivo (3-4 frases) de un incidente o problema técnico: causa raíz, impacto y medida preventiva." },

  { id: 21, month: 5, title: "Simulación integrada: caso de negocio", focus: "Combina listening, speaking y writing en un caso real",
    vocab: [["to weigh the options", "sopesar las opciones", "Let's weigh the options before deciding."],
    ["trade-off analysis", "análisis de compromisos", "We did a trade-off analysis between speed and cost."],
    ["worst-case scenario", "el peor escenario posible", "In the worst-case scenario, we'd lose an hour of data."],
    ["to prioritize", "priorizar", "We need to prioritize security over speed here."],
    ["feasible", "factible", "Is this timeline feasible given our resources?"],
    ["to escalate", "escalar", "If it's not resolved by tonight, escalate it to the lead."]],
    quiz: [{ q: "'Is this deadline ___?' (realista/alcanzable)", opts: ["feasible", "escalate", "worst-case", "prioritize"], c: 0 },
    { q: "'If unresolved, ___ it to the team lead.'", opts: ["escalate", "weigh", "prioritize", "mitigate"], c: 0 },
    { q: "'In the ___, we'd lose an hour of data.'", opts: ["trade-off analysis", "worst-case scenario", "executive summary", "root cause"], c: 1 },
    { q: "'To weigh the options' significa:", opts: ["ignorar las alternativas", "considerar cuidadosamente las alternativas", "elegir al azar", "rechazar todo"], c: 1 }],
    prompt: "Describe un caso real (breve) donde tuviste que priorizar entre dos opciones en el trabajo, usando el vocabulario de la semana." },

  { id: 22, month: 6, title: "Repaso de gramática C1", focus: "Mezcla de todos los conectores y estructuras avanzadas vistas",
    vocab: [["albeit", "aunque/si bien", "The fix worked, albeit slowly."],
    ["as opposed to", "en contraposición a", "We chose SQL, as opposed to NoSQL, for consistency."],
    ["in light of", "a la luz de/considerando", "In light of recent issues, we're adding more tests."],
    ["to the extent that", "en la medida en que", "We automated to the extent that manual QA is rarely needed."],
    ["by and large", "en general", "By and large, the migration went smoothly."],
    ["with regard to", "con respecto a", "With regard to the budget, we're on track."]],
    quiz: [{ q: "'The fix worked, ___ slowly.'", opts: ["albeit", "as opposed to", "by and large", "with regard to"], c: 0 },
    { q: "'___ recent outages, we're adding redundancy.'", opts: ["In light of", "As opposed to", "Albeit", "To the extent that"], c: 0 },
    { q: "'___ the budget, we're on track.'", opts: ["With regard to", "By and large", "Albeit", "In light of"], c: 0 },
    { q: "'By and large' significa:", opts: ["específicamente", "en general/globalmente", "nunca", "urgentemente"], c: 1 }],
    prompt: "Escribe 3 frases usando los conectores formales repasados esta semana (albeit, in light of, with regard to, etc.)." },

  { id: 23, month: 6, title: "Entrevista técnica simulada", focus: "Practicar preguntas de entrevista con estructura STAR",
    vocab: [["tell me about a time when...", "cuéntame sobre una vez que...", "Tell me about a time when you solved a difficult bug."],
    ["I was responsible for", "yo era responsable de", "I was responsible for the migration to the new database."],
    ["the outcome was", "el resultado fue", "The outcome was a 30% improvement in speed."],
    ["what would you do differently?", "¿qué harías diferente?", "Looking back, what would you do differently?"],
    ["strong communication skills", "buenas habilidades de comunicación", "I believe I have strong communication skills."],
    ["to walk through my thought process", "explicar mi razonamiento paso a paso", "Let me walk you through my thought process."]],
    quiz: [{ q: "Pregunta típica de entrevista:", opts: ["Tell me about a time when...", "Give me your money.", "I don't know.", "Whatever."], c: 0 },
    { q: "'I ___ responsible for leading the migration.'", opts: ["was", "is", "am being", "were"], c: 0 },
    { q: "'The ___ was a 30% improvement.' (resultado)", opts: ["outcome", "headcount", "blocker", "scope"], c: 0 },
    { q: "Buena forma de explicar tu razonamiento:", opts: ["Let me walk you through my thought process.", "Just trust me.", "It's obvious.", "I guessed."], c: 0 }],
    prompt: "Practica (grabado) responder: 'Tell me about a time you solved a difficult technical problem' usando estructura STAR (situación, tarea, acción, resultado)." },

  { id: 24, month: 6, title: "Semana libre — refuerzo de tu punto débil", focus: "Dedica esta semana 100% a tu habilidad más débil: listening, speaking, writing o gramática",
    vocab: [["blocker", "impedimento (repaso)", "I have a blocker on this task."],
    ["root cause", "causa raíz (repaso)", "What was the root cause of the outage?"],
    ["trade-off", "compromiso (repaso)", "Every decision has a trade-off."],
    ["to circle back", "retomar después (repaso)", "Let's circle back tomorrow."],
    ["non-negotiable", "innegociable (repaso)", "Testing is non-negotiable."],
    ["actionable feedback", "retroalimentación aplicable (repaso)", "Please give me actionable feedback."]],
    quiz: [{ q: "'If we ___ tested more, we'd be safer now.' (condicional mixto)", opts: ["test", "tested", "had tested", "testing"], c: 2 },
    { q: "'___ have we seen such a smooth launch.' (inversión)", opts: ["Rarely", "Rare", "Rarity", "Rarest"], c: 0 },
    { q: "¿Cuál es el significado correcto de 'root cause'?", opts: ["una solución temporal", "la fuente original de un problema", "un efecto secundario", "una opinión"], c: 1 },
    { q: "'Non-negotiable' significa:", opts: ["se puede cambiar fácilmente", "no se puede cambiar", "es opcional", "es una sugerencia"], c: 1 }],
    prompt: "Esta semana es libre: dedica tu tiempo a tu punto más débil (habla, escritura, listening o gramática) y escribe aquí qué practicaste y cómo te fue." },

  { id: 25, month: 6, title: "Proyecto final: propuesta de negocio", focus: "Integra todo en una propuesta real con email y presentación",
    vocab: [["business case", "caso de negocio/justificación", "I've prepared a business case for this investment."],
    ["return on investment (ROI)", "retorno de inversión", "The ROI on this tool is clear within six months."],
    ["implementation plan", "plan de implementación", "Here's our implementation plan for the next quarter."],
    ["risk assessment", "evaluación de riesgos", "We did a risk assessment before proceeding."],
    ["to secure approval", "obtener aprobación", "We need to secure approval from finance first."],
    ["success metric", "métrica de éxito", "Our main success metric is reduced response time."]],
    quiz: [{ q: "'ROI' significa:", opts: ["Rate of Interest", "Return on Investment", "Risk of Incident", "Result of Implementation"], c: 1 },
    { q: "'We need to ___ approval before starting.'", opts: ["secure", "circle", "weigh", "mitigate"], c: 0 },
    { q: "'Success metric' se refiere a:", opts: ["un número al azar", "un indicador medible de éxito", "un puesto de trabajo", "una reunión"], c: 1 },
    { q: "'Business case' significa:", opts: ["un caso legal", "una justificación para una decisión/inversión", "un maletín", "una queja de cliente"], c: 1 }],
    prompt: "Escribe tu propuesta final (6-8 frases): un email + resumen de presentación proponiendo un proyecto real, incluyendo business case, plan de implementación y success metrics." },

  { id: 26, month: 6, title: "Evaluación final y retrospectiva", focus: "Reflexiona sobre tu progreso durante los 6 meses",
    vocab: [["to reflect on", "reflexionar sobre", "Let's reflect on how far we've come."],
    ["progress", "progreso", "I've made real progress over these six months."],
    ["to sustain", "mantener/sostener", "How will you sustain this progress going forward?"],
    ["milestone", "hito", "Reaching C1 is a huge milestone."],
    ["key takeaway", "idea clave", "My key takeaway from this journey is consistency matters."],
    ["next steps", "próximos pasos", "Here are my next steps to keep improving."]],
    quiz: [{ q: "'___ did we expect such fast progress.' (inversión, pasado)", opts: ["Little", "Few", "Small", "Not"], c: 0 },
    { q: "'If I ___ practiced daily from month 1, I'd be more fluent now.' (condicional mixto)", opts: ["have", "had", "would have", "was"], c: 1 },
    { q: "¿Qué frase señala mejor un argumento persuasivo?", opts: ["Maybe, I don't know...", "The evidence suggests...", "I guess so.", "Whatever works."], c: 1 },
    { q: "'Sustain progress' significa:", opts: ["dejar de mejorar", "seguir mejorando con el tiempo", "perder el progreso", "empezar de cero"], c: 1 }],
    prompt: "Reflexiona (6-8 frases) sobre tu progreso en estos 6 meses: qué mejoró más, qué fue más difícil, y cuáles son tus próximos pasos para mantener el nivel C1." },
];

const PATH_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const PATH_DAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

let pathCurrentWeekId = 1;

function ensurePathProgress() {
  if (!state.pathProgress) state.pathProgress = {};
  PATH_WEEKS.forEach((w) => {
    if (!state.pathProgress[w.id]) {
      state.pathProgress[w.id] = {
        checklist: [false, false, false, false, false, false, false],
        quizScore: null,
        quizTotal: w.quiz.length,
        writing: "",
      };
    }
  });
}

function pathWeekPct(w) {
  const p = state.pathProgress[w.id];
  const daysDone = p.checklist.filter(Boolean).length;
  const quizDone = p.quizScore !== null ? 1 : 0;
  const writingDone = p.writing && p.writing.trim().length > 0 ? 1 : 0;
  return (daysDone / 7) * 0.6 + quizDone * 0.25 + writingDone * 0.15;
}

function pathOverallPct() {
  const total = PATH_WEEKS.reduce((s, w) => s + pathWeekPct(w), 0);
  return Math.round((total / PATH_WEEKS.length) * 100);
}

function buildPathSidebar() {
  const container = document.getElementById("pathMonthContainer");
  container.innerHTML = "";
  for (let m = 1; m <= 6; m++) {
    const block = document.createElement("div");
    block.className = "path-month-block";
    const weeksInMonth = PATH_WEEKS.filter((w) => w.month === m);
    const avgPct = Math.round(
      (weeksInMonth.reduce((s, w) => s + pathWeekPct(w), 0) / weeksInMonth.length) * 100
    );
    const isCurrentMonth = weeksInMonth.some((w) => w.id === pathCurrentWeekId);
    const header = document.createElement("div");
    header.className = "path-month-header" + (isCurrentMonth ? " open" : "");
    header.innerHTML = `<span class="path-chev">▶</span><span class="path-mname">${PATH_MONTH_NAMES[m]}</span><span class="path-mpct">${avgPct}%</span>`;
    const list = document.createElement("div");
    list.className = "path-week-list" + (isCurrentMonth ? " open" : "");
    weeksInMonth.forEach((w) => {
      const pct = pathWeekPct(w);
      const item = document.createElement("div");
      item.className = "path-week-item" + (w.id === pathCurrentWeekId ? " active" : "");
      const dotClass = pct >= 0.95 ? "done" : pct > 0 ? "partial" : "";
      item.innerHTML = `<span class="path-week-dot ${dotClass}"></span>week-${String(w.id).padStart(2, "0")}.md`;
      item.onclick = () => selectPathWeek(w.id);
      list.appendChild(item);
    });
    header.onclick = () => {
      header.classList.toggle("open");
      list.classList.toggle("open");
    };
    block.appendChild(header);
    block.appendChild(list);
    container.appendChild(block);
  }
  document.getElementById("pathOverallPct").textContent = pathOverallPct() + "%";
  document.getElementById("pathOverallFill").style.width = pathOverallPct() + "%";
}

function selectPathWeek(id) {
  pathCurrentWeekId = id;
  renderPathWeek(id);
  buildPathSidebar();
}

function renderPathWeek(id) {
  const w = PATH_WEEKS.find((x) => x.id === id);
  const p = state.pathProgress[id];

  document.getElementById("pathTabbar").innerHTML =
    `<span>english-path</span><span>/</span><span>month-${String(w.month).padStart(2, "0")}</span><span>/</span><span class="path-tag">week-${String(w.id).padStart(2, "0")}.md</span>`;

  const c = document.getElementById("pathContent");
  c.innerHTML = `
    <h1 class="path-week-title">Semana ${w.id}: ${w.title}</h1>
    <p class="path-week-focus">${w.focus}</p>

    <section class="path-section">
      <p class="path-section-label">vocabulario — toca cada tarjeta para revelar</p>
      <div class="path-vocab-grid" id="pathVocabGrid"></div>
    </section>

    <section class="path-section">
      <p class="path-section-label">quiz — gramática y vocabulario</p>
      <div id="pathQuizArea"></div>
      <div class="row-buttons">
        <button class="primary" id="pathCheckQuizBtn">▶ ejecutar tests</button>
        <span class="path-saved-tag" id="pathQuizSavedTag">${
          p.quizScore !== null ? "último resultado: " + p.quizScore + "/" + p.quizTotal : ""
        }</span>
      </div>
      <div class="quiz-terminal" id="pathTerminal">$ esperando ejecución de quiz...</div>
    </section>

    <section class="path-section">
      <p class="path-section-label">writing</p>
      <div class="path-prompt-box">${w.prompt}</div>
      <textarea class="path-textarea" id="pathWritingArea" placeholder="Escribe tu respuesta aquí...">${
        p.writing || ""
      }</textarea>
      <div class="row-buttons">
        <button class="secondary" id="pathSaveWritingBtn">guardar borrador</button>
        <span class="path-saved-tag" id="pathWritingSavedTag"></span>
      </div>
    </section>

    <section class="path-section">
      <p class="path-section-label">checklist semanal — ciclo de 7 días</p>
      <div class="path-checklist" id="pathChecklistArea"></div>
    </section>
  `;

  const vocabGrid = document.getElementById("pathVocabGrid");
  w.vocab.forEach((v) => {
    const card = document.createElement("div");
    card.className = "path-flash";
    card.innerHTML = `<div class="path-en">${v[0]}</div><div class="path-es">${v[1]}</div><div class="path-ex">"${v[2]}"</div><div class="path-hint">toca para ver traducción</div>`;
    card.onclick = () => card.classList.toggle("flipped");
    vocabGrid.appendChild(card);
  });

  const quizArea = document.getElementById("pathQuizArea");
  w.quiz.forEach((q, qi) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-q";
    let optsHtml = "";
    q.opts.forEach((o, oi) => {
      optsHtml += `<label class="quiz-opt" data-qi="${qi}" data-oi="${oi}"><input type="radio" name="pathq${qi}" value="${oi}"> ${o}</label>`;
    });
    qDiv.innerHTML = `<p>${qi + 1}. ${q.q}</p>${optsHtml}`;
    quizArea.appendChild(qDiv);
  });

  document.getElementById("pathCheckQuizBtn").onclick = async () => {
    let correct = 0;
    const lines = [];
    w.quiz.forEach((q, qi) => {
      const selected = document.querySelector(`input[name="pathq${qi}"]:checked`);
      const opts = document.querySelectorAll(`.quiz-opt[data-qi="${qi}"]`);
      opts.forEach((o) => o.classList.remove("correct", "wrong"));
      if (selected) {
        const oi = parseInt(selected.value);
        const optEl = document.querySelector(`.quiz-opt[data-qi="${qi}"][data-oi="${oi}"]`);
        const isCorrect = oi === q.c;
        if (isCorrect) {
          correct++;
          optEl.classList.add("correct");
          lines.push(`✓ Q${qi + 1} passed`);
        } else {
          optEl.classList.add("wrong");
          document.querySelector(`.quiz-opt[data-qi="${qi}"][data-oi="${q.c}"]`).classList.add("correct");
          lines.push(`✗ Q${qi + 1} failed — correcta: "${q.opts[q.c]}"`);
        }
        logAttempt("Grammar", w.title, isCorrect, !isCorrect ? { question: q.q, wrong: q.opts[oi], correct: q.opts[q.c] } : null);
      } else {
        lines.push(`⚠ Q${qi + 1} sin responder`);
      }
    });
    const term = document.getElementById("pathTerminal");
    term.innerHTML =
      `$ run week-${String(w.id).padStart(2, "0")} quiz\n` +
      lines.map((l) => (l.startsWith("✗") || l.startsWith("⚠") ? `<span class="quiz-err">${l}</span>` : l)).join("\n") +
      `\n<span class="quiz-info">${correct}/${w.quiz.length} tests passed</span>`;
    p.quizScore = correct;
    p.quizTotal = w.quiz.length;
    document.getElementById("pathQuizSavedTag").textContent = `último resultado: ${correct}/${w.quiz.length}`;
    await saveState();
    buildPathSidebar();
  };

  document.getElementById("pathSaveWritingBtn").onclick = async () => {
    p.writing = document.getElementById("pathWritingArea").value;
    await saveState();
    const tag = document.getElementById("pathWritingSavedTag");
    tag.textContent = "guardado ✓";
    buildPathSidebar();
    setTimeout(() => {
      if (tag) tag.textContent = "";
    }, 2500);
  };

  const checklistArea = document.getElementById("pathChecklistArea");
  checklistArea.innerHTML = "";
  PATH_DAYS.forEach((d, i) => {
    const chip = document.createElement("div");
    chip.className = "path-day-chip" + (p.checklist[i] ? " checked" : "");
    chip.title = PATH_DAY_NAMES[i];
    chip.innerHTML = `<span class="path-dname">${d}</span><span class="path-box">${p.checklist[i] ? "✓" : ""}</span>`;
    chip.onclick = async () => {
      p.checklist[i] = !p.checklist[i];
      await saveState();
      renderPathWeek(id);
      buildPathSidebar();
    };
    checklistArea.appendChild(chip);
  });
}

function initPath() {
  const panel = document.getElementById("tab-path");
  if (panel.dataset.rendered) return;
  panel.dataset.rendered = "1";
  ensurePathProgress();
  buildPathSidebar();
  renderPathWeek(pathCurrentWeekId);
}
