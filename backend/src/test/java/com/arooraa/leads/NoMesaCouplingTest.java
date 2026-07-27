package com.arooraa.leads;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Guards against accidental coupling to the separate MESA/RestaurantMenuApp backend.
 * "MESA" itself is a legitimate product name in user-facing copy (e.g. the demo-request
 * confirmation message), so this checks for concrete infrastructure coupling rather than
 * banning the word outright.
 */
class NoMesaCouplingTest {

    private static final List<String> FORBIDDEN_SUBSTRINGS = List.of(
            "restaurantmenuapp",
            "restaurant-menu-app",
            "restaurant_menu_app",
            "mesa_db",
            "mesa-db",
            "mesadatabase"
    );

    private static final Path PROJECT_ROOT = Path.of("").toAbsolutePath();

    @Test
    void sourceAndConfigFilesDoNotReferenceMesaInfrastructure() throws IOException {
        List<Path> filesToScan = Stream.concat(
                        Files.walk(PROJECT_ROOT.resolve("src/main")),
                        Stream.of("pom.xml", "docker-compose.yml", "Dockerfile", ".env.example")
                                .map(PROJECT_ROOT::resolve))
                .filter(Files::isRegularFile)
                .toList();

        for (Path file : filesToScan) {
            String content = Files.readString(file).toLowerCase(Locale.ROOT);
            for (String forbidden : FORBIDDEN_SUBSTRINGS) {
                assertTrue(!content.contains(forbidden),
                        "File " + file + " references MESA infrastructure via '" + forbidden + "'");
            }
        }
    }

    @Test
    void pomHasNoMesaOrRestaurantMenuAppDependency() throws IOException {
        String pomContent = Files.readString(PROJECT_ROOT.resolve("pom.xml")).toLowerCase(Locale.ROOT);
        assertTrue(!pomContent.contains("<groupid>com.mesa"), "pom.xml must not depend on a MESA groupId");
        assertTrue(!pomContent.contains("restaurantmenuapp"), "pom.xml must not depend on RestaurantMenuApp");
    }
}
