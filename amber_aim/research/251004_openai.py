import json
from pathlib import Path


from agents import Agent, Runner
from dotenv import load_dotenv

load_dotenv()

with open("video_68e1899a830688fe0b91e228.json") as f:
    data = "\n\n".join(json.load(f).values())

with open("prompts/openai/promptGPT01.txt") as f:
    prompt = f.read()


final_prompt = prompt.format(context=data)

agent = Agent(
    name="Assistant",
    instructions="You are an expert video and marketing analyst that helps teams find the optimal ad insertion points for their videos.",
)

result = Runner.run_sync(agent, final_prompt)
print(result.final_output)
