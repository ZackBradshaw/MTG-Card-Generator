﻿using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using MTG.CardGenerator.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Threading.Tasks;
using User = MTG.CardGenerator.Models.User;

namespace MTG.CardGenerator
{
    public class CosmosClient
    {
        private static readonly Lazy<Microsoft.Azure.Cosmos.CosmosClient> lazyClient = new(InitializeCosmosClient);
        private static Microsoft.Azure.Cosmos.CosmosClient cosmosClient => lazyClient.Value;

        public string DatabaseId { get; private set; }
        private readonly Database database;

        public string ContainerId { get; private set; }
        private readonly Container container;

        private readonly ILogger log = null;

        public CosmosClient(string databaseId, string containerId, ILogger logger = null)
        {
            DatabaseId = databaseId;
            database = cosmosClient.CreateDatabaseIfNotExistsAsync(DatabaseId).Result;
            ContainerId = containerId;
            container = database.CreateContainerIfNotExistsAsync(ContainerId, "/id").Result;
            log = logger;
        }

        private static Microsoft.Azure.Cosmos.CosmosClient InitializeCosmosClient()
        {
            var endpointUrl = Environment.GetEnvironmentVariable(Constants.CosmosDBEndpointUrl);
            if (string.IsNullOrWhiteSpace(endpointUrl))
            {
                throw new ArgumentException($"Environment variable '{Constants.CosmosDBEndpointUrl}' is not set or empty.");
            }

            var accessKey = Environment.GetEnvironmentVariable(Constants.CosmosDBAccessKey);
            if (string.IsNullOrWhiteSpace(accessKey))
            {
                throw new ArgumentException($"Environment variable '{Constants.CosmosDBAccessKey}' is not set or empty.");
            }

            return new Microsoft.Azure.Cosmos.CosmosClient(endpointUrl, accessKey);
        }

        public async Task AddItemToContainerAsync<T>(T item)
        {
            try
            {
                T response = await container.CreateItemAsync<T>(item);
            }
            catch (CosmosException ce)
            {
                var baseException = ce.GetBaseException();
                log?.LogError($"{ce.StatusCode} error occurred: {ce.Message}, Inner Exception: {baseException.Message}");
            }
            catch (Exception e)
            {
               log?.LogError($"Error: {e.Message}");
            }
        }

        public async Task<List<CardGenerationRecord>> GetMagicCards<MagicCard>(string userSubject, int top = 50)
        {
            var queryDefinition = new QueryDefinitionWrapper(
                    @"SELECT TOP @top *
                    FROM c
                    WHERE c.user.userSubject = @userSubject
                    ORDER BY c._ts DESC")
                .WithParameter("@userSubject", userSubject)
                .WithParameter("@top", top);

            List<CardGenerationRecord> userCards = await QueryCosmosDB<CardGenerationRecord>(queryDefinition.QueryDefinition);
            return userCards;
        }

        public async Task<ItemResponse<User>> UpdateUserRecord(string userSubject, int numberOfNewCards, double cardGenerationEstimatedCost)
        {
            return await PatchDocument<User>(userSubject, userSubject, new List<PatchOperation>
            {
                PatchOperation.Increment("/totalCostOfCardsGenerated", cardGenerationEstimatedCost),
                PatchOperation.Increment("/numberOfCardsGenerated", numberOfNewCards),
                PatchOperation.Add("/lastActiveTime", DateTime.Now.ToUniversalTime())
            });
        }

        public async Task<bool> DocumentExists(string id)
        {
            try
            {
                // Use point read which is the most efficient way to read a single item by its id with retrieving item content.
                ResponseMessage response = await container.ReadItemStreamAsync(id, new PartitionKey(id));
                return response.StatusCode == HttpStatusCode.OK;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        private async Task<ItemResponse<T>> PatchDocument<T>(string id, string partitionkey, List<PatchOperation> patches)
        {
            return await container.PatchItemAsync<T>(id, new PartitionKey(partitionkey), patches);
        }

        private async Task<List<T>> QueryCosmosDB<T>(QueryDefinition query, int batchNumber = 0, bool throwIfNoResults = false, string queryName = "", bool verbose = false, ILogger log = null)
        {
            var watch = Stopwatch.StartNew();
            if (verbose)
            {
                log?.LogInformation($"Running query {query.QueryText}", queryName, batchNumber, verbose);
            }

            double totalCharge = 0;
            var results = new List<T>();
            try
            {
                var queryOptions = new QueryRequestOptions
                {
                    // Turn on to view index usage and recommended indices by Cosmos.
                    PopulateIndexMetrics = false,
                    MaxItemCount = 5000
                };

                var resultSetIterator = container.GetItemQueryIterator<T>(query, continuationToken: null, requestOptions: queryOptions);
                while (resultSetIterator.HasMoreResults)
                {
                    FeedResponse<T> response = await resultSetIterator.ReadNextAsync().ConfigureAwait(true);
                    results.AddRange(response);

                    if (verbose)
                    {
                        log?.LogInformation($"Iterated {response.Count} new records. Request Charge: {response.RequestCharge}", queryName, batchNumber, verbose);
                    }
                    totalCharge += response.RequestCharge;

                    if (verbose && resultSetIterator.HasMoreResults && !string.IsNullOrWhiteSpace(response.IndexMetrics))
                    {
                        // Very verbose, keep off for now unless needed.
                        log.LogInformation(response.IndexMetrics, queryName, batchNumber, verbose);
                    }
                }
            }
            catch (Exception e)
            {
                log?.LogError(e.ToString());
                throw;
            }

            if (results.Count == 0 && throwIfNoResults)
            {
                var errorMessage = $"No results on {container.Id} for the given query: {query.QueryText}";
                var subActivity = 0;
                var charge = 0;
                throw new CosmosException(errorMessage, HttpStatusCode.NotFound, subActivity, container.Id, charge);
            }

            if (verbose)
            {
                log?.LogInformation($"Query completed in {watch.Elapsed} and had {results.Count} results. Total charge: {totalCharge}");
            }

            return results;
        }
    }
}
