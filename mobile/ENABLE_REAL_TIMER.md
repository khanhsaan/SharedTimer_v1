# Enabling Real-Time Timer Synchronization: A Mentorship Guide

## 🎯 The Problem We're Solving

Right now, your timer app works on a single device. But imagine this scenario:
- You start a washing machine timer on your phone
- Your partner wants to check the timer on their tablet
- **Problem:** They can't see your timer!

**Real-time synchronization** solves this by keeping all devices in sync instantly. When you start a timer on Device A, Device B sees it immediately.

---

## 🧠 Mental Model: Understanding Real-Time Systems

### The Core Challenge
In a multi-device system, you have **multiple sources of truth**:
- Device A has its own timer state
- Device B has its own timer state  
- The database has the "official" state

**Question to ponder:** How do we ensure all three stay synchronized?

### Two-Phase Synchronization Strategy

Think of it like a restaurant with both a **fast-food window** and **sit-down service**:

1. **Broadcast Channel (Fast-Food Window)**: 
   - Instant delivery, no waiting
   - Great for immediate updates
   - But... if you miss it, the info is gone
   - **Use case:** When User A starts a timer, broadcast it instantly to User B

2. **Database Channel (Sit-Down Service)**:
   - Always reliable, always available
   - You can "catch up" anytime
   - But... slightly slower
   - **Use case:** When Device C joins later, it loads the full state from database

**Key Insight:** We use BOTH channels together for the best of both worlds!

---

## 📊 Understanding the Data Flow

Let's trace what happens when you start a timer:

```
User Action (Start Timer)
    ↓
[Local State Update] ← Immediate feedback (good UX)
    ↓
[Broadcast to Other Devices] ← Instant sync (< 100ms)
    ↓
[Save to Database] ← Persistent storage (survives app restart)
    ↓
[Database Triggers Notification] ← Other devices catch up if they missed broadcast
```

**Why this dual approach?**

1. **Broadcast** = Speed (great user experience)
2. **Database** = Reliability (never lose data, handle missed messages)

---

## 🏗️ Architecture Overview

### State Management Layers

Your timer state exists in **three places simultaneously**:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: React State (Your Current useTimer hook)      │
│  - Fast, local, reactive                                │
│  - Updates UI immediately                               │
└─────────────────────────────────────────────────────────┘
           ↓ sync ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Supabase Realtime Channels                    │
│  - Broadcast channel: instant peer-to-peer              │
│  - Database channel: change notifications               │
└─────────────────────────────────────────────────────────┘
           ↓ save ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 3: PostgreSQL Database (user_timers table)       │
│  - Single source of truth                               │
│  - Persists across sessions                             │
└─────────────────────────────────────────────────────────┘
```

**Mental shift:** Instead of "state lives here," think "state is synchronized across these layers."

---

## 🧩 Key Concepts You Need to Understand

### 1. **State Reconciliation**

**The problem:** What if Device A starts a timer at 10:00:00, and Device B tries to pause it at 10:00:01?

**The solution:** We use "locks" to prevent conflicts:
- When Device A starts a timer, it "locks" it to that device/user profile
- Device B can SEE the timer but cannot CONTROL it while locked
- This prevents "fighting" over control

**Think of it like:** A shared document where one person has edit permissions.

### 2. **Time-Based Calculation vs. State-Based**

**Current approach (useTimer):** 
- Store remaining seconds
- Count down locally
- **Problem:** Drifts out of sync if app is closed

**Real-time approach:**
- Store `started_at` timestamp and `base_timers` (duration)
- Calculate remaining = `base_timers - (now - started_at)`
- **Benefit:** Always accurate, even if device was offline

**Example:**
```
Base timer: 3600 seconds (1 hour)
Started at: 10:00:00 AM
Current time: 10:30:00 AM
Remaining = 3600 - (10:30:00 - 10:00:00) = 3600 - 1800 = 1800 seconds ✅
```

### 3. **Subscription Lifecycle**

Understanding when subscriptions connect/disconnect:

```
App Opens
    ↓
Check: Is user logged in?
    ↓ YES
Load state from database (initial sync)
    ↓
Subscribe to broadcast channel (instant updates)
    ↓
Subscribe to database channel (catch-up mechanism)
    ↓
[User uses app - changes propagate via both channels]
    ↓
App Closes
    ↓
