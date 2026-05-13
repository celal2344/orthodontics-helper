FROM golang:1.23-alpine AS build

WORKDIR /src/apps/api
COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api ./cmd/api

FROM alpine:3.20

RUN adduser -D -g '' appuser
WORKDIR /app
COPY --from=build /out/api /app/api

USER appuser
EXPOSE 8080

CMD ["/app/api", "server"]
