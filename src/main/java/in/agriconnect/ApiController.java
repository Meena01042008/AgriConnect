package in.agriconnect;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    @Value("${agriconnect.ai.api-key:}")
    private String apiKey;

    @Value("${agriconnect.ai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${agriconnect.ai.model:gpt-4o-mini}")
    private String model;

    private final RestClient client = RestClient.create();
    private final JdbcTemplate jdbcTemplate;

    public ApiController(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Value("${agriconnect.market.api-key:}")
    private String marketApiKey;

    @GetMapping("/status")
    public Map<String, Object> status() {
        boolean dbConnected = false;
        try { jdbcTemplate.queryForObject("SELECT 1", Integer.class); dbConnected = true; } catch (Exception ignored) { }
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("app", "AgriConnect"); out.put("status", "running");
        out.put("aiConfigured", apiKey != null && !apiKey.isBlank());
        out.put("marketConfigured", marketApiKey != null && !marketApiKey.isBlank());
        out.put("databaseConnected", dbConnected);
        out.put("weatherMode", "Open-Meteo live API");
        out.put("diseaseModelConfigured", false);
        out.put("samplePricesOnly", true);
        return out;
    }

    @GetMapping("/market")
    public List<Map<String, Object>> market() {
        return List.of(
            Map.of("crop","Tomato","market","Koyambedu (sample)","price",2400,"unit","₹/quintal","updated","Sample record"),
            Map.of("crop","Paddy","market","Thanjavur (sample)","price",2183,"unit","₹/quintal","updated","Sample record"),
            Map.of("crop","Onion","market","Chennai (sample)","price",1800,"unit","₹/quintal","updated","Sample record"),
            Map.of("crop","Groundnut","market","Villupuram (sample)","price",6200,"unit","₹/quintal","updated","Sample record")
        );
    }

    @PostMapping("/recommend")
    public Map<String, Object> recommend(@RequestBody Map<String, String> input) {
        String soil = input.getOrDefault("soil", "loamy");
        String water = input.getOrDefault("water", "medium");
        String season = input.getOrDefault("season", "monsoon");
        List<String> crops = new ArrayList<>();
        String why;
        if (water.equalsIgnoreCase("low")) {
            crops = List.of("Pearl millet", "Green gram", "Groundnut");
            why = "These crops can be considered where water availability is limited, depending on local soil and season.";
        } else if (soil.toLowerCase().contains("clay")) {
            crops = List.of("Paddy", "Black gram", "Sesame");
            why = "These are starting points for clay-rich soils; drainage and local season still matter.";
        } else if (season.equalsIgnoreCase("winter")) {
            crops = List.of("Tomato", "Chickpea", "Leafy greens");
            why = "These are general options for some winter conditions; confirm local suitability.";
        } else {
            crops = List.of("Groundnut", "Paddy", "Tomato");
            why = "These are illustrative options based on the limited inputs provided.";
        }
        return Map.of("crops", crops, "reason", why,
                "notice", "Preliminary suggestions only. Check local agricultural guidance and soil-test results before planting.");
    }

    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, Object> body) {
        String question = String.valueOf(body.getOrDefault("message", "")).trim();
        String language = String.valueOf(body.getOrDefault("language", "English"));
        if (question.isBlank()) return Map.of("answer", "Please type a question first.");
        if (apiKey == null || apiKey.isBlank()) {
            String q = question.toLowerCase(Locale.ROOT);
            boolean tamil = language.equalsIgnoreCase("தமிழ்") || language.toLowerCase(Locale.ROOT).contains("tamil");
            String answer;
            if (tamil) {
                if (q.contains("நோய்") || q.contains("இலை") || q.contains("leaf") || q.contains("disease") || q.contains("yellow") || q.contains("spot")) {
                    answer = "இது உள்ளூர் வழிகாட்டல்; உறுதியான நோய் கண்டறிதல் அல்ல. இலை மேல்/கீழ் பக்கத்தின் தெளிவான படத்தை எடு; சிகிச்சைக்கு முன் அருகிலுள்ள வேளாண்மை அலுவலரிடம் உறுதிப்படுத்து. AI image analysis-க்கு AGRICONNECT_AI_API_KEY அமைக்க வேண்டும்.";
                } else if (q.contains("செலவு") || q.contains("லாப") || q.contains("profit") || q.contains("expense") || q.contains("revenue")) {
                    answer = "லாபத்தின் ஆரம்ப கணக்கு: மொத்த வருவாய் − மொத்த செலவுகள். விதை, உரம், கூலி, நீர்ப்பாசனம், போக்குவரத்து போன்ற செலவுகளையும் பதிவு செய். Farm finances பகுதியில் எண்களை உள்ளிடலாம். இது நேரடி AI பதில் அல்ல.";
                } else if (q.contains("தண்ணீர்") || q.contains("நீர்") || q.contains("water") || q.contains("crop") || q.contains("பயிர்")) {
                    answer = "பயிரைத் தேர்வு செய்ய மண் வகை, பருவம், நீர் கிடைக்கும் அளவு, உள்ளூர் சந்தை ஆகியவற்றைப் பார்க்க வேண்டும். Crop advisor பகுதியில் விவரங்களை உள்ளிட்டு ஆரம்ப பரிந்துரையைப் பெறு; விதைப்பதற்கு முன் உள்ளூர் வேளாண்மை ஆலோசனையை உறுதிப்படுத்து. இது API key இல்லாத வழிகாட்டல்.";
                } else {
                    answer = "உன் கேள்வியைப் பெற்றேன். OpenAI API key அமைக்கப்படாததால் நேரடி AI பதில் உருவாக்க முடியவில்லை. பயிர் தேர்வுக்கு Crop advisor, செலவுக் கணக்குக்கு Farm finances பயன்படுத்தலாம். API key அமைத்து app-ஐ restart செய்தால் live chatbot இயங்கும்.";
                }
            } else {
                if (q.contains("disease") || q.contains("leaf") || q.contains("yellow") || q.contains("spot")) {
                    answer = "This is local fallback guidance, not a diagnosis. I can't confirm a leaf disease without image analysis. Photograph both sides of the leaf in clear light and ask a local agriculture officer before treatment. Configure AGRICONNECT_AI_API_KEY to enable image analysis.";
                } else if (q.contains("profit") || q.contains("expense") || q.contains("revenue") || q.contains("cost")) {
                    answer = "A basic profit estimate is total revenue minus total expenses. Record seeds, fertilizer, labour, irrigation, transport, and other costs. Use Farm finances to enter your numbers. This is local fallback guidance, not a live AI answer.";
                } else if (q.contains("water") || q.contains("crop") || q.contains("soil") || q.contains("season")) {
                    answer = "Crop choice depends on soil, season, water availability, and local markets. Use Crop advisor for a preliminary suggestion, then confirm locally before planting. This is local fallback guidance; live AI requires AGRICONNECT_AI_API_KEY.";
                } else {
                    answer = "I received your question, but a live AI response is unavailable because AGRICONNECT_AI_API_KEY is not configured. You can still use Crop advisor and Farm finances. Configure the key and restart the app to enable live AI.";
                }
            }
            return Map.of("answer", answer, "mode", "LOCAL_FALLBACK", "aiConfigured", false);
        }
        try {
            Map<String, Object> payload = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role","system","content","You are AgriConnect, a careful multilingual farming and general-purpose assistant. Reply in the user's requested language: " + language + ". Answer broad questions helpfully, ask clarifying questions when needed, distinguish uncertainty, never invent live weather or market prices, and advise local agricultural expert confirmation for uncertain crop disease or pesticide matters."),
                    Map.of("role","user","content",question)
                ),
                "temperature", 0.4
            );
            Map response = client.post().uri(baseUrl + "/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(payload).retrieve().body(Map.class);
            List choices = (List) response.get("choices");
            Map first = (Map) choices.get(0);
            Map message = (Map) first.get("message");
            return Map.of("answer", String.valueOf(message.get("content")), "mode", "LIVE_AI");
        } catch (Exception ex) {
            return Map.of("answer", "AI service could not be reached. Check the API key, internet connection, and provider settings, then try again.", "mode", "API_ERROR");
        }
    }

    @PostMapping("/expenses/calculate")
    public Map<String, Object> calculate(@RequestBody Map<String, Object> body) {
        double expenses = number(body.get("expenses"));
        double revenue = number(body.get("revenue"));
        return Map.of("expenses", expenses, "revenue", revenue, "profit", revenue - expenses,
                "note", "Estimate based on the values you entered.");
    }

    private double number(Object value) {
        try { return Double.parseDouble(String.valueOf(value)); }
        catch (Exception e) { return 0.0; }
    }
}
