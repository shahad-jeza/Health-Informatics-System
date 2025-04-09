# Build stage (uses nightly build for 9.0)
FROM mcr.microsoft.com/dotnet/nightly/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/nightly/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://*:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "HISBackend.dll"]