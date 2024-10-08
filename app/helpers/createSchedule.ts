export const sendToOpenAI = async (scheduleData: object): Promise<object> => {
  const openAIKey = process.env.EXPO_PUBLIC_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              Você é um assistente que cria cronogramas de estudos. Use a estrutura de resposta:
              {
                schedule: [
                  {
                    day: "nome_do_dia",
                    studySessions: [
                      { subject: "nome_da_materia", startTime: "hora_inicio", endTime: "hora_fim" },
                      { subject: "nome_da_materia", startTime: "hora_inicio", endTime: "hora_fim" }
                    ]
                  }
                ],
                notes: "observações"
              }.
              Certifique-se de que os horários estão equilibrados e respeitam as preferências fornecidas.
              Se a data de inicio e data de fim são iguais para o dia, então o dia é um dia de folga. 
              Use o campo de notes para fornecer informações que possam ser uteis para o usuário.
              Responda estritamente com JSON válido, sem nenhum texto adicional fora da estrutura JSON.
              O nome_do_dia deve sempre ser escrito em português e com a primeira letra maiúscula.
            `,
          },
          {
            role: "user",
            content: `Aqui estão os dados para o cronograma: ${JSON.stringify(
              scheduleData
            )}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error when trying to reach OpenAI:", error);
    throw new Error("error when trying to reach OpenAI:");
  }
};
