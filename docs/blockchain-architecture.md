# 📚 Documentação Técnica – prediq.fun Blockchain Architecture
## Versão 0.1 – Foco nos blocos 1️⃣ Contratos, 2️⃣ CLOB e 3️⃣ Oráculo UMA

---

## 1️⃣ **Contratos On-chain (Conditional Tokens & Market Factory)**

### 🔹 Objetivo
Permitir a criação de mercados de previsão com múltiplos resultados, baseados em **eventos resolvidos por oráculo otimista** (UMA Oracle).

### 🔹 Abordagem Técnica

- Utilizar _ERC20 Conditional Tokens_ (semelhante à arquitetura do [Gnosis Conditional Tokens](https://docs.gnosischain.com/conditional-tokens/) ou variantes open source compatíveis).
- Cada mercado possui:
  - **Contract MarketFactory** → cria novos mercados
  - **Contratos de Position Tokens (ERC1155 ou ERC20 wrapper)**
  - **Contract MarketManager** → controla abertura, resolução e liquidação com base no resultado do oráculo
- Suporte para múltiplos resultados (`YES / NO / VOID` ou múltiplas alternativas)

### 🔹 Exemplo de estrutura

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract MarketFactory {
  mapping(address => bool) public markets;
  uint256 public marketCount;
  
  event MarketCreated(address indexed market, string question, bytes32 identifier);
  
  function createMarket(
    string memory question,
    bytes32 identifier,
    uint256 reward,
    uint256 fee
  ) external returns(address market) {
    Market newMarket = new Market(question, identifier, reward, fee, msg.sender);
    markets[address(newMarket)] = true;
    marketCount++;
    
    emit MarketCreated(address(newMarket), question, identifier);
    return address(newMarket);
  }
}

contract Market {
  enum Status { Open, Closed, Resolved }
  enum Outcome { Yes, No, Void }
  
  Status public status;
  Outcome public finalOutcome;
  bytes32 public identifier;
  address public oracle;
  string public question;
  uint256 public reward;
  uint256 public fee;
  address public creator;
  
  mapping(Outcome => uint256) public outcomeBalances;
  mapping(address => mapping(Outcome => uint256)) public userPositions;
  
  event MarketResolved(Outcome outcome);
  event PositionTaken(address indexed user, Outcome outcome, uint256 amount);
  event PositionRedeemed(address indexed user, Outcome outcome, uint256 amount);
  
  constructor(
    string memory _question,
    bytes32 _identifier,
    uint256 _reward,
    uint256 _fee,
    address _creator
  ) {
    question = _question;
    identifier = _identifier;
    reward = _reward;
    fee = _fee;
    creator = _creator;
    status = Status.Open;
  }
  
  function takePosition(Outcome outcome) external payable {
    require(status == Status.Open, "Market not open");
    require(msg.value > 0, "Amount must be greater than 0");
    
    userPositions[msg.sender][outcome] += msg.value;
    outcomeBalances[outcome] += msg.value;
    
    emit PositionTaken(msg.sender, outcome, msg.value);
  }
  
  function resolve(Outcome outcome) external {
    require(msg.sender == oracle, "Only oracle can resolve");
    require(status == Status.Open, "Market already resolved");
    
    status = Status.Resolved;
    finalOutcome = outcome;
    
    emit MarketResolved(outcome);
  }
  
  function redeem() external {
    require(status == Status.Resolved, "Market not resolved");
    require(userPositions[msg.sender][finalOutcome] > 0, "No position to redeem");
    
    uint256 amount = userPositions[msg.sender][finalOutcome];
    userPositions[msg.sender][finalOutcome] = 0;
    
    // Calculate reward based on position size
    uint256 rewardAmount = (amount * reward) / outcomeBalances[finalOutcome];
    
    payable(msg.sender).transfer(amount + rewardAmount);
    
    emit PositionRedeemed(msg.sender, finalOutcome, amount + rewardAmount);
  }
}
```

### 🔹 Features planejadas

- Upgradability (UUPS proxy padrão)
- Taxas ajustáveis (% de fee para protocolo)
- Sistema de **dispute e fallback** via oráculo UMA
- Suporte a metatransactions (opcional)

---

## 2️⃣ **Motor de Order Book (CLOB Escalável)**

### 🔹 Objetivo
Permitir que usuários criem, cancelem e executem **ordens limitadas ou de mercado** on-chain ou híbridas (off-chain matching, on-chain settlement).

### 🔹 Arquitetura proposta

- CLOB híbrido:
  - Matching off-chain via serviço em Node.js (ex: [0x Mesh](https://0x.org/mesh), [Seaport](https://seaport.tips), Nitro)
  - Settlement on-chain → via contratos de `submitMatch(orderA, orderB)`
- Integrado aos Position Tokens (ERC20)
- Fila de prioridade por preço e tempo

### 🔹 Considerações Técnicas

- Suporte para ordens limitadas, mercados e cancelamentos
- Filas WebSocket p/ frontend
- Sistema de snapshots e assinaturas para re-match em caso de falha

### 🔹 Exemplo de estrutura

```typescript
// types/order.ts
interface Order {
  id: string;
  marketId: string;
  user: string;
  amount: bigint;
  price: bigint;
  side: "buy" | "sell";
  orderType: "limit" | "market";
  timestamp: number;
  signature: string;
  nonce: number;
}

// services/matching-engine.ts
class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private websocketServer: WebSocket.Server;
  
  constructor() {
    this.websocketServer = new WebSocket.Server({ port: 8080 });
    this.setupWebSocket();
  }
  
  addOrder(order: Order): OrderMatch[] {
    const orderBook = this.getOrCreateOrderBook(order.marketId);
    return orderBook.addOrder(order);
  }
  
  private getOrCreateOrderBook(marketId: string): OrderBook {
    if (!this.orderBooks.has(marketId)) {
      this.orderBooks.set(marketId, new OrderBook(marketId));
    }
    return this.orderBooks.get(marketId)!;
  }
  
  private setupWebSocket() {
    this.websocketServer.on('connection', (ws) => {
      ws.on('message', (message) => {
        const order = JSON.parse(message.toString());
        const matches = this.addOrder(order);
        
        // Broadcast matches to all connected clients
        this.websocketServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'match', data: matches }));
          }
        });
      });
    });
  }
}

