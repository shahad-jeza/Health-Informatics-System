# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# Copy project and restore
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Use the ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

# Copy published app and SQLite DB
COPY --from=build /app/out ./
COPY Backend/HISBackend/hisbackend.db ./hisbackend.db

# Expose port
EXPOSE 80

# Start the app
ENTRYPOINT ["dotnet", "HISBackend.dll"]



