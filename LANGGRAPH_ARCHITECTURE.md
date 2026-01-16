# LangGraph Interview Agent Architecture

## State Graph Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Interview Agent State                     │
│  - interview_id, profile, questions, current_question_idx   │
│  - answers, scores, stage, evaluation_result                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  generate_questions   │
                  │  (LLM analyzes resume)│
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  get_next_question    │
                  │  (State management)   │
                  └───────────────────────┘
                              │
                     ┌────────┴────────┐
                     │  Wait for user  │
                     │  answer input   │
                     └────────┬────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  evaluate_answer      │
                  │  (LLM scoring)        │
                  └───────────────────────┘
                              │
                     ┌────────▼────────┐
                     │  Conditional     │
                     │  Routing Logic   │
                     └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ get_next_question│          │       END        │
    │   (continue)     │          │   (complete)     │
    └──────────────────┘          └──────────────────┘
```

## Key LangGraph Features Used

### 1. Explicit State Management
- **TypedDict State**: Strongly typed state with interview progress
- **Persistent State**: State flows through all nodes
- **No Hidden State**: Everything is explicit and trackable

### 2. Multi-Node Reasoning Pipeline
- **generate_questions**: Resume analysis → question generation
- **evaluate_answer**: Answer analysis → scoring + feedback
- **get_next_question**: Progress tracking → next question routing

### 3. Conditional Workflows
- **should_continue()**: Decides whether to continue or end interview
- **Dynamic Routing**: Based on state, routes to next node or END
- **No Hard-coded Paths**: Flow determined by state conditions

### 4. Tool-like Capabilities
- **LLM Tool Calls**: Each node uses LLM as a specialized tool
- **Structured Outputs**: JSON parsing and validation
- **Error Handling**: Fallbacks for LLM failures

## Why This is NOT Plug-and-Play

1. **Custom State Design**: We define InterviewState structure ourselves
2. **Manual Node Creation**: Each node (_generate_questions_node, etc.) is hand-coded
3. **Explicit Graph Building**: We wire nodes and edges manually
4. **Conditional Logic**: We implement _should_continue() routing ourselves
5. **No Pre-built Agents**: No drag-and-drop, no AutoGPT-style wrappers

## Code Highlights

```python
# Explicit state definition
class InterviewState(TypedDict):
    interview_id: str
    profile: dict
    questions: List[dict]
    current_question_idx: int
    # ... explicit fields

# Manual graph construction
workflow = StateGraph(InterviewState)
workflow.add_node("evaluate_answer", self._evaluate_answer_node)
workflow.add_conditional_edges(
    "evaluate_answer",
    self._should_continue,  # Custom routing logic
    {"continue": "get_next_question", "end": END}
)

# Hand-coded node logic
def _evaluate_answer_node(self, state: InterviewState) -> InterviewState:
    # Direct LLM interaction - no abstraction
    response = self.llm.invoke([...])
    # Manual parsing and state update
    state['evaluation_result'] = parsed_result
    return state
```

This demonstrates understanding of:
- Agent architectures
- State machines
- Conditional workflows
- LLM orchestration patterns
- System design (not just API calls)
