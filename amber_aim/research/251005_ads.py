# %%
from dotenv import load_dotenv

from aim.services.s3_service import S3Service
from aim.services.twelve_labs_service import TwelveLabsService

from aim.models.placement import PlacementResult
from aim.config import Settings
from aim.services.agent import find_best_ads

load_dotenv()

settings = Settings()

s3_service = S3Service(
    bucket_name=settings.aws_s3_bucket,
    region=settings.aws_region,
    base_path=settings.s3_base_path,
)

twelve_labs_service = TwelveLabsService(
    api_key=settings.twelve_labs_api_key,
    creators_index_id=settings.twelve_labs_creators_index_id,
    ads_index_id=settings.twelve_labs_ads_index_id,
    s3_service=s3_service,
)

with open("./video_68e1899a830688fe0b91e228_placement.json") as f:
    placement_result = PlacementResult.model_validate_json(f.read())

print(placement_result)

# %%

ads_response = find_best_ads(placement_result, twelve_labs_service.search_ads)

# %%
print(ads_response)

# %%
open("ads_response.json", "w").write(ads_response.model_dump_json())
