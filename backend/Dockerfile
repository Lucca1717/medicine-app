

FROM eclipse-temurin:25-jdk AS builder

WORKDIR /workspace

COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src src

RUN ./mvnw clean package

FROM eclipse-temurin:25-jre

WORKDIR /application

COPY --from=builder /workspace/target/medicine-manager-backend*.jar app.jar
ENTRYPOINT ["java", "-jar", "/application/app.jar"]
EXPOSE 8080