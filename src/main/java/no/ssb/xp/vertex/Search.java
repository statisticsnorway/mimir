package no.ssb.xp.vertex;

import com.google.cloud.discoveryengine.v1.SearchRequest;
import com.google.cloud.discoveryengine.v1.SearchResponse;
import com.google.cloud.discoveryengine.v1.SearchServiceClient;
import com.google.cloud.discoveryengine.v1.SearchServiceSettings;
import com.google.cloud.discoveryengine.v1.ServingConfigName;
import java.io.IOException;
import java.util.concurrent.ExecutionException;

public class Search {
  public void run() throws IOException, ExecutionException {

    System.out.println();
    // TODO(developer): Replace these variables before running the sample.
    // Project ID or project number of the Cloud project you want to use.
    String projectId = "ssbno-t-lf";
    // Location of the data store. Options: "global", "us", "eu"
    String location = "eu";
    // Collection containing the data store.
    String collectionId = "ssbno-search-no_1713449390194";
    // Data store ID.
    String dataStoreId = "ssbno-no_1713449458710";
    // Serving configuration. Options: "default_search"
    String servingConfigId = "default_search";
    // Search Query for the data store.
    String searchQuery = "Konsumpris";
    search(projectId, location, collectionId, dataStoreId, servingConfigId, searchQuery);
  }

  /** Performs a search on a given datastore. */
  public static void search(
      String projectId,
      String location,
      String collectionId,
      String dataStoreId,
      String servingConfigId,
      String searchQuery)
      throws IOException, ExecutionException {
    // For more information, refer to:
    // https://cloud.google.com/generative-ai-app-builder/docs/locations#specify_a_multi-region_for_your_data_store
    String endpoint = "eu-discoveryengine.googleapis.com:443";
    SearchServiceSettings settings =
        SearchServiceSettings.newBuilder().setEndpoint(endpoint).build();
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the `searchServiceClient.close()` method on the client to safely
    // clean up any remaining background resources.
    try (SearchServiceClient searchServiceClient = SearchServiceClient.create(settings)) {
      SearchRequest request =
          SearchRequest.newBuilder()
              .setServingConfig(
                  ServingConfigName.formatProjectLocationCollectionDataStoreServingConfigName(
                      projectId, location, collectionId, dataStoreId, servingConfigId))
              .setQuery(searchQuery)
              .setPageSize(10)
              .build();
      SearchResponse response = searchServiceClient.search(request).getPage().getResponse();
      for (SearchResponse.SearchResult element : response.getResultsList()) {
        System.out.println("Response content: " + element);
      }
    }
  }
}
