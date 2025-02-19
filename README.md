# Magic: The Gathering Card Generator

## [https://www.mtgcardgenerator.com](https://www.mtgcardgenerator.com/)
The Magic: The Gathering Card Generator is a project that uses AI (particuarlly, OpenAI's offerings) to generate realistic Magic: The Gathering cards. Generated cards are rendered beautifully using CSS.

Users can enter a prompt describing the type of Magic card they would like to generate, and the response will be a be a rendered image of a realistic card that matches the prompt. Here is an example card generation:

<p align="center">
  <img src="cards\gpt-generator.png" width="480px" height="700px">
</p> 

# Features

* User's supply an open ended prompt describing the Magic card they'd like to see. User's may choose the AI model (GPT 3.5, GPT 4 etc.) and optionally choose to have the AI's reasoning included, too.

* Generated cards are rendered beautifully using CSS and designed to look like real Magic cards. Realistic card background and symbols are used, and card text is scaled appropriately to fill the content.

* High quality images may optionally be generated using dall-e-3 iterative prompt approach.

* User's may optionally login (via an SSO provider) to have their card generation history stored for viewing later.

# Development Guide

This section gives an overview for how to contribute to this project.

## Components

There are two components to this project: 
1. An Azure, C# back end which is an Azure function API built on top of other Azure resources (Cosmos DB, Blob storage).
    * The backend API generates cards based on a prompt and an image based on the card text. A simple, stupid, rules engine is implemented to fix common problems on generated cards.
    * [Azure B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/overview) is used as the SSO provider for the login experience.
    * If the user is logged on, a history is stored for the user so generated cards can be viewed later.
2. A React, Typescript single-page application (SPA). The front end allows the user to login, enter a prompt and then renders the generated card on the page once the API response is received.

## Build & Run the Backend

1. Open `api\MTG.CardGenerator.sln` in Visual Studio 2022 and build the solution. 

2. Add a `local.settings.json` inside the `MTG.CardGenerator` project:

```
{
  "IsEncrypted": false,
  "Host": {
    "CORS": "http://localhost:8080",
    "CORSCredentials": true
  },
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet",
    // OpenAI settings.
    "OPENAI_API_KEY": "",
    // Bearer token validation settings.
    "ValidateBearerToken": false,
    "ValidJWTAuthority": "https://mtgcardgenerator.b2clogin.com/mtgcardgenerator.onmicrosoft.com/B2C_1_signup_signin",
    "ValidJWTAudience": "1cc495e4-bd18-4bed-9c18-857689172c50",
    "ValidJWTIssuer": "https://mtgcardgenerator.b2clogin.com/e856e196-1342-4533-b8a6-0e5a50bf6a67/v2.0/",
    // Database settings.
    "CosmosDBEndpointUrl": "",
    "CosmosDBAccessKey": "",
    "CosmosDBDatabaseId": "",
    // Blob storage settings.
    "BlobStorageName": "",
    "BlobStorageEndpoint": "",
    "BlobStorageContainerName": "card-images",
    "BlobStorageAccessKey": ""
  }
}
```

You will need to fill in the missing values which include supplying an Open AI API key, an Azure Cosmos DB, and an Azure Blob storage. Set `ValidateBearerToken` to false to skip any API authentication when running the Azure function emulator locally (per function authorization is implemented). Or, you may utilize the [Azure B2C instance]((https://learn.microsoft.com/en-us/azure/active-directory-b2c/overview)) that has been set up for this website with the values provided above to test the login experience.

3. Start the `MTG.CardGenerator` project to launch the Azure function emulator over local host.

## Build & Run the Frontend

From the root of the repository, install depenencies and start the local web server:
```
npm install
npm run dev
```

Navigate to `http://localhost:8080/` in your browser. VS Code launch configurations are provided to easily enable debugging.

## Deployment

This application is deployed entirely within a personal Azure subscription. Pushing to the `main` or `development` branch will trigger [GitHub actions](https://github.com/forrestcoward/MTG-Card-Generator/actions) which perform deployments into Azure updating the resources shown below:

| Branch | Azure Static Web App SPA  | Azure Function |
|---|---|---|
| `main` | https://www.mtgcardgenerator.com/ <br /> https://ambitious-meadow-0e2e9ce0f.3.azurestaticapps.net/ | https://mtgcardgenerator.azurewebsites.net |
| `development` | https://ambitious-meadow-0e2e9ce0f-development.eastus2.3.azurestaticapps.net/ | https://mtgcardgenerator-development.azurewebsites.net |

All other resources required to make the website work are already deployed and configured in Azure.

Deployments should take only a few minutes.

If you are serious about helping with development, we can discuss gaining limited access to the underlying Azure resources for better testing, but most development and testing has been designed to happen locally.

# Links

* [Max Woolf's blog on using ChatGPT to generate MTG cards](https://minimaxir.com/2023/03/new-chatgpt-overlord/)
* [Make a Magic: The Gathering card in CSS](https://codeburst.io/make-a-magic-the-gathering-card-in-css-5e4e06a5e604)
* [Magic: the Gathering font project](https://github.com/andrewgioia/mana)
