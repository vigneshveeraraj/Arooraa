FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --create-home --shell /usr/sbin/nologin arooraa
COPY --from=build /workspace/target/lead-service.jar app.jar
USER arooraa
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
