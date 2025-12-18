from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import json

# 1. Setup Gemini (We use gemini-1.5-flash for text analysis)
# Ensure GOOGLE_API_KEY is in your .env file
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# 2. Define the Prompt Template (Same as before)
seo_prompt = PromptTemplate(
    input_variables=["data"],
    template="""
    You are an expert SEO Consultant. Analyze the following website metrics:
    {data}
    
    Output strictly valid JSON with two keys:
    1. "summary": A 2-sentence executive summary of the site's SEO health.
    2. "suggestions": A list of 3 specific, actionable technical improvements.
    
    Do not include markdown formatting like ```json ... ```. Just return the raw JSON.
    """
)

def analyze_with_ai(metrics: dict):
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return {
                "summary": "AI Analysis Unavailable (Missing Google API Key)",
                "suggestions": ["Add GOOGLE_API_KEY to .env file"]
            }

        # Run the Chain
        chain = LLMChain(llm=llm, prompt=seo_prompt)
        
        # Convert metrics to string
        metrics_str = json.dumps(metrics, indent=2)
        response = chain.invoke(metrics_str) # .invoke() is preferred over .run() in newer versions
        
        # Extract text content from Gemini response
        # Gemini sometimes returns extra metadata, so we ensure we get the text
        response_text = response['text'] if isinstance(response, dict) else response

        # Clean up if the model adds markdown backticks by mistake
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "summary": "Error generating AI insights.",
            "suggestions": [f"AI Error: {str(e)}"]
        }
