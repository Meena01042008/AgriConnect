package in.agriconnect;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@RestController
@RequestMapping("/api/market")
public class MarketController {
    @Value("${agriconnect.market.api-key:}") private String apiKey;
    private final RestClient client = RestClient.create();

    @GetMapping("/live")
    public Map<String,Object> live(@RequestParam(defaultValue="Tamil Nadu") String state,
                                   @RequestParam(required=false) String commodity,
                                   @RequestParam(required=false) String district) {
        if (apiKey == null || apiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Live market prices need a data.gov.in API key. Sample prices are not used by this endpoint.");
        try {
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070")
                    .queryParam("api-key", apiKey).queryParam("format", "json").queryParam("limit", 30)
                    .queryParam("filters[state]", state);
            if (commodity != null && !commodity.isBlank()) b.queryParam("filters[commodity]", commodity.trim());
            if (district != null && !district.isBlank()) b.queryParam("filters[district]", district.trim());
            Map<?,?> response = client.get().uri(b.build().encode().toUriString()).retrieve().body(Map.class);
            List<?> records = response == null || !response.containsKey("records") ? List.of() : (List<?>)response.get("records");
            Map<String,Object> out = new LinkedHashMap<>(); out.put("records", records); out.put("count", records.size());
            out.put("source", "data.gov.in / AGMARKNET"); out.put("mode", "LIVE");
            out.put("notice", "Market prices can vary by grade, arrival, and market. Verify with the mandi before selling.");
            return out;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"The market-price source could not be reached. Verify the API key and try again.");
        }
    }
}
