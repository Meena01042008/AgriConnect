package in.agriconnect;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    private final RestClient client = RestClient.create();

    @GetMapping
    public Map<String,Object> weather(@RequestParam(defaultValue="Chennai") String city) {
        String safeCity = city == null ? "Chennai" : city.trim();
        if (safeCity.isBlank() || safeCity.length()>100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter a valid city or district name.");
        try {
            String geoUrl = UriComponentsBuilder.fromHttpUrl("https://geocoding-api.open-meteo.com/v1/search")
                    .queryParam("name", safeCity).queryParam("count",1).queryParam("language","en").queryParam("format","json").build().encode().toUriString();
            Map<?,?> geo = client.get().uri(geoUrl).retrieve().body(Map.class);
            List<?> results = geo == null || !geo.containsKey("results") ? List.of() : (List<?>)geo.get("results");
            if (results.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Could not find that place. Try a nearby city or district.");
            Map<?,?> place = (Map<?,?>)results.get(0);
            double lat = ((Number)place.get("latitude")).doubleValue(), lon = ((Number)place.get("longitude")).doubleValue();
            String forecastUrl = UriComponentsBuilder.fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                    .queryParam("latitude",lat).queryParam("longitude",lon)
                    .queryParam("current","temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m")
                    .queryParam("daily","temperature_2m_max,temperature_2m_min,precipitation_probability_max")
                    .queryParam("timezone","auto").queryParam("forecast_days",3).build().encode().toUriString();
            Map<?,?> forecast = client.get().uri(forecastUrl).retrieve().body(Map.class);
            Map<String,Object> out = new LinkedHashMap<>();
            out.put("city", place.containsKey("name") ? place.get("name") : safeCity); out.put("region", place.containsKey("admin1") ? place.get("admin1") : "");
            out.put("country", place.containsKey("country") ? place.get("country") : ""); out.put("current", forecast == null || !forecast.containsKey("current") ? Map.of() : forecast.get("current"));
            out.put("daily", forecast == null || !forecast.containsKey("daily") ? Map.of() : forecast.get("daily"));
            out.put("source", "Open-Meteo"); out.put("mode", "LIVE");
            out.put("notice", "Weather data is a forecast, not a guarantee. Check local alerts before farm operations.");
            return out;
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Live weather service is temporarily unavailable. Check your internet connection and try again."); }
    }
}
