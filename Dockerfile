FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env
RUN apt-get update && apt-get install -y

WORKDIR /marketplace

COPY ./polkadot_api_dotnet ./polkadot_api_dotnet
COPY . .

RUN dotnet publish ./Marketplace.Backend.csproj -c Debug -o ./publish

FROM mcr.microsoft.com/dotnet/aspnet:5.0
RUN apt-get update && apt-get install -y

WORKDIR /marketplace

COPY --from=build-env /marketplace/publish .

CMD ["dotnet", "Marketplace.Backend.dll"]