// services/order-book.ts
class OrderBook {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  
  constructor(private marketId: string) {}
  
  addOrder(order: Order): OrderMatch[] {
    const matches: OrderMatch[] = [];
    
    if (order.side === 'buy') {
      // Match against sell orders
      while (order.amount > 0n && this.sellOrders.length > 0) {
        const sellOrder = this.sellOrders[0];
        
        if (order.price >= sellOrder.price) {
          const matchAmount = order.amount < sellOrder.amount ? order.amount : sellOrder.amount;
          
          matches.push({
            buyOrder: order,
            sellOrder: sellOrder,
            amount: matchAmount,
            price: sellOrder.price,
            timestamp: Date.now()
          });
          
          order.amount -= matchAmount;
          sellOrder.amount -= matchAmount;
          
          if (sellOrder.amount === 0n) {
            this.sellOrders.shift();
          }
        } else {
          break;
        }
      }
      
      if (order.amount > 0n) {
        this.insertBuyOrder(order);
      }
    } else {
      // Match against buy orders
      while (order.amount > 0n && this.buyOrders.length > 0) {
        const buyOrder = this.buyOrders[0];
        
        if (order.price <= buyOrder.price) {
          const matchAmount = order.amount < buyOrder.amount ? order.amount : buyOrder.amount;
          
          matches.push({
            buyOrder: buyOrder,
            sellOrder: order,
            amount: matchAmount,
            price: buyOrder.price,
            timestamp: Date.now()
          });
          
          order.amount -= matchAmount;
          buyOrder.amount -= matchAmount;
          
          if (buyOrder.amount === 0n) {
            this.buyOrders.shift();
          }
        } else {
          break;
        }
      }
      
      if (order.amount > 0n) {
        this.insertSellOrder(order);
      }
    }
    
    return matches;
  }
  
  private insertBuyOrder(order: Order) {
    // Insert in price-time priority order
    const index = this.buyOrders.findIndex(o => o.price < order.price);
    if (index === -1) {
      this.buyOrders.push(order);
    } else {
      this.buyOrders.splice(index, 0, order);
    }
  }
  
