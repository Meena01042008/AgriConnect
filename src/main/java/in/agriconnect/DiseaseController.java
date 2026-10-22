
package in.agriconnect;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/disease")
public class DiseaseController {

    private static final Logger log =
            LoggerFactory.getLogger(DiseaseController.class);

    @Value("${agriconnect.ml.url:http://127.0.0.1:5001}")
    private String mlUrl;

    private final RestClient client = RestClient.create();

    @PostMapping(
        value = "/analyze",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> analyze(
            @RequestPart("image") MultipartFile image,
            @RequestParam(defaultValue = "English") String language) {

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Choose a leaf image first."
            );
        }

        if (image.getSize() > 8L * 1024 * 1024) {
            throw new ResponseStatusException(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Image must be 8 MB or smaller."
            );
        }

        String type = image.getContentType();

        if (type == null ||
            !Set.of("image/jpeg", "image/png", "image/webp")
                .contains(type.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only JPG, PNG, and WEBP images are supported."
            );
        }

        try {
            byte[] imageBytes = image.getBytes();

            MultipartBodyBuilder builder =
                    new MultipartBodyBuilder();

            ByteArrayResource resource =
                    new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    String filename = image.getOriginalFilename();
                    return filename != null
                            ? filename
                            : "leaf-image.jpg";
                }
            };

            builder.part("image", resource)
                    .contentType(MediaType.parseMediaType(type));

            Map<String, Object> result = client.post()
                    .uri(mlUrl + "/predict")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(builder.build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<
                            Map<String, Object>>() {});

            if (result == null ||
                !"success".equals(result.get("status"))) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "The plant disease ML service returned no valid prediction."
                );
            }

            return Map.of(
                "analysis", String.valueOf(result.get("analysis")),
                "predictedClass", result.get("predictedClass"),
                "confidence", result.get("confidence"),
                "status", "success",
                "mode", "LOCAL_ML",
                "notice",
                "This is a preliminary ML prediction. Confirm with a local agricultural expert before treatment.",
                "imageSentToExternalProvider", false
            );

        } catch (ResponseStatusException e) {
            throw e;

        } catch (IOException e) {
            log.error("Could not read uploaded plant image", e);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Could not read the uploaded image."
            );

        } catch (RestClientException e) {
            log.error(
                "Plant disease ML request failed. URL: {}",
                mlUrl,
                e
            );

            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Cannot connect to the local ML service. Check the backend logs."
            );

        } catch (Exception e) {
            log.error(
                "Unexpected error during plant disease analysis",
                e
            );

            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Plant disease analysis failed. Check the backend logs."
            );
        }
    }
}
