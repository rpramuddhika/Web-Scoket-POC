# WebSocket POC — Implementation Documentation

## Architecture Overview

```
Electron Client (React)                Spring Boot Server
─────────────────────────────          ─────────────────────────────
@stomp/stompjs  ──── STOMP over SockJS/WS ────►  /ws  endpoint
                                                      │
                                                 MessageBroker
                                                 (/topic  prefix)
                                                      │
                     ◄──── push to /topic/notifications ──── Scheduler
```

---

## Server Side

### 1. `ServerApplication.java` — Entry Point

```java
@SpringBootApplication
@EnableScheduling          // ← activates @Scheduled methods
public class ServerApplication { ... }
```

`@EnableScheduling` is the only WebSocket-relevant annotation here. Without it, `NotificationScheduler` would never fire.

---

### 2. `WebSocketConfig.java` — STOMP Broker Setup

```java
@EnableWebSocketMessageBroker   // ← turns on the full STOMP message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer
```

**Two methods configure the messaging pipeline:**

| Method | What it does |
|---|---|
| `configureMessageBroker()` | Defines routing prefixes |
| `registerStompEndpoints()` | Defines the handshake URL |

**Message broker routing:**
```
registry.enableSimpleBroker("/topic")
  → all subscriptions starting with /topic are handled in-memory by Spring's broker

registry.setApplicationDestinationPrefixes("/app")
  → messages from client starting with /app are routed to @MessageMapping controllers
```

**Handshake endpoint:**
```
registry.addEndpoint("/ws")
  .setAllowedOriginPatterns("*")   // CORS for WS
  .withSockJS()                    // SockJS fallback enabled
```

SockJS allows the connection to fall back to long-polling if WebSocket is blocked (firewalls, etc.). The actual raw WebSocket path becomes `/ws/websocket`.

---

### 3. `WebSocketEventListener.java` — Connection Lifecycle Logging

```java
@EventListener
public void handleWebSocketConnectListener(SessionConnectedEvent event)

@EventListener
public void handleWebSocketDisconnectListener(SessionDisconnectEvent event)
```

These are Spring application events fired by the WebSocket infrastructure. They log session connect/disconnect — useful for debugging dropped connections or monitoring active clients.

---

### 4. `NotificationScheduler.java` — Server Push Engine

This is the **core of the server-to-client push mechanism.**

```java
@Scheduled(cron = "0 * * * * *")   // fires at second=0 of every minute
public void checkAndSendNotification()
```

**Logic flow:**

```
1. Load notification config from DB (time + isRemember flag)
2. Guard clauses → skip if null or isRemember=false
3. Compare current minute with scheduled minute (seconds/nanos zeroed out)
4. If match → push to /topic/notifications via SimpMessagingTemplate
```

`SimpMessagingTemplate.convertAndSend("/topic/notifications", payload)` serializes `NotificationEntity` to JSON and broadcasts it to **all** subscribed clients on that topic. There is no user-specific routing here — every connected client receives it.

---

## Client Side

### `App.tsx` — STOMP Client & Subscription

**Library:** `@stomp/stompjs` — a pure STOMP client (no SockJS wrapper needed because the raw WS URL is used directly).

```ts
const client = new Client({
  brokerURL: 'ws://localhost:8080/ws/websocket',
  //                               ↑ /ws is the endpoint, /websocket is SockJS's raw WS path
  reconnectDelay: 5000,            // auto-reconnect every 5s on disconnect
  ...
})
```

**Connection + subscription:**
```ts
onConnect: () => {
  client.subscribe('/topic/notifications', (message) => {
    const body: NotificationMessage = JSON.parse(message.body)
    toast.info(`Notification at ${body.notificationTime}`, ...)
  })
}
```

When `onConnect` fires (STOMP CONNECTED frame received), it subscribes to `/topic/notifications`. The server's broker will now forward any message published to that topic to this client.

**STOMP frame flow:**

```
Client                                 Server
──────                                 ──────
CONNECT ──────────────────────────────►
        ◄────────────────── CONNECTED
SUBSCRIBE /topic/notifications ───────►
        ◄──── MESSAGE (JSON payload) ── (from scheduler at cron minute)
DISCONNECT ───────────────────────────►  (on component unmount)
```

**Cleanup:**
```ts
return () => { client.deactivate() }   // STOMP DISCONNECT on unmount
```

---

## Data Flow — End to End

```
1. DB holds one row: { notificationTime: "14:30", isRemember: true }
2. PUT /api/notifications  → REST endpoint updates that row
3. Every minute at :00 seconds → Scheduler wakes up
4. Scheduler reads DB row, compares with LocalTime.now()
5. Match → SimpMessagingTemplate publishes NotificationEntity as JSON to /topic/notifications
6. Spring broker delivers MESSAGE frame to all STOMP subscribers
7. stompjs onMessage fires → react-toastify shows toast in Electron window
```

---

## Key Design Points

| Point | Detail |
|---|---|
| **SockJS path convention** | `/ws` is the STOMP endpoint; SockJS appends `/websocket` for raw WS. The client must use `ws://…/ws/websocket` not `ws://…/ws` |
| **Simple broker** | In-memory, single-node only. Not cluster-safe. For production, swap to `enableStompBrokerRelay` with RabbitMQ/ActiveMQ |
| **Broadcast only** | `convertAndSend("/topic/…")` goes to all subscribers. For per-user messages, use `/user/{id}/queue/…` with `convertAndSendToUser` |
| **Cron granularity** | Cron fires at second=0, scheduler zeroes seconds/nanos — so effective resolution is per-minute |
| **No @MessageMapping** | The client never sends messages to `/app/…` — this is a pure server-push setup |
