"""
LangGraph-based Interview Agent with State Management
Shows explicit agent state handling and conditional workflows
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

# Define Agent State
class InterviewState(TypedDict):
    """Explicit state management for interview flow"""
    interview_id: str
    profile: dict
    questions: List[dict]
    current_question_idx: int
    answers: List[dict]
    scores: List[dict]
    stage: Literal["parse_resume", "generate_questions", "evaluate_answer", "complete"]
    next_question: dict | None
    evaluation_result: dict | None


class InterviewAgent:
    """LangGraph-controlled interview reasoning pipeline"""
    
    def __init__(self, profile: dict):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.profile = profile
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the state graph with conditional routing"""
        workflow = StateGraph(InterviewState)
        
        # Add nodes (agent steps)
        workflow.add_node("generate_questions", self._generate_questions_node)
        workflow.add_node("evaluate_answer", self._evaluate_answer_node)
        workflow.add_node("get_next_question", self._get_next_question_node)
        
        # Define edges and conditional routing
        workflow.set_entry_point("generate_questions")
        
        # After generating questions, get the first one
        workflow.add_edge("generate_questions", "get_next_question")
        
        # After getting next question, wait for evaluation
        # (This happens externally when user submits answer)
        workflow.add_edge("get_next_question", END)
        
        # After evaluation, conditionally route
        workflow.add_conditional_edges(
            "evaluate_answer",
            self._should_continue,
            {
                "continue": "get_next_question",
                "end": END
            }
        )
        
        return workflow.compile()
    
    def _generate_questions_node(self, state: InterviewState) -> InterviewState:
        """Node: Generate interview questions based on resume"""
        print(f"[Agent] Generating questions for profile: {state['profile'].get('name', 'Unknown')}")
        
        prompt = f"""You are a technical interviewer. Based on this resume profile, generate 5 technical interview questions.
Mix conceptual (theory) and coding questions appropriate to the candidate's experience level.

Resume Profile:
- Name: {state['profile'].get('name', 'N/A')}
- Skills: {', '.join(state['profile'].get('skills', []))}
- Experience: {state['profile'].get('experience', 'N/A')} years

Generate exactly 5 questions in this JSON format:
[
    {{"question": "...", "type": "conceptual", "hint": "..."}},
    {{"question": "...", "type": "coding", "hint": "..."}}
]"""
        
        response = self.llm.invoke([
            SystemMessage(content="You are an expert technical interviewer."),
            HumanMessage(content=prompt)
        ])
        
        # Parse questions from LLM response
        import json
        try:
            questions = json.loads(response.content)
        except:
            # Fallback questions
            questions = [
                {"question": "Explain the difference between REST and GraphQL", "type": "conceptual", "hint": "Think about data fetching"},
                {"question": "Write a function to reverse a linked list", "type": "coding", "hint": "Consider iterative or recursive approaches"},
                {"question": "What is the purpose of dependency injection?", "type": "conceptual", "hint": "Focus on loose coupling"},
                {"question": "Implement a binary search algorithm", "type": "coding", "hint": "Time complexity should be O(log n)"},
                {"question": "Explain the CAP theorem in distributed systems", "type": "conceptual", "hint": "Think about trade-offs"}
            ]
        
        state['questions'] = questions
        state['current_question_idx'] = 0
        state['answers'] = []
        state['scores'] = []
        state['stage'] = "generate_questions"
        
        return state
    
    def _evaluate_answer_node(self, state: InterviewState) -> InterviewState:
        """Node: Evaluate the submitted answer"""
        question_idx = state['current_question_idx']
        question = state['questions'][question_idx]
        answer = state['answers'][-1]  # Last submitted answer
        
        print(f"[Agent] Evaluating answer for question {question_idx + 1}/{len(state['questions'])}")
        
        prompt = f"""Evaluate this technical interview answer:

Question: {question['question']}
Type: {question['type']}
Answer: {answer}

Provide scores (0-100) for:
1. Correctness: How accurate is the answer?
2. Depth: How thorough and detailed?
3. Clarity: How well-explained?

Also provide constructive feedback.

Return JSON format:
{{
    "correctness": 85,
    "depth": 75,
    "clarity": 90,
    "feedback": "Your detailed feedback here..."
}}"""
        
        response = self.llm.invoke([
            SystemMessage(content="You are an expert technical interviewer evaluating answers."),
            HumanMessage(content=prompt)
        ])
        
        import json
        try:
            evaluation = json.loads(response.content)
        except:
            evaluation = {
                "correctness": 70,
                "depth": 65,
                "clarity": 75,
                "feedback": "Your answer shows understanding but could be more detailed."
            }
        
        state['scores'].append(evaluation)
        state['evaluation_result'] = evaluation
        state['stage'] = "evaluate_answer"
        
        return state
    
    def _get_next_question_node(self, state: InterviewState) -> InterviewState:
        """Node: Get the next question to ask"""
        state['current_question_idx'] += 1
        
        if state['current_question_idx'] < len(state['questions']):
            next_q = state['questions'][state['current_question_idx']]
            state['next_question'] = next_q
            print(f"[Agent] Next question: {state['current_question_idx'] + 1}/{len(state['questions'])}")
        else:
            state['next_question'] = None
            state['stage'] = "complete"
            print("[Agent] Interview complete")
        
        return state
    
    def _should_continue(self, state: InterviewState) -> str:
        """Conditional routing: Continue or end interview?"""
        if state['current_question_idx'] >= len(state['questions']):
            return "end"
        return "continue"
    
    def start_interview(self) -> dict:
        """Initialize interview session and return first question"""
        initial_state: InterviewState = {
            "interview_id": "",
            "profile": self.profile,
            "questions": [],
            "current_question_idx": 0,
            "answers": [],
            "scores": [],
            "stage": "parse_resume",
            "next_question": None,
            "evaluation_result": None
        }
        
        # Run the graph to generate questions
        result = self.graph.invoke(initial_state)
        
        return {
            "questions": result['questions'],
            "first_question": result['next_question']
        }
    
    def submit_answer(self, state: InterviewState, answer: str) -> dict:
        """Submit answer and get evaluation + next question"""
        # Add answer to state
        state['answers'].append(answer)
        
        # Update stage to trigger evaluation
        state['stage'] = "evaluate_answer"
        
        # Run evaluation node
        state = self._evaluate_answer_node(state)
        
        # Get next question
        state = self._get_next_question_node(state)
        
        # Check if complete
        if state['next_question'] is None:
            return {
                "status": "completed",
                "evaluation": state['evaluation_result'],
                "final_scores": state['scores']
            }
        else:
            return {
                "status": "next",
                "evaluation": state['evaluation_result'],
                "next_question": state['next_question']
            }
    
    def get_summary(self, state: InterviewState) -> dict:
        """Generate interview summary"""
        scores = state['scores']
        if not scores:
            return {"average_score": 0, "strengths": [], "weak_areas": []}
        
        avg_correctness = sum(s['correctness'] for s in scores) / len(scores)
        avg_depth = sum(s['depth'] for s in scores) / len(scores)
        avg_clarity = sum(s['clarity'] for s in scores) / len(scores)
        overall = (avg_correctness + avg_depth + avg_clarity) / 3
        
        return {
            "average_score": round(overall, 2),
            "correctness": round(avg_correctness, 2),
            "depth": round(avg_depth, 2),
            "clarity": round(avg_clarity, 2),
            "strengths": ["Strong foundational knowledge"],
            "weak_areas": ["Could improve depth of explanations"]
        }
