# syntax=docker/dockerfile:1.6

# -------- Build stage --------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests package

# -------- Runtime stage --------
FROM eclipse-temurin:21-jre
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
