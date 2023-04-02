import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";
import { BasicCard, MagicCard } from "./Card";

export async function MakeOpenAIChatComletionRequest(apiKey:string, userPrompt:string, systemPrompt:string, temperature:number = 1, model:string = "gpt-3.5-turbo") : Promise<string> {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: model,
    messages: [{role: "user", content: userPrompt},
                {role:"system", content: systemPrompt}],
    temperature: temperature
  });

  if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
  } else {
      console.log(response)
      throw "Error: Invalid response from OpenAI.crateChatComletion. See console.log for more details."
  }
}

export async function MakeOpenAIImageCreateRequest(apiKey:string, imagePrompt:string) : Promise<string> {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  let response = await openai.createImage({
    prompt: imagePrompt,
    n: 1,
    size: CreateImageRequestSizeEnum._256x256,
  });

  if (response.data && response.data.data && response.data.data[0] && response.data.data[0].url) {
      return response.data.data[0].url
  } else {
      console.log(response)
      throw "Error: Invalid response from OpenAI.createImage. See console.log for more details."
  }
}

export async function GenerateMagicCardRequest(userPrompt: string): Promise<MagicCard[]> {
  const url: string = 'http://localhost:7071/api/GenerateMagicCard';

  const params: Record<string, string> = {
    userPrompt: userPrompt
  };

  let cards:BasicCard[] = []
  await httpGet(url, params)
    .then(data => {
      cards = JSON.parse(data).cards;
    })
    .catch(error => {
      console.error('There was an error generating card JSON:', error);
      throw error
    });

    return cards.map(card => new MagicCard(card));
}

async function httpGet(url: string, params?: Record<string, string>): Promise<any> {
  const sanitizedParams: Record<string, string> = {};
  if (params) {
    Object.keys(params).forEach((key) => {
      //sanitizedParams[key] = encodeURIComponent(params[key]);
      sanitizedParams[key] = params[key];
    });
  }

  const queryParams = new URLSearchParams(sanitizedParams).toString();
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
