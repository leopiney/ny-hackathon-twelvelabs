import json
import logging
from collections.abc import Callable

from agents import Agent, Runner, function_tool
from openai import OpenAI

from aim.models.ads import AdSearchResponse, AdSearchResponseData, AdSearchResult
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

    print("--------------------------------")
    print("placements_agent_prompt\n\n")
    print(placements_agent_prompt)
    print("--------------------------------")
    print("prompt\n\n")
    print(prompt)
    print("--------------------------------")

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
    force: bool = False,
) -> list[AdSearchResponse]:
    """Get ads suggestions using an AI agent with search capabilities.

    Args:
        video_id: The video ID
        s3_service: S3 service instance
        placement_result: The placement analysis result for the video
        search_ads_callback: Callback function to search for ads
        force: If True, bypass cached results and force re-analysis

    Returns:
        List of AdSearchResponse, one per placement
    """
    # Check if results already exist in S3
    s3_path = f"results/ads_search_v2_{video_id}.json"
    existing_results = s3_service.download_json_file(s3_path)

    if existing_results is not None and not force:
        logger.info(f"Found existing results in S3: {s3_path}")
        return [AdSearchResponse.model_validate(result) for result in existing_results]

    if force and existing_results is not None:
        logger.info(f"Force flag is True, bypassing cached results in S3: {s3_path}")

    logger.info("No existing results found in S3 or force=True, proceeding with ad search")

    # Process each placement individually
    all_placement_responses: list[AdSearchResponse] = []

    for placement_idx, placement in enumerate(placement_result.placements):
        logger.info(
            f"Processing placement {placement_idx + 1}/{len(placement_result.placements)}",
            extra={"placement_timestamp": placement.timestamp},
        )

        # Track search results for this specific placement
        placement_search_data: list[AdSearchResponseData] = []

        @function_tool
        def search_ads(query_text: str) -> str:
            """Search for relevant ads based on a query text.

            This tool searches the TwelveLabs ads index for advertisements
            that match the provided query. Use this to find ads that align
            with the placement's themes, keywords, style, and emotional tone.

            Args:
                query_text: The search query describing desired ad content.
                           Can include themes, keywords, styles, emotions, etc.

            Returns:
                A summary of the search results including video IDs and scores
            """
            logger.info(f"Agent searching for ads with query: {query_text}")

            results = search_ads_callback(query_text)

            # Return a summary for the agent to understand
            if not results:
                summary = f"No ads found for query: '{query_text}'"
            else:
                summary = f"Found {len(results)} ads for query '{query_text}':\n"
                for i, result in enumerate(results[:3], 1):  # Show top 3
                    avg_score = result.average_score
                    summary += f"{i}. Video ID: {result.id}, Avg Score: {avg_score:.2f}, Clips: {len(result.clips)}\n"

            # Store the search results grouped by query
            placement_search_data.append(
                AdSearchResponseData(results=results, query=query_text)
            )

            return summary

        # Create agent instructions
        agent_instructions = """You are an expert ad selection agent that helps match relevant advertisements to specific placement points in video content.

Your task is to analyze the provided placement point details and use the search_ads tool to find the most relevant ads for this specific moment.

Guidelines:
1. Review the placement's themes, keywords, situation, and reason
2. Consider the overall video context (style, tone, themes)
3. Use the search_ads tool multiple times (3-5 searches) with different query strategies:
   - Combine placement themes with ad keywords
   - Use artistic style with placement-specific themes
   - Mix emotional tone with situation context
   - Try variations to maximize coverage
4. Focus on finding ads that match this specific placement moment

Be creative and thorough in your searches to find the best possible ad matches for this placement."""

        # Prepare the context for this specific placement
        context = f"""
Video Overall Context:

Summary: {placement_result.summary}

Artistic Style: {placement_result.artistic_style}

Color Tone: {placement_result.general_color_tone}

Tone Classification: {", ".join(placement_result.tone_classification)}

Overall Themes: {", ".join(placement_result.themes)}

---

Placement Details for Timestamp {placement.timestamp}s:

Themes: {", ".join(placement.themes)}

Ad Keywords: {", ".join(placement.ad_keywords)}

Reason: {placement.reason}

Situation: {placement.situation_description}
"""

        prompt = f"""{context}

Based on this specific placement point, please search for relevant ads using the search_ads tool. Make multiple searches (3-5 queries) with different query strategies to find the most appropriate advertisements for this placement moment."""

        print("--------------------------------")
        print(f"Placement {placement_idx + 1} - Timestamp: {placement.timestamp}s")
        print(prompt)
        print("--------------------------------")

        # Create agent with search tool
        agent = Agent(
            name="AdsSearchAgent",
            instructions=agent_instructions,
            tools=[search_ads],
        )

        logger.info(f"Running ads search agent for placement {placement_idx + 1}")
        _ = await Runner.run(agent, prompt)

        logger.info(
            f"Agent completed for placement {placement_idx + 1} with {len(placement_search_data)} queries",
            extra={"placement_timestamp": placement.timestamp},
        )

        # Create AdSearchResponse for this placement
        placement_response = AdSearchResponse(
            data=placement_search_data,
            placement=placement,
        )
        all_placement_responses.append(placement_response)

    logger.info(
        f"All placements processed. Total: {len(all_placement_responses)} placement responses"
    )

    # Save results to S3
    s3_service.upload_json_file(
        f"results/ads_search_v2_{video_id}.json",
        [response.model_dump() for response in all_placement_responses],
    )

    with open(f"data/ads_search_v2_{video_id}.json", "w") as f:
        json.dump(
            [response.model_dump() for response in all_placement_responses], f, indent=2
        )

    return all_placement_responses
