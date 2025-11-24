package com.example.golinks.redirect.api;

import com.example.golinks.core.exception.ResourceNotFoundException;
import com.example.golinks.golink.api.GoLink;
import com.example.golinks.golink.services.GoLinkService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class RedirectController {

    private final GoLinkService service;

    public RedirectController(GoLinkService service) {
        this.service = service;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Void> redirect(@PathVariable String slug, HttpServletRequest request) {
        GoLink goLink = service.findByName(slug);

        String targetUrl = goLink.targetUrl();
        String queryString = request.getQueryString();

        if (queryString != null && !queryString.isEmpty()) {
            if (targetUrl.contains("?")) {
                targetUrl += "&" + queryString;
            } else {
                targetUrl += "?" + queryString;
            }
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(targetUrl))
                .build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>GoLink Not Found</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding-top: 50px; background-color: #f9fafb; color: #1f2937; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                        h1 { color: #dc2626; margin-bottom: 10px; }
                        p { margin-bottom: 20px; color: #4b5563; }
                        a { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; }
                        a:hover { background-color: #1d4ed8; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>404 - GoLink Not Found</h1>
                        <p>The requested GoLink does not exist.</p>
                        <a href="/">Go to Dashboard</a>
                    </div>
                </body>
                </html>
                """;
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }
}