Unsubscribe from channels (cleanup - important!)
```

**Why cleanup matters:** Without unsubscribing, you leak memory and leave "ghost" connections.

---

## 📋 Implementation Steps: The Reasoning Behind Each Step

### Step 1: Configure Supabase Client for Realtime

**What:** Add realtime configuration to your Supabase client

**Why:** By default, Supabase doesn't enable realtime. You need to tell it:
- How many events per second to handle (throttling)
- What channels to allow

**Mental model:** Like enabling "live notifications" in a messaging app - it's off by default for performance.

**What to configure:**
```typescript
realtime: {
  params: {
    eventsPerSecond: 10  // Why 10? Enough for smooth UX, not too heavy
  }
}
```

**Think about:** Why do we throttle events? (Hint: prevent overwhelming slow connections)

---

### Step 2: Design the Database Table Structure

**What:** Create `user_timers` table

**Why:** We need persistent storage that can be queried and subscribed to.

**Design decisions to understand:**

1. **Why one row per user?**
   - All timers (washingMachine, dryer, etc.) for one user in one row
   - **Alternative:** One row per timer (more normalized)
   - **Trade-off:** We choose denormalized (one row) for simpler queries and atomic updates

2. **Why JSONB columns?**
   ```sql
   base_timers JSONB    -- { washingMachine: 3600, dryer: 1800, ... }
   running JSONB        -- { washingMachine: true, dryer: false, ... }
   ```
   - Flexible structure (easy to add new appliances)
   - Single update updates all timers atomically
   - PostgreSQL JSONB is indexed and fast

3. **Why `start_hours` and `finish_hours`?**
   - Store timestamps for when timers started/finished
   - Useful for displaying "Started at 10:00 AM, finishes at 11:00 AM"
   - Not just for sync, but for user-facing info

**Security consideration:** Row Level Security (RLS) policies ensure:
- Users can only see their own timer data
- Users can only modify their own timer data
- Even if someone tries to query another user_id, PostgreSQL blocks it

---

### Step 3: Enable Realtime Replication

**What:** In Supabase Dashboard → Database → Replication, enable `user_timers`

**Why:** This creates a publication (PostgreSQL concept) that allows Supabase Realtime to listen to changes.

**Mental model:** Like subscribing to a magazine - you need to explicitly subscribe before you get issues delivered.

**What happens if you skip this step?**
- Database channel won't receive updates
- Only broadcast channel works (which is unreliable if a device is offline)

---

### Step 4: Create the useRealtimeTimers Hook

**This is the most complex step. Let's break it down mentally:**

#### 4.1 State Structure

**Question:** What state do we need to track?

Think through each piece:
- `baseTimers`: Original duration set (doesn't change while running)
- `timers`: Calculated remaining time (updates every second)
- `running`: Which timers are active
- `startedAt`: Timestamp when each timer started
- `locks`: Which profile/device currently controls each timer

**Mental exercise:** Why do we separate `baseTimers` and `timers`?
- `baseTimers` = "I set it for 1 hour"
- `timers` = "After 30 minutes, 30 minutes remaining"
- We calculate `timers` from `baseTimers` + `startedAt` + current time

#### 4.2 The Load → Subscribe → Persist Pattern

**Initial Load (when hook mounts):**
```typescript
1. Query database for current state
2. If row exists → restore state
3. If no row exists → create initial row
4. Update local React state
```

**Why load first?** 
- App might have been closed for hours
- Need to restore accurate state before subscribing

**Setting up subscriptions:**
```typescript
1. Create database channel (postgres_changes)
   - Listens to: INSERT, UPDATE, DELETE on user_timers table
   - Filter: Only rows where user_id = current user
   
2. Create broadcast channel
   - Channel name: `user-timers-${user.id}` (unique per user)
   - Listens to: 'timer-sync' events
```

**When to persist?**
Every time user interacts:
- Start timer → persist
- Pause timer → persist  
- Adjust timer → persist

**The persistence function does TWO things:**
1. Broadcast immediately (for speed)
2. Save to database (for reliability)

#### 4.3 The Dual-Channel Strategy in Code

**When User Starts Timer:**
```typescript
startTimer(id) {
  // 1. Update local state immediately (good UX)
  setRunning({...running, [id]: true})
  
  // 2. Persist (which broadcasts AND saves to DB)
  persist(newBaseTimers, newRunning, ...)
}
```

**persist() does:**
```typescript
async persist(...) {
  // Fast path: Broadcast to other devices NOW
  channel.send({
    type: 'broadcast',
    event: 'timer-sync',
    payload: {...state}
  })
  
  // Reliable path: Save to database (slower but permanent)
  await supabase.from('user_timers').upsert({...})
}
```

**On Other Device:**
```typescript
// Broadcast arrives first (if device is online)
broadcastChannel.on('broadcast', (payload) => {
  // Update state immediately - user sees change < 100ms
  setRunning(payload.running)
})

