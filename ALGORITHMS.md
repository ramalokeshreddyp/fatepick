# 🧮 Algorithms Used in FatePick

This document provides a comprehensive overview of all algorithms implemented in the FatePick project. FatePick uses mathematically sound randomization and distribution algorithms to ensure fairness and eliminate bias in selection processes.

---

## Table of Contents

1. [Fisher-Yates Shuffle Algorithm](#1-fisher-yates-shuffle-algorithm)
2. [Random Selection Algorithm](#2-random-selection-algorithm)
3. [Team Formation Algorithm](#3-team-formation-algorithm)
4. [Round-Robin Distribution Algorithm](#4-round-robin-distribution-algorithm)
5. [Team-Topic Allocation Algorithm](#5-team-topic-allocation-algorithm)

---

## 1. Fisher-Yates Shuffle Algorithm

### Purpose
The Fisher-Yates (also known as Knuth) shuffle is the core randomization algorithm used throughout FatePick. It provides unbiased, uniform random permutations of arrays.

### Implementation
**Location:** `lib/utils.ts`

```typescript
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### How It Works
1. Creates a copy of the input array to avoid mutation
2. Iterates backwards through the array from the last element to the second element
3. For each position `i`, generates a random index `j` between 0 and `i` (inclusive)
4. Swaps elements at positions `i` and `j`
5. Returns the shuffled array

### Time Complexity
- **O(n)** - Linear time, where n is the number of elements

### Space Complexity
- **O(n)** - Creates a copy of the input array

### Properties
- **Unbiased:** Every permutation has equal probability (1/n!)
- **In-place variation possible:** Current implementation creates a copy for immutability
- **Cryptographically secure:** As secure as the underlying `Math.random()` function

### Used In
- Team Builder (TeamPicker.tsx)
- Individual Topics (TopicAllocator.tsx)
- Team Topics (TeamTopicAllocator.tsx)

---

## 2. Random Selection Algorithm

### Purpose
Selects a single random winner from a list of participants with visual animation effect.

### Implementation
**Location:** `components/SinglePicker.tsx`

```typescript
// Animation phase (visual effect)
const interval = setInterval(() => {
  setResult(items[Math.floor(Math.random() * items.length)]);
  counter++;
  if (counter >= totalTicks) {
    clearInterval(interval);
    // Final selection
    const final = items[Math.floor(Math.random() * items.length)];
    setResult(final);
  }
}, 60);
```

### How It Works
1. **Input Validation:** Ensures at least 2 items are provided
2. **Animation Phase:** 
   - Runs 30 iterations (ticks) at 60ms intervals
   - Each tick displays a random item from the list
   - Creates visual "spinning" effect
3. **Final Selection:**
   - Makes one final random selection after animation completes
   - Uses `Math.floor(Math.random() * items.length)` for uniform distribution
   - Displays result with confetti celebration

### Time Complexity
- **O(1)** - Constant time for each random selection
- **Animation:** 30 iterations × 60ms = 1.8 seconds total

### Space Complexity
- **O(n)** - Stores the input items array

### Properties
- **Fair:** Each item has equal probability of selection (1/n)
- **Independent:** Each animation tick is an independent random selection
- **User Experience:** Builds suspense through animated selection process

### Used In
- Single Picker feature

---

## 3. Team Formation Algorithm

### Purpose
Divides a list of participants into balanced teams of specified size using randomization to ensure fairness.

### Implementation
**Location:** `components/TeamPicker.tsx`

```typescript
const shuffled = shuffle(items);
const result: string[][] = [];
for (let i = 0; i < shuffled.length; i += teamSize) {
  result.push(shuffled.slice(i, i + teamSize));
}
```

### How It Works
1. **Randomization:** Uses Fisher-Yates shuffle to randomize participant order
2. **Chunking:** Divides shuffled array into chunks of size `teamSize`
3. **Remainder Handling:** Last team may have fewer members if participants don't divide evenly

### Example
Input: `["Alice", "Bob", "Charlie", "David", "Eve"]`, teamSize: 2
1. Shuffle: `["Charlie", "Eve", "Alice", "Bob", "David"]`
2. Chunk: `[["Charlie", "Eve"], ["Alice", "Bob"], ["David"]]`

### Time Complexity
- **O(n)** - Fisher-Yates shuffle + single pass chunking

### Space Complexity
- **O(n)** - Stores shuffled array and team arrays

### Properties
- **Fair Distribution:** Random shuffle ensures no bias in team composition
- **Balanced Teams:** All teams except possibly the last have equal size
- **Deterministic Chunking:** After shuffle, division is straightforward

### Used In
- Team Builder feature

---

## 4. Round-Robin Distribution Algorithm

### Purpose
Assigns topics to individual participants fairly, with topic reuse when there are more participants than topics.

### Implementation
**Location:** `components/TopicAllocator.tsx`

```typescript
const shuffledTopics = shuffle(topics);
const result = students.map((student, idx) => ({
  student,
  topic: shuffledTopics[idx % shuffledTopics.length]
}));
```

### How It Works
1. **Topic Randomization:** Shuffles the topics array using Fisher-Yates
2. **Round-Robin Assignment:**
   - Iterates through students sequentially
   - Assigns topics using modulo operator: `idx % shuffledTopics.length`
   - When reaching the end of topics, cycles back to the beginning
3. **Pair Creation:** Creates student-topic pairs for output

### Example
Students: `["Alice", "Bob", "Charlie", "David"]`
Topics: `["AI", "Blockchain"]`

After shuffle: Topics = `["Blockchain", "AI"]`
1. Alice → Blockchain (index 0 % 2 = 0)
2. Bob → AI (index 1 % 2 = 1)
3. Charlie → Blockchain (index 2 % 2 = 0)
4. David → AI (index 3 % 2 = 1)

### Time Complexity
- **O(n + m)** - Where n = students, m = topics (shuffle topics + map students)

### Space Complexity
- **O(n + m)** - Stores shuffled topics and result allocations

### Properties
- **Fair Topic Distribution:** Topics shuffled before assignment prevents predictable patterns
- **Balanced Reuse:** When topics < students, each topic used ⌈n/m⌉ or ⌊n/m⌋ times
- **No Student Duplication:** Each student gets exactly one topic

### Used In
- Individual Topics feature

---

## 5. Team-Topic Allocation Algorithm

### Purpose
Combines team formation with topic assignment - creates random teams and assigns each team a unique topic (or reuses topics if necessary).

### Implementation
**Location:** `components/TeamTopicAllocator.tsx`

```typescript
const shuffledStudents = shuffle(students);
const shuffledTopics = shuffle(topics);

// Form teams
const formedTeams: string[][] = [];
for (let i = 0; i < shuffledStudents.length; i += teamSize) {
  formedTeams.push(shuffledStudents.slice(i, i + teamSize));
}

// Assign topics to teams
const finalResults = formedTeams.map((team, idx) => ({
  team,
  topic: shuffledTopics[idx % shuffledTopics.length]
}));
```

### How It Works
1. **Student Randomization:** Shuffles students using Fisher-Yates
2. **Team Formation:** Chunks shuffled students into teams of specified size
3. **Topic Randomization:** Shuffles topics independently
4. **Topic Assignment:** Assigns topics to teams using round-robin (modulo)

### Example
Students: `["A", "B", "C", "D", "E", "F"]`, teamSize: 2
Topics: `["Topic1", "Topic2"]`

1. Shuffle students: `["C", "E", "A", "B", "D", "F"]`
2. Form teams: `[["C", "E"], ["A", "B"], ["D", "F"]]`
3. Shuffle topics: `["Topic2", "Topic1"]`
4. Assign:
   - Team 1 (C, E) → Topic2
   - Team 2 (A, B) → Topic1
   - Team 3 (D, F) → Topic2 (reuse via modulo)

### Time Complexity
- **O(n + m)** - Where n = students, m = topics
  - Shuffle students: O(n)
  - Shuffle topics: O(m)
  - Form teams: O(n)
  - Assign topics: O(number of teams)

### Space Complexity
- **O(n + m)** - Stores shuffled arrays, teams, and results

### Properties
- **Double Randomization:** Both students and topics are shuffled independently
- **Fair Team Composition:** Random student shuffle prevents bias
- **Fair Topic Distribution:** Random topic order prevents assignment patterns
- **Scalable:** Handles any ratio of students to topics

### Used In
- Team Topics feature

---

## Algorithm Selection Rationale

### Why Fisher-Yates?
- **Proven correctness:** Mathematically proven to produce unbiased permutations
- **Efficiency:** O(n) time complexity is optimal for shuffling
- **Simplicity:** Easy to implement and verify
- **Industry standard:** Used by major frameworks and libraries

### Why Math.random()?
- **Built-in:** Available in all JavaScript environments
- **Sufficient for non-cryptographic use:** Adequate for educational/organizational randomization
- **Performance:** Fast execution
- **Note:** For cryptographic applications, would use `crypto.getRandomValues()`

### Design Principles
1. **Fairness:** All algorithms ensure equal probability for all participants
2. **Transparency:** Simple, verifiable implementations
3. **Immutability:** Original data structures are never modified
4. **Performance:** Linear or constant time complexity for all operations
5. **User Experience:** Animations and visual feedback enhance perceived randomness

---

## Testing Recommendations

To verify algorithm fairness:

1. **Distribution Test:** Run each algorithm 10,000+ times and verify uniform distribution
2. **Independence Test:** Ensure consecutive runs are independent
3. **Edge Cases:** Test with minimum/maximum inputs, empty arrays, single elements
4. **Stress Test:** Verify performance with large datasets (1000+ participants)

---

## References

- [Fisher-Yates Shuffle - Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Knuth, Donald E. "The Art of Computer Programming, Volume 2: Seminumerical Algorithms"](https://en.wikipedia.org/wiki/The_Art_of_Computer_Programming)
- [Math.random() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)

---

**Last Updated:** February 2026
**Project:** FatePick - Professional Randomization Standard
**License:** MIT
