FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --create-home --shell /usr/sbin/nologin aura
COPY --from=build /workspace/target/aura-service.jar app.jar
USER aura
EXPOSE 8091
ENTRYPOINT ["java", "-jar", "app.jar"]
