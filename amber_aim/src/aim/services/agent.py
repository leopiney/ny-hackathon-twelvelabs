import json
import logging
from collections.abc import Callable

from agents import Agent, Runner, function_tool
from openai import OpenAI, api_key

from aim.models.ads import AdSearchResponse, AdSearchResult
from aim.models.placement import PlacementResult
from aim.services.s3_service import S3Service

logger = logging.getLogger(__name__)


def find_placements(prompt: str) -> PlacementResult:
    schema_str = json.dumps(PlacementResult.model_json_schema(), indent=2)

    with open(
        "/Users/leo/workspace/ny_twelvelabs_hackathon/amber_aim/prompts/agents/placements_agent.txt"
    ) as f:
        placements_agent_prompt = f.read()

    placements_agent_prompt = placements_agent_prompt.format(schema_str=schema_str)

    client = OpenAI()

    logger.info("Running OpenAI analysis")
    response = client.beta.chat.completions.parse(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": placements_agent_prompt},
            {"role": "user", "content": prompt},
        ],
        response_format=PlacementResult,
    )

    result = response.choices[0].message.parsed
    if result is None:
        raise ValueError("Failed to parse OpenAI response into PlacementResult")

    # Parse the output as PlacementResult
    return result


async def find_best_ads(
    video_id: str,
    s3_service: S3Service,
    placement_result: PlacementResult,
    search_ads_callback: Callable[[str], list[AdSearchResult]],
) -> AdSearchResponse:
    """Get ads suggestions using an AI agent with search capabilities.

    Args:
        placement_result: The placement analysis result for the video
        search_ads_callback: Callback function to search for ads

    Returns:
        AdSearchResponse containing search results
    """
    # Track all search results
    all_search_results: list[AdSearchResult] = []
    all_queries: list[str] = []

    @function_tool
    def search_ads(query_text: str) -> str:
        """Search for relevant ads based on a query text.

        This tool searches the TwelveLabs ads index for advertisements
        that match the provided query. Use this to find ads that align
        with the video's themes, keywords, style, and emotional tone.

        Args:
            query_text: The search query describing desired ad content.
                       Can include themes, keywords, styles, emotions, etc.

        Returns:
            A summary of the search results including video IDs and scores
        """
        logger.info(f"Agent searching for ads with query: {query_text}")
        all_queries.append(query_text)

        results = search_ads_callback(query_text)
        all_search_results.extend(results)

        # Return a summary for the agent to understand
        if not results:
            return f"No ads found for query: '{query_text}'"

        summary = f"Found {len(results)} ads for query '{query_text}':\n"
        for i, result in enumerate(results[:3], 1):  # Show top 3
            avg_score = result.average_score
            summary += f"{i}. Video ID: {result.id}, Avg Score: {avg_score:.2f}, Clips: {len(result.clips)}\n"

        return summary

    # Create agent instructions
    agent_instructions = """You are an expert ad selection agent that helps match relevant advertisements to video content.

Your task is to analyze the provided video placement analysis and use the search_ads tool to find the most relevant ads.

Guidelines:
1. Review the video summary, themes, keywords, artistic style, and placement details
2. Create diverse search queries that capture different aspects of the content
3. Use the search_ads tool multiple times (3-5 searches) with different query strategies:
   - Combine main themes
   - Use specific ad keywords from placement points
   - Mix artistic style with emotional tone
   - Try variations to maximize coverage
4. Focus on finding ads that match the video's tone, style, and thematic content

Be creative and thorough in your searches to find the best possible ad matches."""

    # Prepare the context from placement result
    context = f"""
Video Analysis Summary:

Summary: {placement_result.summary}

Tags: {", ".join(placement_result.tags)}

Themes: {", ".join(placement_result.themes)}

Artistic Style: {placement_result.artistic_style}

Color Tone: {placement_result.general_color_tone}

Tone Classification: {", ".join(placement_result.tone_classification)}

Number of Ad Placements Identified: {len(placement_result.placements)}

Placement Details:
"""
    for i, placement in enumerate(placement_result.placements, 1):
        context += f"\n{i}. Timestamp: {placement.timestamp}s"
        context += f"\n   Themes: {', '.join(placement.themes)}"
        context += f"\n   Ad Keywords: {', '.join(placement.ad_keywords)}"
        context += f"\n   Reason: {placement.reason}"
        context += f"\n   Situation: {placement.situation_description}\n"

    prompt = f"""{context}

Based on this video analysis, please search for relevant ads using the search_ads tool. Make multiple searches with different query strategies to find the most appropriate advertisements for this content."""

    # Create agent with search tool
    agent = Agent(
        name="AdsSearchAgent",
        instructions=agent_instructions,
        tools=[search_ads],
    )

    logger.info("Running ads search agent")
    result = await Runner.run(agent, prompt)

    logger.info(
        f"Agent completed with {len(all_search_results)} total results from {len(all_queries)} queries",
        extra={"queries": all_queries},
    )

    # Deduplicate results by video ID and merge clips
    unique_results: dict[str, AdSearchResult] = {}
    for search_result in all_search_results:
        if search_result.id not in unique_results:
            unique_results[search_result.id] = search_result
        else:
            # Merge clips if the same video appears multiple times
            unique_results[search_result.id].clips.extend(search_result.clips)

    # Sort by average score
    sorted_results = sorted(
        unique_results.values(), key=lambda x: x.average_score, reverse=True
    )

    results = AdSearchResponse(
        results=sorted_results[:10],  # Return top 10 results
        query="; ".join(all_queries),
    )

    s3_service.upload_json_file(
        f"results/ads_search_{video_id}.json",
        results.model_dump(),
    )

    return results