// Database change arrives later (backup/catch-up)
dbChannel.on('postgres_changes', (payload) => {
  // Update state - ensures we didn't miss anything
  setRunning(payload.new.running)
})
```

**Why both?**
- If Device B is online → gets broadcast instantly ✅
- If Device B was offline → broadcast lost, but database change catches it up ✅

---

## 🎓 Learning Exercises (Do Before Implementing)

### Exercise 1: Trace the Data Flow
Imagine you have 2 devices (Phone and Tablet) and start a timer on Phone. Draw arrows showing:
- Which device does what
- Which channel delivers messages
- In what order events happen

### Exercise 2: Handle Edge Cases
Think about these scenarios:
- What if Device A and Device B try to start the same timer at the exact same time?
- What if Device C opens the app after being offline for 2 hours?
- What if the network drops while a timer is running?

**Answer these before coding** - it will guide your implementation.

### Exercise 3: State Reconciliation
Currently, your `useTimer` calculates remaining time by counting down. 

**Challenge:** Refactor to calculate from `startedAt` timestamp instead.

**Why?** This is the foundation for real-time sync - all devices calculate from the same timestamp.

---

## 📝 Step-by-Step Implementation Checklist

### ✅ Phase 1: Configuration (Foundation)

- [ ] **1.1** Update `lib/supabase.ts` 
  - Add `realtime: { params: { eventsPerSecond: 10 } }` to client config
  - **Verify:** Client exports `supabase` with realtime enabled

- [ ] **1.2** Create database table
  - Run SQL to create `user_timers` table
  - Set up RLS policies (security!)
  - Add trigger for `updated_at` timestamp
  - **Verify:** Table exists in Supabase Dashboard

- [ ] **1.3** Enable Realtime replication
  - Dashboard → Database → Replication
  - Toggle `user_timers` ON
  - **Verify:** Green indicator shows "Active"

### ✅ Phase 2: Hook Implementation (Core Logic)

- [ ] **2.1** Create `useRealtimeTimers.ts` file structure
  - Define interfaces/types
  - Set up state variables
  - Import dependencies

- [ ] **2.2** Implement `computeDisplay()` function
  - **Mental model:** Calculate remaining time from timestamps
  - Formula: `remaining = base_timers[id] - (now - started_at[id])`
  - **Test:** Does it handle null/undefined timestamps correctly?

- [ ] **2.3** Implement `persist()` function
  - Broadcast to channel
  - Upsert to database
  - **Test:** Does it handle errors gracefully?

- [ ] **2.4** Implement initial load (useEffect)
  - Query database
  - Handle "no row exists" case
  - Update local state
  - **Test:** What happens on first use? After app restart?

- [ ] **2.5** Set up subscriptions (useEffect)
  - Database channel (postgres_changes)
  - Broadcast channel (broadcast)
  - **Test:** Do both channels connect? Do you see console logs?

- [ ] **2.6** Implement timer control functions
  - `startTimer()`
  - `pauseTimer()`
  - `updateTimer()`
  - `setTimerValue()`
  - **Test:** Does each function update state AND persist?

- [ ] **2.7** Implement cleanup (useEffect return)
  - Unsubscribe from channels
  - **Test:** No memory leaks? (Check React DevTools)

### ✅ Phase 3: Integration (Connect to UI)

- [ ] **3.1** Replace `useTimer` with `useRealtimeTimers` in `TimerScreen.tsx`
  - Map old API to new API
  - **Test:** Does UI still work?

- [ ] **3.2** Test multi-device sync
  - Open app on 2 devices
  - Start timer on Device A
  - **Verify:** Device B sees timer start within 1 second

- [ ] **3.3** Test offline/online scenarios
  - Start timer while offline
  - Go online
  - **Verify:** State syncs correctly

### ✅ Phase 4: Edge Cases & Polish

- [ ] **4.1** Handle subscription disconnections
  - Show connection status to user
  - Reconnect logic if needed

- [ ] **4.2** Test lock behavior
  - Start timer on Device A with Profile 1
  - Try to control on Device B with Profile 2
  - **Verify:** Lock prevents control

- [ ] **4.3** Performance check
  - Are subscriptions cleaned up?
  - Are there unnecessary re-renders?

---

## 🔍 Debugging Guide

### Problem: Changes don't sync between devices

**Debug checklist:**
1. ✅ Is realtime enabled in Supabase Dashboard?
2. ✅ Is `realtime` config in Supabase client?
3. ✅ Are channels subscribed? (Check console logs for "SUBSCRIBED")
4. ✅ Are you calling `persist()` after state changes?
5. ✅ Is RLS blocking the queries? (Check Supabase logs)

### Problem: State gets reset on app restart

**Likely cause:** Not loading from database on mount

**Check:** Does your `useEffect` load from database before setting up subscriptions?

### Problem: Timers drift (show wrong time)

**Likely cause:** Calculating from `remaining` instead of `startedAt` timestamp

**Solution:** Always calculate: `base - (now - started_at)`

---

## 💡 Key Takeaways

1. **Dual-channel strategy:** Broadcast for speed, Database for reliability
2. **Time-based calculation:** Store timestamps, calculate remaining = more accurate
3. **State reconciliation:** Locks prevent conflicts between devices
4. **Always persist:** Every user action should broadcast AND save to DB
5. **Cleanup matters:** Unsubscribe from channels to prevent leaks

---

## 🚀 Next Steps After Implementation

Once real-time sync works:

1. **Optimization:** Can we reduce the number of database writes?
2. **Notifications:** Use `start_hours`/`finish_hours` to send notifications when timers complete
3. **Offline support:** Store pending changes and sync when back online
4. **Conflict resolution:** What if locks conflict? (Advanced)

---

## 📚 Further Reading

- **Supabase Realtime Docs:** Understand channels, broadcasts, and subscriptions deeply
- **PostgreSQL JSONB:** Learn why we use JSONB and how it's indexed
- **Reactive Programming:** The pattern of "subscribe → update" is core to real-time systems
- **Distributed Systems:** Concepts like "eventual consistency" apply here

---

**Remember:** The goal isn't just to make it work, but to understand WHY it works. Ask questions, trace through code, and experiment! 🎓