  private insertSellOrder(order: Order) {
    // Insert in price-time priority order
    const index = this.sellOrders.findIndex(o => o.price > order.price);
    if (index === -1) {
      this.sellOrders.push(order);
    } else {
      this.sellOrders.splice(index, 0, order);
    }
  }
}
```

### 🔹 Alternativas de stack:

| Stack técnico      | Função                     |
|--------------------|----------------------------|
| Redis              | Fila temporária de ordens  |
| WebSocket / SignalR| Notificação tempo real     |
| Postgres + Prisma  | Backup histórico off-chain |
| AWS Lambda / Fastify| Matching Engine Worker     |

---

## 3️⃣ **Infraestrutura de Oráculo (UMA Protocol)**

### 🔹 Oráculo escolhido: [UMA Optimistic Oracle (OO)](https://docs.uma.xyz/resources/optimistic-oracle/getting-started)

A UMA é ideal para mercados de previsão porque permite **eventos subjetivos com sistema de "reject if wrong"**. O processo é **descentralizado** e a verificação pode ser disputada (escrow/stake).

### 🔹 Como funciona (resumo):

> 1. O smart contract **faz uma pergunta** usando `requestPrice(...)`  
> 2. Um propositor envia uma resposta (ex: "SIM")  
> 3. Começa um tempo de **liveness** (ex: 1h).  
> 4. Se ninguém protesta, a resposta é aceita como "verdade"  
> 5. Se houver disputa, a UMA DAO entra em votação  
> 6. Resultado é fixado e pode ser resgatado

### 🔹 Exemplo de integração com contrato

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UMAOracleIntegration {
  OptimisticOracleV3Interface public immutable oracle;
  bytes32 public constant identifier = bytes32("YES_OR_NO_QUERY");
  
  mapping(bytes32 => bool) public resolvedQueries;
  mapping(bytes32 => int256) public queryResults;
  
  event QueryRequested(bytes32 indexed queryId, string question);
  event QueryResolved(bytes32 indexed queryId, int256 result);
  
  constructor(address _oracle) {
    oracle = OptimisticOracleV3Interface(_oracle);
  }
  
  function requestResolution(string memory question) external returns (bytes32 queryId) {
    queryId = keccak256(abi.encodePacked(question, block.timestamp));
    
    // Request price from UMA Oracle
    oracle.requestPrice(
      identifier,
      block.timestamp,
      abi.encode(question),
      address(0), // No currency bond
      0 // No reward
    );
    
    emit QueryRequested(queryId, question);
  }
  
  function resolveQuery(bytes32 queryId, string memory question) external {
    require(!resolvedQueries[queryId], "Query already resolved");
    
    // Get the resolved price from UMA Oracle
    int256 result = oracle.settleAndGetPrice(
      identifier,
      block.timestamp,
      abi.encode(question)
    );
    
    resolvedQueries[queryId] = true;
    queryResults[queryId] = result;
    
    emit QueryResolved(queryId, result);
  }
  
  function getQueryResult(bytes32 queryId) external view returns (int256) {
    require(resolvedQueries[queryId], "Query not resolved");
    return queryResults[queryId];
  }
}
```

### 🔹 Fluxo de evento resolvido

1. `marketContract.resolvePrice()` chama UMA (timestamp fixo do evento)
2. Resposta = índice de resultado (`0 = NO, 1 = YES`, etc)
3. Tokens de posição se liberam com base no resultado
4. Rewards são calculados com base na pool

🔗 Docs úteis:
- [Como funciona o OO da UMA](https://docs.uma.xyz/protocol-overview/how-does-umas-oracle-work)  
- [Exemplo prático com integração Solidity](https://docs.uma.xyz/resources/optimistic-oracle/in-depth-tutorial-event-based-prediction-market)  
- [Interface + Tutorial completo](https://docs.uma.xyz/resources/optimistic-oracle/getting-started)  

---

## 🔐 Segurança e fallback do oráculo

- Oráculos são sujeitos a disputa (design confiável/mecanismo de "Proposta+disputa")
- Liveness window ajustável por mercado
- Recompensa para quem acerta / penalidade para quem falsifica dados ([Voting Walkthrough](https://docs.uma.xyz/using-uma/voting-walkthrough))

---

## ✅ O que já está resolvido com esse setup:

| Aspecto                      | Resolvido? | Obs |
|------------------------------|------------|-----|
| Suporte a múltiplos resultados | ✅ | Condicional Tokens compatíveis |
| Oráculo descentralizado e disputável | ✅ | UMA OO totalmente integrado |
| Matching Engine escalável | ⚠️ | Requer priorização / implementação incremental |
| Smart Contract Factory | ✅ | Com upgrade + fee control disponível |
| Liquidação dos mercados | ✅ | Via UMA + redemption by users |

---

## 🚀 Próximos Passos de Implementação

### 1. Smart Contracts
```bash
# Setup Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# Instalar dependências
npm install @openzeppelin/contracts @uma/core
```

### 2. Matching Engine
```bash
# Setup Node.js service
npm install ws redis @prisma/client
npm install -D typescript @types/ws @types/node
```

### 3. UMA Integration
```bash
# Deploy UMA Oracle
npx hardhat run scripts/deploy-uma.js --network polygon
```

### 4. Frontend Integration
```typescript
// lib/web3-provider.ts
import { ethers } from "ethers";
import { MarketFactory__factory } from "../contracts/typechain-types";

export class Web3Provider {
  private provider: ethers.providers.Web3Provider;
  private marketFactory: MarketFactory;
  
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.marketFactory = MarketFactory__factory.connect(
      process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS!,
      this.provider.getSigner()
    );
  }
  
  async createMarket(question: string, reward: bigint, fee: bigint) {
    const tx = await this.marketFactory.createMarket(
      question,
      ethers.utils.id(question),
      reward,
      fee
    );
    return await tx.wait();
  }
}
```

Esta arquitetura fornece uma base sólida para um sistema de prediction markets descentralizado e escalável! 🎯 